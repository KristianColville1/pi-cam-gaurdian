"""Utility functions for metrics service."""
import logging

logger = logging.getLogger(__name__)


def get_sensor_metrics(sense_hat):
    """Read all sensor metrics from Sense HAT."""
    try:
        metrics = {
            "temp_humidity": round(sense_hat.get_temperature_from_humidity(), 1),
            "temp_pressure": round(sense_hat.get_temperature_from_pressure(), 1),
            "humidity": round(sense_hat.get_humidity(), 1),
            "pressure": round(sense_hat.get_pressure(), 2),
        }
        
        # Get orientation (pitch, roll, yaw)
        orientation = sense_hat.get_orientation()
        metrics["pitch"] = round(orientation["pitch"], 1)
        metrics["roll"] = round(orientation["roll"], 1)
        metrics["yaw"] = round(orientation["yaw"], 1)
        
        # Get acceleration
        acceleration = sense_hat.get_accelerometer_raw()
        metrics["accel_x"] = round(acceleration["x"], 2)
        metrics["accel_y"] = round(acceleration["y"], 2)
        metrics["accel_z"] = round(acceleration["z"], 2)
        
        return metrics
    except Exception as e:
        logger.error(f"Error reading sensor metrics: {e}")
        return None

