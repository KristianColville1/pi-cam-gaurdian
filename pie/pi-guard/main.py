"""Main FastAPI application entry point."""
import logging
from fastapi import FastAPI
from modules.camera.service import CameraService
from modules.streaming.service import StreamingService
from modules.metrics.service import MetricsService
from config import settings
from api.routes import router


# -------------------------------------------------------------------
# Logging Configuration
# -------------------------------------------------------------------

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format=settings.LOG_FORMAT,
    datefmt="%Y-%m-%d %H:%M:%S"
)
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

# -------------------------------------------------------------------
# Services (singletons)
# -------------------------------------------------------------------

camera_service = CameraService()
streaming_service = StreamingService(camera_service)
metrics_service = MetricsService()

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

    camera_service.start()
    streaming_service.start()
    metrics_service.start()

    logger.info("All services started")

@app.on_event("shutdown")
async def on_shutdown():
    logger.info("Stopping services...")

    metrics_service.stop()
    streaming_service.stop()
    camera_service.stop()

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
