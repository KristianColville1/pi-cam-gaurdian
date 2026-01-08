"""Backend API client for metrics."""
import logging
import threading
import requests

logger = logging.getLogger(__name__)


def send_metrics_to_backend(backend_url, metrics):
    """Send metrics to backend API in a separate thread (fire-and-forget)."""
    if not backend_url:
        return
    
    def _send():
        """Send metrics in background thread."""
        try:
            url = f"{backend_url.rstrip('/')}/api/metrics/"
            response = requests.post(url, json=metrics, timeout=5)
            if response.status_code == 201:
                logger.debug("Sent metrics to backend API successfully")
            else:
                logger.warning(f"Backend API returned status {response.status_code}: {response.text}")
        except requests.exceptions.RequestException as e:
            logger.warning(f"Failed to send metrics to backend API: {e}")
        except Exception as e:
            logger.error(f"Unexpected error sending metrics to backend: {e}")
    
    # Fire and forget - start thread and return immediately
    thread = threading.Thread(target=_send, daemon=True)
    thread.start()

