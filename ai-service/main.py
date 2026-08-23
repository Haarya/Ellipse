import os
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
from inference.pipeline import AIPipeline
import logging

load_dotenv()

app = FastAPI(title="Ellipse AI Service")
logger = logging.getLogger("uvicorn")

# Load pipeline globally (pre-warms MobileCLIP at startup)
try:
    pipeline = AIPipeline("../best.onnx")
    logger.info("Successfully loaded YOLO detector + MobileCLIP classifier.")
except Exception as e:
    logger.error(f"Failed to load models: {e}")
    # Still start app, but calls will fail if models aren't loaded properly
    pipeline = None

BACKEND_WEBHOOK_URL = os.getenv("BACKEND_WEBHOOK_URL", "http://localhost:3000/api/v1/internal/complaints")
INTERNAL_SECRET = os.getenv("INTERNAL_SECRET", "ellipse-ai-webhook-secret-67890")

class AnalyzeRequest(BaseModel):
    complaintId: str
    imageUrl: str
    sizeEstimate: str | None = None

async def process_image_and_webhook(complaint_id: str, image_url: str, size_estimate: str | None = None):
    if not pipeline:
        logger.error("Pipeline not initialized, cannot process.")
        return
        
    try:
        # 1. Download image
        image = await pipeline.download_image(image_url)
        
        # 2. Run AI pipeline
        results = pipeline.run_pipeline(image, size_estimate)
        logger.info(f"Analysis results for {complaint_id}: {results}")
        
        # 3. Send results to backend webhook
        webhook_url = f"{BACKEND_WEBHOOK_URL}/{complaint_id}/ai-results"
        headers = {"x-ai-service-secret": INTERNAL_SECRET}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.patch(webhook_url, json=results, headers=headers)
            resp.raise_for_status()
            logger.info(f"Successfully posted results for {complaint_id} to backend.")
            
    except Exception as e:
        logger.error(f"Error processing {complaint_id}: {str(e)}")

@app.post("/analyze")
async def analyze_image(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Accepts an image URL and complaint ID.
    Downloads the image, runs the detector and classifier models, 
    and posts the results back to the NestJS backend webhook asynchronously.
    """
    if not pipeline:
        raise HTTPException(status_code=500, detail="Models not loaded")
        
    background_tasks.add_task(process_image_and_webhook, request.complaintId, request.imageUrl, request.sizeEstimate)
    
    return {"status": "processing", "complaintId": request.complaintId}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
