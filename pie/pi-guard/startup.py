"""Startup script - starts background processes, then FastAPI."""

import asyncio
import logging
import threading
import time

from config import settings
from core.debug import setup_debug_logging
from services import camera_service, streaming_service, metrics_service

# -------------------------------------------------------------------
# Logging
# -------------------------------------------------------------------

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format=settings.LOG_FORMAT,
    datefmt="%Y-%m-%d %H:%M:%S",
)
setup_debug_logging()
logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Process startup functions
# -------------------------------------------------------------------


def run_camera_process():
    """Run camera process in background thread."""
    try:
        logger.info("Starting camera process...")
        camera_service.start()
        logger.info("Camera process started")
        # Keep thread alive
        while True:
            time.sleep(1)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Camera process failed: {exc}", exc_info=True)


def run_metrics_process():
    """Run metrics process in background thread."""
    try:
        logger.info("Starting metrics process...")
        metrics_service.start()
        logger.info("Metrics process started")
        # Keep thread alive
        while True:
            time.sleep(1)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Metrics process failed: {exc}", exc_info=True)


def run_streaming_process():
    """Run streaming process in background thread with event loop."""
    try:
        # Wait for camera
        for _ in range(60):
            if camera_service.is_running():
                break
            time.sleep(0.5)
        
        if not camera_service.is_running():
            logger.warning("Camera not ready; skipping streaming")
            return
        
        # Create event loop for this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Start streaming service from within the running loop
        async def start_streaming():
            logger.info("Starting streaming process...")
            # Call start() synchronously but from within async context where loop is running
            streaming_service.start()
            logger.info("Streaming process started")
        
        # Run the async function which calls start() from within running loop
        loop.run_until_complete(start_streaming())
        
        # Keep loop running (the streaming service task is now running in the loop)
        loop.run_forever()
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Streaming process failed: {exc}", exc_info=True)


# -------------------------------------------------------------------
# Main startup
# -------------------------------------------------------------------


def main():
    """Start all processes, then FastAPI."""
    logger.info("=" * 60)
    logger.info("STARTING APPLICATION")
    logger.info("Starting background processes...")
    logger.info("=" * 60)
    
    # Start processes in daemon threads (completely independent of FastAPI)
    camera_thread = threading.Thread(target=run_camera_process, daemon=True, name="CameraProcess")
    camera_thread.start()
    
    metrics_thread = threading.Thread(target=run_metrics_process, daemon=True, name="MetricsProcess")
    metrics_thread.start()
    
    streaming_thread = threading.Thread(target=run_streaming_process, daemon=True, name="StreamingProcess")
    streaming_thread.start()
    
    logger.info("Background processes started (running independently)")
    logger.info("Starting FastAPI HTTP server...")
    
    # Import and run FastAPI (services are already running in background)
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL.lower(),
        reload=settings.DEBUG,
    )


if __name__ == "__main__":
    main()
