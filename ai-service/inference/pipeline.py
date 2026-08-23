import httpx
from PIL import Image
from io import BytesIO
from .detector import GarbageDetector
from .classifier import HierarchicalClassifier
from .severity import compute_severity


class AIPipeline:
    def __init__(self, detector_path: str):
        self.detector = GarbageDetector(detector_path)
        self.classifier = HierarchicalClassifier()

    async def download_image(self, url: str) -> Image.Image:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            return Image.open(BytesIO(response.content))

    def run_pipeline(self, image: Image.Image, manual_size_estimate: str | None = None):
        # 1. Detect garbage regions
        detections = self.detector.detect(image)
        
        # 2. If nothing detected, return defaults
        if not detections:
            return {
                "wasteTypes": [],
                "severityScore": 0.0,
                "tier": 4,
                "hazardFlags": [],
                "volumeM3": 0.0,
                "category": None,
                "sizeEstimate": manual_size_estimate,
                "macroCategory": None,
                "microCategory": None,
            }

        # 3. Classify each detected region using hierarchical MobileCLIP
        classifications = []
        for det in detections:
            box = det["box"] # x1, y1, x2, y2
            
            # Clamp box to image dimensions
            x1 = max(0, int(box[0]))
            y1 = max(0, int(box[1]))
            x2 = min(image.width, int(box[2]))
            y2 = min(image.height, int(box[3]))
            
            # Avoid invalid boxes
            if x2 <= x1 or y2 <= y1:
                continue
                
            crop = image.crop((x1, y1, x2, y2))
            
            cls_result = self.classifier.classify(crop)
            classifications.append(cls_result)
            
        # 4. Compute severity (uses legacy "class" field — unchanged)
        severity_result = compute_severity(detections, classifications)
        
        # 5. Compile unique waste classes (legacy)
        unique_classes = list(set([c["class"] for c in classifications]))
        
        # Determine category (most severe — unchanged logic)
        category = "Recyclable"
        if "hazardous" in unique_classes:
            category = "Hazardous"
        elif "non-recyclable" in unique_classes:
            category = "Non-recyclable"
        elif "organic" in unique_classes:
            category = "Organic"

        # 6. Aggregate hierarchical labels (NEW)
        #    Pick the macro/micro from the highest-confidence crop
        best_crop = max(classifications, key=lambda c: c["macro_score"])
        macro_category = best_crop["macro_label"]
        micro_category = best_crop.get("micro_label")
            
        # Determine size estimate if not manually provided
        size_estimate = manual_size_estimate
        if not size_estimate:
            # simple heuristic: use box count as a proxy for now
            count = len(detections)
            if count >= 4:
                size_estimate = "LARGE"
            elif count >= 2:
                size_estimate = "MEDIUM"
            else:
                size_estimate = "SMALL"
        
        return {
            "wasteTypes": unique_classes,
            "severityScore": severity_result["severityScore"],
            "tier": severity_result["logisticsTier"],
            "hazardFlags": severity_result["hazardFlags"],
            "volumeM3": len(detections) * 0.1, # Dummy volume estimate
            "category": category,
            "sizeEstimate": size_estimate,
            "macroCategory": macro_category,
            "microCategory": micro_category,
        }
