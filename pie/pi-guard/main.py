"""Main FastAPI application entry point."""
import logging
import signal
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from config import settings
from core.lifecycle import LifecycleManager
from modules.camera.service import CameraService
from modules.metrics.service import MetricsService
from modules.streaming.service import StreamingService


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
# Lifecycle Management
# -------------------------------------------------------------------

lifecycle_manager = LifecycleManager()
camera_service: CameraService | None = None
metrics_service: MetricsService | None = None
streaming_service: StreamingService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle (startup and shutdown)."""
    global camera_service, metrics_service, streaming_service
    
    # Startup
    logger.info("Starting Pi Guardian Service...")
    logger.info(f"App: {settings.APP_NAME} v{settings.APP_VERSION}")
    
    try:
        # Initialize camera service
        if settings.CAMERA_ENABLED:
            logger.info("Initializing camera service...")
            camera_service = CameraService()
            camera_service.start()
            logger.info("Camera service initialized")
        
        # Initialize metrics service (will be implemented in MetricsService)
        logger.info("Initializing metrics service...")
        metrics_service = MetricsService(
            broker=settings.MQTT_BROKER,
            port=settings.MQTT_PORT,
            topic=settings.MQTT_METRICS_TOPIC,
            publish_interval=settings.METRICS_PUBLISH_INTERVAL
        )
        await metrics_service.start()
        logger.info("Metrics service initialized")
        
        # Initialize streaming service (will be implemented in StreamingService)
        logger.info("Initializing streaming service...")
        streaming_service = StreamingService(
            rtsp_url=settings.RTSP_URL,
            camera_service=camera_service,
            resolution=settings.STREAM_RESOLUTION,
            framerate=settings.STREAM_FRAMERATE,
            bitrate=settings.STREAM_BITRATE
        )
        await streaming_service.start()
        logger.info("Streaming service initialized")
        
        # Register services with lifecycle manager
        lifecycle_manager.register_service("camera", camera_service)
        lifecycle_manager.register_service("metrics", metrics_service)
        lifecycle_manager.register_service("streaming", streaming_service)
        
        logger.info("All services started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start services: {e}", exc_info=True)
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Pi Guardian Service...")
    
    try:
        # Shutdown services in reverse order
        if streaming_service:
            await streaming_service.stop()
            logger.info("Streaming service stopped")
        
        if metrics_service:
            await metrics_service.stop()
            logger.info("Metrics service stopped")
        
        if camera_service:
            camera_service.stop()
            logger.info("Camera service stopped")
        
        logger.info("All services stopped successfully")
        
    except Exception as e:
        logger.error(f"Error during shutdown: {e}", exc_info=True)


# -------------------------------------------------------------------
# FastAPI Application
# -------------------------------------------------------------------

app = FastAPI(
    title=settings.APP_NAME,
    description="Guardian service for Pi Camera and Sense HAT sensors",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    debug=settings.DEBUG,
)


# -------------------------------------------------------------------
# Signal Handlers
# -------------------------------------------------------------------

def signal_handler(sig, frame):
    """Handle shutdown signals gracefully."""
    logger.info(f"Received signal {sig}, initiating shutdown...")
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


# -------------------------------------------------------------------
# API Routes
# -------------------------------------------------------------------

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    status = {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
    
    # Add service statuses
    if camera_service:
        status["camera"] = {"status": "active" if camera_service.is_running() else "inactive"}
    
    if metrics_service:
        status["metrics"] = await metrics_service.get_status()
    
    if streaming_service:
        status["streaming"] = await streaming_service.get_status()
    
    return JSONResponse(content=status)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }


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
