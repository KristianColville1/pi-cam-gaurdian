"""Camera operation API routes."""
import asyncio
import logging
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter()


class CaptureResponse(BaseModel):
    """Response model for capture operations."""
    success: bool
    file_path: Optional[str] = None
    url: Optional[str] = None
    message: Optional[str] = None


class RecordingStatus(BaseModel):
    """Recording status model."""
    is_recording: bool
    duration: Optional[float] = None
    file_path: Optional[str] = None


@router.post("/camera/capture", response_model=CaptureResponse)
async def capture_image(request: Request):
    """Capture a snapshot image from the camera."""
    camera_service = getattr(request.app.state, 'camera_service', None)
    storage_service = getattr(request.app.state, 'storage_service', None)
    
    if not camera_service:
        raise HTTPException(status_code=503, detail="Camera service not available")
    
    if not camera_service.is_running():
        raise HTTPException(status_code=503, detail="Camera not running")
    
    try:
        # Capture frame
        frame = await camera_service.capture_frame()
        
        # Save to temporary file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"snapshot_{timestamp}.jpg"
        
        if storage_service:
            file_path = storage_service.get_tmp_path(filename)
        else:
            file_path = Path("/tmp") / filename
        
        # Save image (blocking operation in executor)
        from PIL import Image
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: Image.fromarray(frame).save(str(file_path), "JPEG", quality=85)
        )
        
        # Upload to storage if available
        url = None
        if storage_service:
            url = await storage_service.upload_image(file_path)
        
        return CaptureResponse(
            success=True,
            file_path=str(file_path) if not url else None,
            url=url,
            message="Image captured successfully"
        )
        
    except Exception as e:
        logger.error(f"Error capturing image: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to capture image: {str(e)}")


@router.post("/camera/record/start")
async def start_recording(request: Request):
    """Start video recording."""
    camera_service = getattr(request.app.state, 'camera_service', None)
    
    if not camera_service:
        raise HTTPException(status_code=503, detail="Camera service not available")
    
    if not camera_service.is_running():
        raise HTTPException(status_code=503, detail="Camera not running")
    
    # Check if already recording
    recording_service = getattr(request.app.state, 'recording_service', None)
    if recording_service and recording_service.is_recording():
        raise HTTPException(status_code=409, detail="Recording already in progress")
    
    # TODO: Implement recording service
    raise HTTPException(status_code=501, detail="Recording not yet implemented")


@router.post("/camera/record/stop", response_model=CaptureResponse)
async def stop_recording(request: Request):
    """Stop video recording and upload to storage."""
    recording_service = getattr(request.app.state, 'recording_service', None)
    storage_service = getattr(request.app.state, 'storage_service', None)
    
    if not recording_service:
        raise HTTPException(status_code=503, detail="Recording service not available")
    
    if not recording_service.is_recording():
        raise HTTPException(status_code=409, detail="No recording in progress")
    
    # TODO: Implement recording stop and upload
    raise HTTPException(status_code=501, detail="Recording not yet implemented")


@router.get("/camera/record/status", response_model=RecordingStatus)
async def get_recording_status(request: Request):
    """Get current recording status."""
    recording_service = getattr(request.app.state, 'recording_service', None)
    
    if not recording_service:
        return RecordingStatus(is_recording=False)
    
    # TODO: Implement recording status
    return RecordingStatus(is_recording=False)


@router.get("/camera/image/{filename}")
async def get_image(request: Request, filename: str):
    """Get a captured image file (if not yet uploaded)."""
    storage_service = getattr(request.app.state, 'storage_service', None)
    
    if not storage_service:
        raise HTTPException(status_code=503, detail="Storage service not available")
    
    file_path = storage_service.get_tmp_path(filename)
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path, media_type="image/jpeg")

