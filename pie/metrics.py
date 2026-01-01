#!/usr/bin/env python3
"""
Sense HAT Metrics Publisher
Publishes sensor data from Raspberry Pi Sense HAT to MQTT broker via WebSocket.
"""
import json
import time
import signal
import sys
import logging
from sense_hat import SenseHat
import paho.mqtt.client as mqtt

# Configure logging for systemd
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# MQTT Configuration
MQTT_BROKER = "145.241.195.101"
MQTT_PORT = 9001  # WebSocket port
MQTT_TOPIC = "sensors/metrics"
PUBLISH_INTERVAL = 2  # seconds

# Global variables
sense = None
mqtt_client = None
shutdown_flag = False

def signal_handler(sig, frame):
    """Handle shutdown signals gracefully."""
    global shutdown_flag
    logger.info("Received shutdown signal, shutting down...")
    shutdown_flag = True
    if mqtt_client:
        mqtt_client.disconnect()

def on_connect(client, userdata, flags, rc):
    """Callback when MQTT client connects."""
    if rc == 0:
        logger.info(f"Connected to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
    else:
        logger.error(f"Failed to connect to MQTT broker, return code: {rc}")

def on_disconnect(client, userdata, rc):
    """Callback when MQTT client disconnects."""
    if rc != 0:
        logger.warning(f"Unexpected MQTT disconnection, return code: {rc}")

def get_sensor_metrics():
    """Read all sensor metrics from Sense HAT."""
    try:
        metrics = {
            "temp_humidity": round(sense.get_temperature_from_humidity(), 1),
            "temp_pressure": round(sense.get_temperature_from_pressure(), 1),
            "humidity": round(sense.get_humidity(), 1),
            "pressure": round(sense.get_pressure(), 2),
        }
        
        # Get orientation (pitch, roll, yaw)
        orientation = sense.get_orientation()
        metrics["pitch"] = round(orientation["pitch"], 1)
        metrics["roll"] = round(orientation["roll"], 1)
        metrics["yaw"] = round(orientation["yaw"], 1)
        
        # Get acceleration
        acceleration = sense.get_accelerometer_raw()
        metrics["accel_x"] = round(acceleration["x"], 2)
        metrics["accel_y"] = round(acceleration["y"], 2)
        metrics["accel_z"] = round(acceleration["z"], 2)
        
        logger.info(f"Collected metrics: {metrics}")
        return metrics
    except Exception as e:
        logger.error(f"Error reading sensor metrics: {e}")
        return None

def publish_metrics():
    """Publish sensor metrics to MQTT broker."""
    global mqtt_client
    
    while not shutdown_flag:
        try:
            metrics = get_sensor_metrics()
            if metrics and mqtt_client and mqtt_client.is_connected():
                payload = json.dumps(metrics)
                result = mqtt_client.publish(MQTT_TOPIC, payload)
                if result.rc == mqtt.MQTT_ERR_SUCCESS:
                    logger.debug(f"Published metrics: {metrics}")
                else:
                    logger.warning(f"Failed to publish metrics, return code: {result.rc}")
            elif not mqtt_client or not mqtt_client.is_connected():
                logger.warning("MQTT client not connected, skipping publish")
        except Exception as e:
            logger.error(f"Error publishing metrics: {e}")
        
        time.sleep(PUBLISH_INTERVAL)

def main():
    """Main entry point."""
    global sense, mqtt_client, shutdown_flag
    
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    logger.info("Starting Sense HAT metrics publisher...")
    
    # Initialize Sense HAT
    try:
        sense = SenseHat()
        sense.set_imu_config(True, True, True)  # Enable gyroscope, accelerometer, magnetometer
        logger.info("Sense HAT initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Sense HAT: {e}")
        sys.exit(1)
    
    # Initialize MQTT client with WebSocket transport
    try:
        mqtt_client = mqtt.Client(transport="websockets")
        mqtt_client.on_connect = on_connect
        mqtt_client.on_disconnect = on_disconnect
        
        logger.info(f"Connecting to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}...")
        mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
        mqtt_client.loop_start()
        
        # Wait a moment for connection to establish
        time.sleep(1)
        
        if not mqtt_client.is_connected():
            logger.error("Failed to establish MQTT connection")
            sys.exit(1)
        
        # Start publishing metrics
        publish_metrics()
        
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
    finally:
        shutdown_flag = True
        if mqtt_client:
            mqtt_client.loop_stop()
            mqtt_client.disconnect()
        logger.info("Metrics publisher stopped.")

if __name__ == "__main__":
    main()
