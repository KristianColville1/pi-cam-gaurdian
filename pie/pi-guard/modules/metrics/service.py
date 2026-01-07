"""Metrics service for publishing Sense HAT sensor data to MQTT."""
import json
import logging
import threading
import time
from typing import Optional
from sense_hat import SenseHat
import paho.mqtt.client as mqtt
import requests

from config import settings

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
        
        # Initialize MQTT client
        try:
            self.mqtt_client = mqtt.Client(transport="websockets")
            self.mqtt_client.on_connect = self._on_connect
            self.mqtt_client.on_disconnect = self._on_disconnect
            
            logger.info(f"Connecting to MQTT broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}...")
            self.mqtt_client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
            self.mqtt_client.loop_start()
            
            # Wait for connection
            time.sleep(1)
            
            if not self.mqtt_client.is_connected():
                logger.error("Failed to establish MQTT connection")
                raise ConnectionError("Failed to establish MQTT connection")
            
            self._running = True
            self._shutdown_flag = False
            
            # Start publish thread
            self._publish_thread = threading.Thread(target=self._publish_metrics, daemon=True)
            self._publish_thread.start()
            
            logger.info(f"Metrics service started - publishing to topic: {settings.MQTT_METRICS_TOPIC}")
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
            # Try to reconnect
            if self._running:
                try:
                    self.mqtt_client.reconnect()
                except Exception as e:
                    logger.error(f"Failed to reconnect: {e}")
    
    def _get_sensor_metrics(self) -> Optional[dict]:
        """Read all sensor metrics from Sense HAT."""
        try:
            metrics = {
                "temp_humidity": round(self.sense.get_temperature_from_humidity(), 1),
                "temp_pressure": round(self.sense.get_temperature_from_pressure(), 1),
                "humidity": round(self.sense.get_humidity(), 1),
                "pressure": round(self.sense.get_pressure(), 2),
            }
            
            # Get orientation (pitch, roll, yaw)
            orientation = self.sense.get_orientation()
            metrics["pitch"] = round(orientation["pitch"], 1)
            metrics["roll"] = round(orientation["roll"], 1)
            metrics["yaw"] = round(orientation["yaw"], 1)
            
            # Get acceleration
            acceleration = self.sense.get_accelerometer_raw()
            metrics["accel_x"] = round(acceleration["x"], 2)
            metrics["accel_y"] = round(acceleration["y"], 2)
            metrics["accel_z"] = round(acceleration["z"], 2)
            
            return metrics
        except Exception as e:
            logger.error(f"Error reading sensor metrics: {e}")
            return None
    
    def _send_metrics_to_backend(self, metrics: dict):
        """Send metrics to backend API asynchronously (non-blocking)."""
        if not settings.BACKEND_API_URL:
            return
        
        def _send_in_thread():
            """Send metrics in a separate thread to avoid blocking."""
            try:
                url = f"{settings.BACKEND_API_URL.rstrip('/')}/api/metrics/"
                response = requests.post(url, json=metrics, timeout=5)
                if response.status_code == 201:
                    logger.debug(f"Sent metrics to backend API successfully")
                else:
                    logger.warning(f"Backend API returned status {response.status_code}: {response.text}")
            except requests.exceptions.RequestException as e:
                logger.warning(f"Failed to send metrics to backend API: {e}")
            except Exception as e:
                logger.error(f"Unexpected error sending metrics to backend: {e}")
        
        # Fire and forget - run in a daemon thread
        send_thread = threading.Thread(target=_send_in_thread, daemon=True)
        send_thread.start()
    
    def _publish_metrics(self):
        """Publish sensor metrics to MQTT broker and backend API."""
        while not self._shutdown_flag:
            try:
                metrics = self._get_sensor_metrics()
                if metrics:
                    # Send to MQTT
                    if self.mqtt_client and self.mqtt_client.is_connected():
                        payload = json.dumps(metrics)
                        result = self.mqtt_client.publish(settings.MQTT_METRICS_TOPIC, payload)
                        if result.rc == mqtt.MQTT_ERR_SUCCESS:
                            logger.info(f"Published metrics to {settings.MQTT_METRICS_TOPIC}: {payload}")
                        else:
                            logger.warning(f"Failed to publish metrics, return code: {result.rc}")
                    elif not self.mqtt_client or not self.mqtt_client.is_connected():
                        logger.warning("MQTT client not connected, skipping publish")
                    
                    # Send to backend API
                    self._send_metrics_to_backend(metrics)
                else:
                    logger.warning("Failed to collect metrics, skipping publish")
            except Exception as e:
                logger.error(f"Error publishing metrics: {e}")
            
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
