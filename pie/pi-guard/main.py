"""FastAPI application - HTTP API only, no service management."""

import logging

from fastapi import FastAPI

from api.routes import router
from api.camera_routes import router as camera_router
from config import settings
from core.debug import setup_debug_logging
from services import camera_service, streaming_service, metrics_service, storage_service

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
# FastAPI application - HTTP API only
# -------------------------------------------------------------------

app = FastAPI(
    title=settings.APP_NAME,
    description="Guardian service for Pi Camera and Sense HAT sensors",
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# Expose services for routes (services are started externally)
app.state.camera_service = camera_service
app.state.streaming_service = streaming_service
app.state.metrics_service = metrics_service
app.state.storage_service = storage_service

app.include_router(router)
app.include_router(camera_router)


# -------------------------------------------------------------------
# Main Entry Point
# -------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    logger.info("=" * 60)
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"HTTP API server only - services must be started separately")
    logger.info("=" * 60)

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL.lower(),
        reload=settings.DEBUG,
    )
