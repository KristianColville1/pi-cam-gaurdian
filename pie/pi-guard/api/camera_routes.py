"""Camera operation API routes."""
import asyncio
import logging
import subprocess
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


@router.get(
    "/camera/capture",
    response_model=CaptureResponse,
    tags=["Camera"],
    summary="Capture image from camera",
    description="Capture a snapshot image from the Raspberry Pi camera. Returns the captured image file path or uploaded URL.",
    response_description="Image capture response with file path or URL",
    status_code=200,
)
async def capture_image(request: Request):
    """
    Capture a snapshot image from the camera.
    
    Returns:
        CaptureResponse: Response containing success status, file path, and optional URL if uploaded to storage.
    """
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
        
        def save_image():
            """Save frame as JPEG, converting RGBA to RGB if needed."""
            img = Image.fromarray(frame)
            # Convert RGBA to RGB if needed (JPEG doesn't support alpha channel)
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.save(str(file_path), "JPEG", quality=85)
        
        await loop.run_in_executor(None, save_image)
        
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


@router.get(
    "/camera/recording/start",
    tags=["Camera"],
    summary="Start video recording",
    description="Start recording video from the Raspberry Pi camera. Recording will be saved as MP4 format.",
    response_description="Recording start confirmation with file path",
    status_code=200,
)
async def start_recording(request: Request):
    """
    Start video recording.
    
    Returns:
        dict: Response containing success status, message, and file path for the recording.
    """
    camera_service = getattr(request.app.state, 'camera_service', None)
    storage_service = getattr(request.app.state, 'storage_service', None)
    
    if not camera_service:
        raise HTTPException(status_code=503, detail="Camera service not available")
    
    if not camera_service.is_running():
        raise HTTPException(status_code=503, detail="Camera not running")
    
    if camera_service.is_recording():
        raise HTTPException(status_code=409, detail="Recording already in progress")
    
    try:
        # Generate filename (will be changed to .mp4 by camera service)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"recording_{timestamp}.mp4"
        
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


@router.get(
    "/camera/recording/stop",
    response_model=CaptureResponse,
    tags=["Camera"],
    summary="Stop video recording",
    description="Stop the current video recording and upload the MP4 file to storage. Returns the file path or uploaded URL.",
    response_description="Recording stop response with file path or URL",
    status_code=200,
)
async def stop_recording(request: Request):
    """
    Stop video recording and upload MP4 to storage.
    
    Returns:
        CaptureResponse: Response containing success status, file path, and optional URL if uploaded to storage.
    """
    camera_service = getattr(request.app.state, 'camera_service', None)
    storage_service = getattr(request.app.state, 'storage_service', None)
    
    if not camera_service:
        raise HTTPException(status_code=503, detail="Camera service not available")
    
    if not camera_service.is_recording():
        raise HTTPException(status_code=409, detail="No recording in progress")
    
    try:
        # Stop recording (returns MP4 file path - recorded directly with metadata)
        mp4_path = camera_service.stop_recording()
        if not mp4_path or not mp4_path.exists():
            raise HTTPException(status_code=500, detail="Recording file not found")
        
        logger.info(f"Recording saved to MP4: {mp4_path}")
        
        # Upload MP4 to storage
        url = None
        if storage_service:
            video_info = await storage_service.upload_video(mp4_path)
            if video_info:
                # Return video info URL if available
                url = video_info.get('url') or video_info.get('videoLibraryId')
        
        return CaptureResponse(
            success=True,
            file_path=str(mp4_path) if not url else None,
            url=url,
            message="Recording stopped and uploaded successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping recording: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to stop recording: {str(e)}")


@router.get(
    "/camera/recording/status",
    response_model=RecordingStatus,
    tags=["Camera"],
    summary="Get recording status",
    description="Get the current recording status indicating whether a recording is in progress.",
    response_description="Current recording status",
    status_code=200,
)
async def get_recording_status(request: Request):
    """
    Get current recording status.
    
    Returns:
        RecordingStatus: Response containing recording status (is_recording boolean).
    """
    camera_service = getattr(request.app.state, 'camera_service', None)
    
    if not camera_service:
        return RecordingStatus(is_recording=False)
    
    is_recording = camera_service.is_recording()
    return RecordingStatus(is_recording=is_recording)


