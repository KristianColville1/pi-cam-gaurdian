"""Metrics service for publishing Sense HAT sensor data to MQTT."""
import asyncio
import json
import logging
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
        self._publish_task: Optional[asyncio.Task] = None
        self._reconnect_task: Optional[asyncio.Task] = None
        self._shutdown_event = asyncio.Event()
        
        # Reconnection state
        self._reconnect_delay = 2.0  # Start with 2 seconds
        self._max_reconnect_delay = 60.0  # Max 60 seconds
        self._reconnect_backoff_multiplier = 1.5
        self._connection_failures = 0
        self._publishing_paused = False
    
    async def start(self):
        """Start the metrics service asynchronously."""
        if self._running:
            logger.warning("Metrics service is already running")
            return
        
        logger.info("Starting metrics service...")
        self._running = True
        self._shutdown_event.clear()
        
        # Initialize Sense HAT (blocking, but fast)
        try:
            self.sense = SenseHat()
            self.sense.set_imu_config(True, True, True)
            logger.info("Sense HAT initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Sense HAT: {e}")
            raise
        
        # Initialize MQTT client
        await self._initialize_mqtt()
        
        # Start publish task
        loop = asyncio.get_event_loop()
        self._publish_task = loop.create_task(self._publish_metrics_loop())
        
        logger.info(f"Metrics service started - publishing to topic: {settings.MQTT_METRICS_TOPIC}")
    
    async def _initialize_mqtt(self):
        """Initialize and connect MQTT client."""
        try:
            self.mqtt_client = mqtt.Client(transport="websockets")
            self.mqtt_client.on_connect = self._on_connect
            self.mqtt_client.on_disconnect = self._on_disconnect
            
            logger.info(f"Connecting to MQTT broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}...")
            
            # Connect in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.mqtt_client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
            )
            
            # Start MQTT loop in executor
            await loop.run_in_executor(None, self.mqtt_client.loop_start)
            
            # Wait a moment for connection
            await asyncio.sleep(1)
            
            if not self.mqtt_client.is_connected():
                logger.warning("MQTT connection not established immediately, will retry...")
                self._publishing_paused = True
                self._connection_failures += 1
                await self._start_reconnect_task()
            else:
                logger.info("MQTT connection established successfully")
                self._publishing_paused = False
                self._connection_failures = 0
                self._reconnect_delay = 2.0  # Reset delay on success
                
        except Exception as e:
            logger.error(f"Failed to initialize MQTT client: {e}")
            self._publishing_paused = True
            self._connection_failures += 1
            await self._start_reconnect_task()
    
    async def _start_reconnect_task(self):
        """Start or restart the reconnection task."""
        if self._reconnect_task and not self._reconnect_task.done():
            return  # Already running
        
        loop = asyncio.get_event_loop()
        self._reconnect_task = loop.create_task(self._reconnect_loop())
    
    async def _reconnect_loop(self):
        """Background task to reconnect MQTT with exponential backoff."""
        while self._running and not self._shutdown_event.is_set():
            if self.mqtt_client and self.mqtt_client.is_connected():
                # Already connected, stop reconnecting
                self._publishing_paused = False
                self._connection_failures = 0
                self._reconnect_delay = 2.0
                return
            
            try:
                # Wait with exponential backoff
                delay = min(self._reconnect_delay, self._max_reconnect_delay)
                logger.info(f"Attempting MQTT reconnect in {delay:.1f}s (attempt {self._connection_failures + 1})...")
                
                try:
                    await asyncio.wait_for(self._shutdown_event.wait(), timeout=delay)
                    return  # Shutdown requested
                except asyncio.TimeoutError:
                    pass  # Continue to reconnect
                
                if not self._running:
                    return
                
                # Try to reconnect
                if self.mqtt_client is None:
                    await self._initialize_mqtt()
                else:
                    loop = asyncio.get_event_loop()
                    try:
                        await loop.run_in_executor(None, self.mqtt_client.reconnect)
                        await asyncio.sleep(1)  # Wait for connection
                        
                        if self.mqtt_client.is_connected():
                            logger.info("MQTT reconnected successfully")
                            self._publishing_paused = False
                            self._connection_failures = 0
                            self._reconnect_delay = 2.0  # Reset on success
                            return
                        else:
                            raise ConnectionError("Reconnect did not establish connection")
                            
                    except Exception as e:
                        logger.warning(f"MQTT reconnect attempt failed: {e}")
                        self._connection_failures += 1
                        # Exponential backoff
                        self._reconnect_delay *= self._reconnect_backoff_multiplier
                
            except Exception as e:
                logger.error(f"Error in reconnect loop: {e}", exc_info=True)
                await asyncio.sleep(5)  # Fallback delay
    
    async def stop(self):
        """Stop the metrics service."""
        if not self._running:
            return
        
        logger.info("Stopping metrics service...")
        self._running = False
        self._shutdown_event.set()
        
        # Cancel tasks
        if self._publish_task and not self._publish_task.done():
            self._publish_task.cancel()
            try:
                await self._publish_task
            except asyncio.CancelledError:
                pass
        
        if self._reconnect_task and not self._reconnect_task.done():
            self._reconnect_task.cancel()
            try:
                await self._reconnect_task
            except asyncio.CancelledError:
                pass
        
        # Disconnect MQTT
        if self.mqtt_client:
            try:
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(None, self.mqtt_client.loop_stop)
                await loop.run_in_executor(None, self.mqtt_client.disconnect)
            except Exception as e:
                logger.error(f"Error disconnecting MQTT client: {e}")
            finally:
                self.mqtt_client = None
        
        logger.info("Metrics service stopped")
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback when MQTT client connects."""
        if rc == 0:
            logger.info(f"Connected to MQTT broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}")
            self._publishing_paused = False
            self._connection_failures = 0
            self._reconnect_delay = 2.0  # Reset delay on success
        else:
            logger.error(f"Failed to connect to MQTT broker, return code: {rc}")
            self._publishing_paused = True
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback when MQTT client disconnects."""
        if rc != 0:
            logger.warning(f"Unexpected MQTT disconnection, return code: {rc}")
            self._publishing_paused = True
            # Start reconnection task if not already running
            if self._running:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(self._start_reconnect_task())
    
    def _get_sensor_metrics(self) -> Optional[dict]:
        """Read all sensor metrics from Sense HAT (blocking operation)."""
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
    
    async def _send_metrics_to_backend(self, metrics: dict):
        """Send metrics to backend API asynchronously (non-blocking)."""
        if not settings.BACKEND_API_URL:
            return
        
        async def _send():
            """Send metrics in executor to avoid blocking."""
            try:
                url = f"{settings.BACKEND_API_URL.rstrip('/')}/api/metrics/"
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: requests.post(url, json=metrics, timeout=5)
                )
                if response.status_code == 201:
                    logger.debug("Sent metrics to backend API successfully")
                else:
                    logger.warning(f"Backend API returned status {response.status_code}: {response.text}")
            except requests.exceptions.RequestException as e:
                logger.warning(f"Failed to send metrics to backend API: {e}")
            except Exception as e:
                logger.error(f"Unexpected error sending metrics to backend: {e}", exc_info=True)
        
        # Fire and forget
        asyncio.create_task(_send())
    
    async def _publish_metrics_loop(self):
        """Async loop for publishing sensor metrics to MQTT broker and backend API."""
        while self._running and not self._shutdown_event.is_set():
            try:
                # Read metrics (blocking, but fast - run in executor if needed)
                loop = asyncio.get_event_loop()
                metrics = await loop.run_in_executor(None, self._get_sensor_metrics)
                
                if metrics:
                    # Only try to publish if not paused (connection is good)
                    if not self._publishing_paused and self.mqtt_client and self.mqtt_client.is_connected():
                        payload = json.dumps(metrics)
                        
                        # Publish in executor (blocking operation)
                        try:
                            result = await loop.run_in_executor(
                                None,
                                lambda: self.mqtt_client.publish(settings.MQTT_METRICS_TOPIC, payload)
                            )
                            
                            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                                logger.info(f"Published metrics to {settings.MQTT_METRICS_TOPIC}: {payload}")
                            else:
                                logger.warning(f"Failed to publish metrics, return code: {result.rc}")
                                # Trigger reconnection
                                self._publishing_paused = True
                                await self._start_reconnect_task()
                        except Exception as e:
                            logger.error(f"Error publishing to MQTT: {e}")
                            self._publishing_paused = True
                            await self._start_reconnect_task()
                    elif self._publishing_paused:
                        # Connection is down, metrics are being collected but not published
                        logger.debug("MQTT connection down, metrics collection paused (backing off)")
                        # Reconnect task should already be running, but ensure it is
                        await self._start_reconnect_task()
                    
                    # Always send to backend API (independent of MQTT)
                    await self._send_metrics_to_backend(metrics)
                else:
                    logger.warning("Failed to collect metrics, skipping publish")
                    
            except Exception as e:
                logger.error(f"Error in metrics publish loop: {e}", exc_info=True)
            
            # Wait for next interval
            try:
                await asyncio.wait_for(
                    self._shutdown_event.wait(),
                    timeout=settings.METRICS_PUBLISH_INTERVAL
                )
                break  # Shutdown requested
            except asyncio.TimeoutError:
                continue  # Continue loop
    
    async def get_status(self) -> dict:
        """Get the current status of the metrics service."""
        return {
            "status": "running" if self._running else "stopped",
            "mqtt_connected": self.mqtt_client.is_connected() if self.mqtt_client else False,
            "publishing_paused": self._publishing_paused,
            "sense_hat_initialized": self.sense is not None,
        }
    
    def is_running(self) -> bool:
        """Check if the service is running."""
        return self._running
