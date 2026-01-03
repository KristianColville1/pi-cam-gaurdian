"""Lifecycle management for services."""
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class LifecycleManager:
    """Manages the lifecycle of all services in the application."""
    
    def __init__(self):
        self.services: Dict[str, Any] = {}
        logger.debug("LifecycleManager initialized")
    
    def register_service(self, name: str, service: Any):
        """Register a service with the lifecycle manager."""
        self.services[name] = service
        logger.debug(f"Registered service: {name}")
    
    def get_service(self, name: str) -> Optional[Any]:
        """Get a registered service by name."""
        return self.services.get(name)
    
    def get_all_services(self) -> Dict[str, Any]:
        """Get all registered services."""
        return self.services.copy()
    
    def get_service_status(self, name: str) -> Dict[str, Any]:
        """Get status of a specific service."""
        service = self.services.get(name)
        if service is None:
            return {"status": "not_found"}
        
        # Try to get status from service if it has a get_status method
        if hasattr(service, "get_status"):
            try:
                return service.get_status()
            except Exception as e:
                logger.error(f"Error getting status for {name}: {e}")
                return {"status": "error", "error": str(e)}
        
        # Default status
        return {"status": "active"}

