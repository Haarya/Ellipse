import numpy as np
import torch
from transformers import pipeline
from PIL import Image
from sklearn.linear_model import RANSACRegressor
import logging

logger = logging.getLogger("uvicorn")

class VolumeEstimator:
    def __init__(self):
        logger.info("Loading Depth Anything V2 (Small) for volume estimation...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Load the depth estimator pipeline
        self.depth_estimator = pipeline(
            task="depth-estimation",
            model="depth-anything/Depth-Anything-V2-Small-hf",
            device=0 if self.device == "cuda" else -1
        )
        logger.info(f"Depth model loaded successfully on {self.device}.")

    def estimate_depth(self, image: Image.Image) -> np.ndarray:
        """
        Runs the depth estimation model and returns a depth map (numpy array)
        matching the image dimensions.
        """
        result = self.depth_estimator(image)
        # The result typically contains 'depth' as a PIL Image.
        depth_map = np.array(result["depth"], dtype=np.float32)
        
        # NOTE: Depth Anything V2 typically outputs relative depth. 
        # For this MVP, we treat these values (or inverse) as a proxy for metric depth
        # or apply a dummy scaling factor to get values in a reasonable metric range (0 - 10 meters).
        # Normalizing relative depth to 0-1 and scaling to an assumed 5m range:
        depth_map = (depth_map - depth_map.min()) / (depth_map.max() - depth_map.min() + 1e-8)
        # Inverse mapping: closer objects have higher values in some models, lower in others.
        # Depth Anything V2 outputs disparity (closer = brighter/higher).
        # We invert it to get depth Z (closer = smaller Z).
        depth_z = 5.0 * (1.0 - depth_map) + 0.5  # Range ~0.5m to 5.5m
        
        return depth_z

    def unproject_and_integrate(self, depth_z: np.ndarray, mask: np.ndarray, metadata: dict) -> dict:
        """
        1. Pinhole unprojection
        2. RANSAC ground plane fitting
        3. Height-field volume integration
        """
        H, W = depth_z.shape
        
        # Extract metadata with fallbacks
        zoom = metadata.get("zoomRatio", 1.0)
        f_base = metadata.get("focalLength", 26.0) # Assume 26mm eq. wide angle
        sensor_w = metadata.get("sensorWidth", 6.4) # mm
        sensor_h = metadata.get("sensorHeight", 4.8) # mm
        
        # Pinhole normalization
        f_eff = f_base * zoom
        
        # Convert focal length in mm to focal length in pixels
        fx = (f_eff / sensor_w) * W
        fy = (f_eff / sensor_h) * H
        cx, cy = W / 2, H / 2
        
        # Create pixel grid (u, v)
        u, v = np.meshgrid(np.arange(W), np.arange(H))
        
        # 1. Pinhole Transformation
        X = (u - cx) * depth_z / fx
        Y = (v - cy) * depth_z / fy
        Z = depth_z
        
        # Flatten for point cloud operations
        points = np.stack((X.flatten(), Y.flatten(), Z.flatten()), axis=1)
        mask_flat = mask.flatten()
        
        # Separate waste pixels and background pixels
        waste_points = points[mask_flat > 0]
        background_points = points[mask_flat == 0]
        
        # Fallback if waste covers >85% of the frame (insufficient background)
        waste_ratio = np.sum(mask > 0) / (W * H)
        
        if waste_ratio > 0.85 or len(background_points) < 100:
            logger.warning("Waste covers >85% of frame. Using Z_max orthogonal plane fallback.")
            # Ground plane is orthogonal to Z-axis, placed at the max Z of the waste
            z_max = np.max(waste_points[:, 2]) if len(waste_points) > 0 else 5.0
            # Plane equation: Z = z_max -> 0*X + 0*Y + 1*Z - z_max = 0
            a, b, c = 0, 0, 1
            d = -z_max
        else:
            # 2. RANSAC Ground Plane Fitting on background
            try:
                # We fit Y = f(X, Z) because in camera coordinates, Y is usually up/down.
                # Actually, RANSACRegressor expects X_train, y_train.
                # Let's fit Z = aX + bY + d => Z - aX - bY - d = 0
                ransac = RANSACRegressor(residual_threshold=0.1, random_state=42)
                X_train = background_points[:, [0, 1]]
                y_train = background_points[:, 2]
                ransac.fit(X_train, y_train)
                a, b = ransac.estimator_.coef_
                d_intercept = ransac.estimator_.intercept_
                # Plane: aX + bY - Z + d = 0
                c = -1
                d = d_intercept
            except Exception as e:
                logger.error(f"RANSAC failed: {e}. Using fallback.")
                a, b, c, d = 0, 0, 1, -np.max(waste_points[:, 2]) if len(waste_points) > 0 else -5.0

        if len(waste_points) == 0:
            return {"volumeM3": 0.0, "dimensions": {"widthMeters": 0.0, "lengthMeters": 0.0, "peakHeightMeters": 0.0}}

        # 3. Height-Field Volume Integration
        # Distance from point (X, Y, Z) to plane aX + bY + cZ + d = 0
        norm = np.sqrt(a**2 + b**2 + c**2)
        heights = np.abs(a * waste_points[:, 0] + b * waste_points[:, 1] + c * waste_points[:, 2] + d) / norm
        
        # Calculate metric pixel footprint at depth Z
        # Area_pixel = (Z / fx) * (Z / fy)
        areas = (waste_points[:, 2] / fx) * (waste_points[:, 2] / fy)
        
        # Volume = Sum(Height * Area)
        volume_m3 = np.sum(heights * areas)
        
        # Estimate bounding dimensions
        width_m = np.max(waste_points[:, 0]) - np.min(waste_points[:, 0])
        length_m = np.max(waste_points[:, 2]) - np.min(waste_points[:, 2]) # depth span
        peak_height_m = np.max(heights)

        return {
            "volumeM3": float(volume_m3),
            "dimensions": {
                "widthMeters": float(width_m),
                "lengthMeters": float(length_m),
                "peakHeightMeters": float(peak_height_m)
            }
        }

    def estimate_volume(self, image: Image.Image, detections: list, metadata: dict) -> dict:
        """
        End-to-end volume estimation for a given image and YOLO detections.
        """
        if not detections:
             return {"volumeM3": 0.0, "dimensions": {"widthMeters": 0.0, "lengthMeters": 0.0, "peakHeightMeters": 0.0}}
             
        # Generate 2D boundary mask from YOLO detections (union of bounding boxes as fallback to exact segmentation masks)
        # Note: If YOLO produces masks, use them. If only boxes, rasterize boxes into a mask.
        W, H = image.size
        mask = np.zeros((H, W), dtype=np.uint8)
        for det in detections:
            # Assuming det["box"] = [x1, y1, x2, y2]
            box = det["box"]
            x1, y1 = max(0, int(box[0])), max(0, int(box[1]))
            x2, y2 = min(W, int(box[2])), min(H, int(box[3]))
            mask[y1:y2, x1:x2] = 255
            
        depth_z = self.estimate_depth(image)
        metrics = self.unproject_and_integrate(depth_z, mask, metadata)
        
        # Cap volume to realistic bounds (e.g. max 50 m3) to prevent extreme outliers from noise
        metrics["volumeM3"] = min(50.0, metrics["volumeM3"])
        
        return metrics
