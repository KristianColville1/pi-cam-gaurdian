"""API routes for Pi Guardian service."""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from config import settings

router = APIRouter()


@router.get("/health")
async def health_check(request: Request):
    """Health check endpoint."""
    camera_service = getattr(request.app.state, 'camera_service', None)
    metrics_service = getattr(request.app.state, 'metrics_service', None)
    streaming_service = getattr(request.app.state, 'streaming_service', None)
    
    status = {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
    
    # Add service statuses
    if camera_service:
        try:
            camera_running = camera_service.is_running()
            status["camera"] = {"status": "active" if camera_running else "inactive"}
        except Exception as e:
            status["camera"] = {"status": "error", "error": str(e)}
    
    if metrics_service:
        try:
            status["metrics"] = await metrics_service.get_status()
        except Exception as e:
            status["metrics"] = {"status": "error", "error": str(e)}
    
    if streaming_service:
        try:
            status["streaming"] = await streaming_service.get_status()
        except Exception as e:
            status["streaming"] = {"status": "error", "error": str(e)}
    
    return JSONResponse(content=status)


@router.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }
