"""Metrics service for publishing Sense HAT sensor data to MQTT."""
import json
import logging
import asyncio
import signal
from typing import Optional
from sense_hat import SenseHat
import paho.mqtt.client as mqtt

from config import settings

logger = logging.getLogger(__name__)


class MetricsService:
    """Service for collecting and publishing Sense HAT metrics to MQTT."""
    
    def __init__(self):
        self.sense: Optional[SenseHat] = None
        self.mqtt_client: Optional[mqtt.Client] = None
        self._running = False
        self._publish_task: Optional[asyncio.Task] = None
        self._shutdown_event = asyncio.Event()
        self._reconnect_delay = 1  # Initial reconnect delay in seconds
        self._max_reconnect_delay = 60  # Maximum reconnect delay
        self._reconnecting = False
    
    def start(self):
        """Start the metrics service."""
        if self._running:
            logger.warning("Metrics service is already running")
            return
        
        logger.info("Starting metrics service...")
        
        # Initialize Sense HAT
        try:
            self.sense = SenseHat()
            self.sense.set_imu_config(True, True, True)  # Enable gyroscope, accelerometer, magnetometer
            logger.info("Sense HAT initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Sense HAT: {e}")
            raise
        
        # Initialize MQTT client with WebSocket transport
        try:
            self.mqtt_client = mqtt.Client(transport="websockets")
            self.mqtt_client.on_connect = self._on_connect
            self.mqtt_client.on_disconnect = self._on_disconnect
            
            logger.info(f"Connecting to MQTT broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}...")
            self.mqtt_client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
            self.mqtt_client.loop_start()
            
            # Wait a moment for connection to establish
            import time
            time.sleep(1)
            
            if not self.mqtt_client.is_connected():
                logger.error("Failed to establish MQTT connection")
                raise ConnectionError("Failed to establish MQTT connection")
            
            self._running = True
            self._shutdown_event.clear()
            
            # Start async publishing task
            loop = asyncio.get_event_loop()
            self._publish_task = loop.create_task(self._publish_metrics_loop())
            
            logger.info("Metrics service started")
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
        self._shutdown_event.set()
        
        # Cancel publish task
        if self._publish_task and not self._publish_task.done():
            self._publish_task.cancel()
        
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
            self._reconnect_delay = 1  # Reset reconnect delay on successful connection
            self._reconnecting = False
        else:
            logger.error(f"Failed to connect to MQTT broker, return code: {rc}")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback when MQTT client disconnects."""
        if rc != 0:
            logger.warning(f"Unexpected MQTT disconnection, return code: {rc}")
            # Trigger reconnection if service is still running
            if self._running and not self._shutdown_event.is_set():
                self._reconnecting = True
                # Start reconnection task
                loop = asyncio.get_event_loop()
                loop.create_task(self._reconnect_mqtt())
    
    async def _reconnect_mqtt(self):
        """Reconnect to MQTT broker with exponential backoff."""
        if not self._running or self._shutdown_event.is_set():
            return
        
        while self._running and not self._shutdown_event.is_set():
            try:
                if self.mqtt_client and self.mqtt_client.is_connected():
                    self._reconnecting = False
                    return
                
                logger.info(f"Attempting to reconnect to MQTT broker (delay: {self._reconnect_delay}s)...")
                await asyncio.sleep(self._reconnect_delay)
                
                if self.mqtt_client:
                    try:
                        self.mqtt_client.reconnect()
                        # Wait a moment for connection to establish
                        await asyncio.sleep(1)
                        if self.mqtt_client.is_connected():
                            logger.info("Successfully reconnected to MQTT broker")
                            self._reconnect_delay = 1  # Reset delay on success
                            self._reconnecting = False
                            return
                    except Exception as e:
                        logger.warning(f"Reconnection attempt failed: {e}")
                
                # Exponential backoff
                self._reconnect_delay = min(self._reconnect_delay * 2, self._max_reconnect_delay)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error during MQTT reconnection: {e}")
                await asyncio.sleep(self._reconnect_delay)
    
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
            
            logger.debug(f"Collected metrics: {metrics}")
            return metrics
        except Exception as e:
            logger.error(f"Error reading sensor metrics: {e}")
            return None
    
    async def _publish_metrics_loop(self):
        """Async loop for publishing metrics."""
        while self._running and not self._shutdown_event.is_set():
            try:
                # Check connection and attempt reconnection if needed
                if self.mqtt_client and not self.mqtt_client.is_connected() and not self._reconnecting:
                    logger.warning("MQTT client disconnected, attempting reconnection...")
                    self._reconnecting = True
                    asyncio.create_task(self._reconnect_mqtt())
                
                metrics = self._get_sensor_metrics()
                if metrics and self.mqtt_client and self.mqtt_client.is_connected():
                    payload = json.dumps(metrics)
                    result = self.mqtt_client.publish(settings.MQTT_METRICS_TOPIC, payload)
                    if result.rc == mqtt.MQTT_ERR_SUCCESS:
                        logger.debug(f"Published metrics: {metrics}")
                    else:
                        logger.warning(f"Failed to publish metrics, return code: {result.rc}")
                elif not self.mqtt_client or not self.mqtt_client.is_connected():
                    logger.debug("MQTT client not connected, skipping publish")
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error publishing metrics: {e}")
            
            # Wait for interval or shutdown event
            try:
                await asyncio.wait_for(
                    self._shutdown_event.wait(),
                    timeout=settings.METRICS_PUBLISH_INTERVAL
                )
                break  # Shutdown event was set
            except asyncio.TimeoutError:
                continue  # Timeout is expected, continue loop
    
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

