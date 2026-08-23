import httpx
from PIL import Image
from io import BytesIO
import asyncio
from concurrent.futures import ThreadPoolExecutor
from .detector import GarbageDetector
from .classifier import HierarchicalClassifier
from .severity import compute_severity
import numpy as np


class AIPipeline:
    def __init__(self, detector_path: str):
        self.detector = GarbageDetector(detector_path)
        self.classifier = HierarchicalClassifier()
        # Thread pool for CPU-bound or non-async models
        self.executor = ThreadPoolExecutor(max_workers=2)

    async def download_image(self, url: str) -> Image.Image:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
            image.load() # Force decode to prevent lazy-loading thread issues
            return image.convert("RGB")

    async def run_pipeline(self, image: Image.Image, metadata: dict):
        """
        Executes YOLO and then runs MobileCLIP sequentially on crops.
        """
        loop = asyncio.get_event_loop()
        
        # 1. Detect garbage regions
        detections = await loop.run_in_executor(self.executor, self.detector.detect, image)
        
        manual_size_estimate = metadata.get("sizeEstimate")
        
        if not detections:
            return {
                "classification": {
                    "macroCategory": None,
                    "macroConfidence": 0.0,
                    "microCategory": None,
                    "microConfidence": 0.0,
                    "wasteTypes": []
                },
                "spatialMetrics": {
                    "volumeM3": 0.0,
                    "volumeConfidence": "LOW",
                    "dimensions": {
                        "widthMeters": 0.0,
                        "lengthMeters": 0.0,
                        "peakHeightMeters": 0.0
                    }
                },
                "dispatchRecommendation": {
                    "severityScore": 0.0,
                    "tier": 4,
                    "hazardFlags": [],
                    "action": "NO DISPATCH REQUIRED"
                }
            }

        W, H = image.size
        
        classifications = []
        for det in detections:
            box = det["box"] # x1, y1, x2, y2
            
            x1 = max(0, int(box[0]))
            y1 = max(0, int(box[1]))
            x2 = min(W, int(box[2]))
            y2 = min(H, int(box[3]))
            
            if x2 <= x1 or y2 <= y1:
                continue
            
            # Run MobileCLIP on the crop
            crop = image.crop((x1, y1, x2, y2))
            cls_result = self.classifier.classify(crop)
            classifications.append(cls_result)
            
        # 2. Compute severity (no volume metrics passed)
        severity_result = compute_severity(detections, classifications)
        unique_classes = list(set([c["class"] for c in classifications]))
        
        # 3. Aggregate hierarchical labels (best crop)
        if classifications:
            best_crop = max(classifications, key=lambda c: c["macro_score"])
            macro_cat = best_crop["macro_label"]
            macro_conf = best_crop["macro_score"]
            micro_cat = best_crop.get("micro_label")
            micro_conf = best_crop.get("micro_score")
        else:
            macro_cat = None
            macro_conf = 0.0
            micro_cat = None
            micro_conf = 0.0
            
        # Dummy volume estimation proxy using bounding box count
        dummy_volume = len(detections) * 0.1
        
        action = "STANDARD COLLECTION"
        h_flags = severity_result["hazardFlags"]
        
        if h_flags:
            action = "HAZMAT DISPATCH"
        elif dummy_volume > 2.0:
            action = "HEAVY MACHINERY DISPATCH"
        elif severity_result["severityScore"] > 0.75:
            action = "CRITICAL DISPATCH"

        return {
            "classification": {
                "macroCategory": macro_cat,
                "macroConfidence": macro_conf,
                "microCategory": micro_cat,
                "microConfidence": micro_conf,
                "wasteTypes": unique_classes
            },
            "spatialMetrics": {
                "volumeM3": round(dummy_volume, 2),
                "volumeConfidence": "LOW",
                "dimensions": {
                    "widthMeters": 0.0,
                    "lengthMeters": 0.0,
                    "peakHeightMeters": 0.0
                }
            },
            "dispatchRecommendation": {
                "severityScore": severity_result["severityScore"],
                "tier": severity_result["logisticsTier"],
                "hazardFlags": severity_result["hazardFlags"],
                "action": action
            }
        }
