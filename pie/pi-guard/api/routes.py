"""API routes for Pi Guardian service."""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from typing import List, Dict, Any

from config import settings

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check(request: Request):
    """
    Health check endpoint.
    
    Returns the health status of the service and all its components.
    """
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


@router.get("/", tags=["Info"])
async def root():
    """
    Root endpoint.
    
    Returns basic service information.
    """
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }


@router.get("/endpoints", tags=["Info"])
async def get_endpoints(request: Request) -> Dict[str, Any]:
    """
    Get available endpoints.
    
    Returns a list of all available API endpoints with their methods and paths.
    This endpoint conforms to OpenAPI spec and can be used to discover available routes.
    """
    endpoints: List[Dict[str, Any]] = []
    
    for route in request.app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            methods = list(route.methods) if route.methods else []
            # Filter out OPTIONS method (automatically added by FastAPI)
            methods = [m for m in methods if m != "OPTIONS"]
            
            if methods:
                endpoint_info: Dict[str, Any] = {
                    "path": route.path,
                    "methods": methods,
                }
                
                # Add summary and description if available
                if hasattr(route, 'summary'):
                    endpoint_info["summary"] = route.summary
                if hasattr(route, 'description'):
                    endpoint_info["description"] = route.description
                if hasattr(route, 'tags') and route.tags:
                    endpoint_info["tags"] = route.tags
                
                endpoints.append(endpoint_info)
    
    return JSONResponse(content={
        "endpoints": endpoints,
        "count": len(endpoints),
        "openapi_spec": "/docs",
        "openapi_json": "/openapi.json",
    })
