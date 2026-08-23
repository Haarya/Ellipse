import sys
import asyncio
import json
from PIL import Image
from inference.pipeline import AIPipeline
import logging

logging.basicConfig(level=logging.INFO)

async def main():
    if len(sys.argv) < 2:
        print("Usage: python test_pipeline.py <path_to_image>")
        sys.exit(1)
        
    image_path = sys.argv[1]
    
    print(f"Loading image from {image_path}...")
    try:
        # 1. Load image locally (bypassing download_image)
        image = Image.open(image_path).convert("RGB")
    except Exception as e:
        print(f"Failed to load image: {e}")
        sys.exit(1)
        
    print("Initializing AI Pipeline (YOLO, MobileCLIP, DepthAnythingV2)...")
    # Initialize the pipeline (assumes best.onnx is in the parent directory)
    pipeline = AIPipeline("../best.onnx")
    
    # Dummy EXIF metadata (simulating what the mobile app sends)
    metadata = {
        "sizeEstimate": "LARGE",
        "focalLength": 26.0,
        "sensorWidth": 5.76,
        "sensorHeight": 4.29,
        "zoomRatio": 1.0
    }
    
    print("Running pipeline inference (this may take a few seconds)...")
    # 2. Run the async pipeline
    result = await pipeline.run_pipeline(image, metadata)
    
    print("\n================ AI PIPELINE RESULT ================\n")
    print(json.dumps(result, indent=2))
    print("\n====================================================\n")

if __name__ == "__main__":
    asyncio.run(main())
