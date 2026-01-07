"""Main FastAPI application entry point."""
import asyncio
import logging
from fastapi import FastAPI
from modules.camera.service import CameraService
from modules.streaming.service import StreamingService
from modules.metrics.service import MetricsService
from modules.storage.service import StorageService
from config import settings
from api.routes import router
from api.camera_routes import router as camera_router
from core.debug import setup_debug_logging


# -------------------------------------------------------------------
# Logging Configuration
# -------------------------------------------------------------------

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format=settings.LOG_FORMAT,
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Set up debug file logging (after basicConfig to add file handler)
setup_debug_logging()

logger = logging.getLogger(__name__)


# -------------------------------------------------------------------
# FastAPI Application
# -------------------------------------------------------------------

app = FastAPI(
    title=settings.APP_NAME,
    description="Guardian service for Pi Camera and Sense HAT sensors",
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# Include API routes
app.include_router(router)
app.include_router(camera_router)

# -------------------------------------------------------------------
# Services (singletons)
# -------------------------------------------------------------------

camera_service = CameraService()
streaming_service = StreamingService(camera_service)
metrics_service = MetricsService()
storage_service = StorageService()

# -------------------------------------------------------------------
# Lifecycle
# -------------------------------------------------------------------

@app.on_event("startup")
async def on_startup():
    logger.info("Starting services...")

    # Store services in app.state for route access
    app.state.camera_service = camera_service
    app.state.streaming_service = streaming_service
    app.state.metrics_service = metrics_service
    app.state.storage_service = storage_service

    await camera_service.start()
    streaming_service.start()
    await metrics_service.start()

    logger.info("All services started")

@app.on_event("shutdown")
async def on_shutdown():
    logger.info("Stopping services...")

    # Stop services with timeout to prevent hanging
    try:
        await asyncio.wait_for(metrics_service.stop(), timeout=3.0)
    except asyncio.TimeoutError:
        logger.warning("Metrics service stop timed out")
    except Exception as e:
        logger.error(f"Error stopping metrics service: {e}")
    
    try:
        streaming_service.stop()  # Synchronous, should be fast
    except Exception as e:
        logger.error(f"Error stopping streaming service: {e}")
    
    try:
        await asyncio.wait_for(camera_service.stop(), timeout=3.0)
    except asyncio.TimeoutError:
        logger.warning("Camera service stop timed out")
    except Exception as e:
        logger.error(f"Error stopping camera service: {e}")

    logger.info("All services stopped")

# -------------------------------------------------------------------
# Main Entry Point
# -------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL.lower(),
        reload=settings.DEBUG,
    )
