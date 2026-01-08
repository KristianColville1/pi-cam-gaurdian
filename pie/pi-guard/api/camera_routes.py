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


@router.get("/camera/capture", response_model=CaptureResponse)
async def capture_image(request: Request):
    """Capture a snapshot image from the camera."""
    logger.info("Capture endpoint called")
    camera_service = getattr(request.app.state, 'camera_service', None)
    storage_service = getattr(request.app.state, 'storage_service', None)
    
    if not camera_service:
        logger.error("Camera service not available")
        raise HTTPException(status_code=503, detail="Camera service not available")
    
    if not camera_service.is_running():
        logger.error("Camera not running")
        raise HTTPException(status_code=503, detail="Camera not running")
    
    try:
        logger.info("Starting frame capture...")
        # Capture frame
        frame = await camera_service.capture_frame()
        logger.info(f"Frame captured, shape: {frame.shape if frame is not None else 'None'}")
        
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


@router.get("/camera/recording/start")
async def start_recording(request: Request):
    """Start video recording."""
    camera_service = getattr(request.app.state, 'camera_service', None)
    storage_service = getattr(request.app.state, 'storage_service', None)
    
    if not camera_service:
        raise HTTPException(status_code=503, detail="Camera service not available")
    
    if not camera_service.is_running():
        raise HTTPException(status_code=503, detail="Camera not running")
    
    if camera_service.is_recording():
        raise HTTPException(status_code=409, detail="Recording already in progress")
    
    try:
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"recording_{timestamp}.h264"
        
        # Get temp path
        if storage_service:
            file_path = storage_service.get_tmp_path(filename)
        else:
            file_path = Path("/tmp") / filename
        
        # Start recording
        success = camera_service.start_recording(file_path)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to start recording")
        
        return JSONResponse(content={
            "success": True,
            "message": "Recording started",
            "file_path": str(file_path)
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting recording: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to start recording: {str(e)}")


@router.get("/camera/recording/stop", response_model=CaptureResponse)
async def stop_recording(request: Request):
    """Stop video recording and upload to storage."""
    camera_service = getattr(request.app.state, 'camera_service', None)
    storage_service = getattr(request.app.state, 'storage_service', None)
    
    if not camera_service:
        raise HTTPException(status_code=503, detail="Camera service not available")
    
    if not camera_service.is_recording():
        raise HTTPException(status_code=409, detail="No recording in progress")
    
    try:
        # Stop recording
        file_path = camera_service.stop_recording()
        if not file_path or not file_path.exists():
            raise HTTPException(status_code=500, detail="Recording file not found")
        
        # Upload to storage
        url = None
        if storage_service:
            video_info = await storage_service.upload_video(file_path)
            if video_info:
                # Return video info URL if available
                url = video_info.get('url') or video_info.get('videoLibraryId')
        
        return CaptureResponse(
            success=True,
            file_path=str(file_path) if not url else None,
            url=url,
            message="Recording stopped and uploaded successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping recording: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to stop recording: {str(e)}")


@router.get("/camera/recording/status", response_model=RecordingStatus)
async def get_recording_status(request: Request):
    """Get current recording status."""
    camera_service = getattr(request.app.state, 'camera_service', None)
    
    if not camera_service:
        return RecordingStatus(is_recording=False)
    
    is_recording = camera_service.is_recording()
    return RecordingStatus(is_recording=is_recording)


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

