"""Metrics service for publishing Sense HAT sensor data to MQTT."""
import json
import logging
import threading
import time
from typing import Optional
from sense_hat import SenseHat
import paho.mqtt.client as mqtt

from config import settings
from .utils import get_sensor_metrics
from .backend_client import send_metrics_to_backend

logger = logging.getLogger(__name__)


class MetricsService:
    """Service for collecting and publishing Sense HAT metrics to MQTT."""
    
    def __init__(self):
        self.sense: Optional[SenseHat] = None
        self.mqtt_client: Optional[mqtt.Client] = None
        self._running = False
        self._publish_thread: Optional[threading.Thread] = None
        self._shutdown_flag = False
    
    def start(self):
        """Start the metrics service."""
        if self._running:
            logger.warning("Metrics service is already running")
            return
        
        logger.info("Starting metrics service...")
        
        # Initialize Sense HAT
        try:
            self.sense = SenseHat()
            self.sense.set_imu_config(True, True, True)
            logger.info("Sense HAT initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Sense HAT: {e}")
            raise
        
        # Initialize MQTT client (non-blocking)
        try:
            self.mqtt_client = mqtt.Client(transport="websockets")
            self.mqtt_client.on_connect = self._on_connect
            self.mqtt_client.on_disconnect = self._on_disconnect
            
            logger.info(f"Connecting to MQTT broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}...")
            # Use connect_async so DNS/TCP connect can't block startup.
            # loop_start() runs the network loop in a background thread.
            self.mqtt_client.connect_async(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
            self.mqtt_client.loop_start()
            
            # Don't wait for connection - let it connect in background
            # The service will start and attempt to publish when connected
            self._running = True
            self._shutdown_flag = False
            
            # Start publish thread
            self._publish_thread = threading.Thread(target=self._publish_metrics_loop, daemon=True)
            self._publish_thread.start()
            
            logger.info(f"Metrics service started - publishing to topic: {settings.MQTT_METRICS_TOPIC} (MQTT connecting in background)")
        except Exception as e:
            logger.error(f"Failed to start metrics service: {e}")
            self.stop()
            raise
    
    def stop(self):
        """Stop the metrics service."""
        if not self._running:
            return
        
        logger.info("Stopping metrics service...")
        self._running = False
        self._shutdown_flag = True
        
        # Wait for publish thread to finish
        if self._publish_thread and self._publish_thread.is_alive():
            self._publish_thread.join(timeout=5)
        
        # Disconnect MQTT
        if self.mqtt_client:
            try:
                self.mqtt_client.loop_stop()
                self.mqtt_client.disconnect()
            except Exception as e:
                logger.error(f"Error disconnecting MQTT client: {e}")
            finally:
                self.mqtt_client = None
        
        logger.info("Metrics service stopped")
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback when MQTT client connects."""
        if rc == 0:
            logger.info(f"Connected to MQTT broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}")
        else:
            logger.error(f"Failed to connect to MQTT broker, return code: {rc}")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback when MQTT client disconnects."""
        if rc != 0:
            logger.warning(f"Unexpected MQTT disconnection, return code: {rc}")
    
    def _publish_metrics_loop(self):
        """Publish sensor metrics to MQTT broker and backend API."""
        while not self._shutdown_flag:
            try:
                metrics = get_sensor_metrics(self.sense)
                
                if metrics:
                    # Publish to MQTT if connected
                    if self.mqtt_client and self.mqtt_client.is_connected():
                        payload = json.dumps(metrics)
                        result = self.mqtt_client.publish(settings.MQTT_METRICS_TOPIC, payload)
                        if result.rc == mqtt.MQTT_ERR_SUCCESS:
                            logger.debug(f"Published metrics to {settings.MQTT_METRICS_TOPIC}: {payload}")
                        else:
                            logger.warning(f"Failed to publish metrics to {settings.MQTT_METRICS_TOPIC}, return code: {result.rc}")
                    
                    # Send to backend API (fire-and-forget)
                    send_metrics_to_backend(settings.BACKEND_API_URL, metrics)
                else:
                    logger.warning("Failed to collect metrics, skipping publish")
                    
            except Exception as e:
                logger.error(f"Error in metrics publish loop: {e}")
            
            # Wait for next interval
            time.sleep(settings.METRICS_PUBLISH_INTERVAL)
    
    async def get_status(self) -> dict:
        """Get the current status of the metrics service."""
        return {
            "status": "running" if self._running else "stopped",
            "mqtt_connected": self.mqtt_client.is_connected() if self.mqtt_client else False,
            "sense_hat_initialized": self.sense is not None,
        }
    
    def is_running(self) -> bool:
        """Check if the service is running."""
        return self._running
