# API Design

**PiCam Guardian - API Specification**

## API Overview

PiCam Guardian currently uses MQTT as the primary messaging API for sensor data. The system follows a publish-subscribe pattern for real-time data distribution.

## MQTT API

### Broker Configuration

- **Broker Address**: 145.241.195.101
- **Standard MQTT Port**: 1883
- **WebSocket Port**: 9001
- **Protocol**: MQTT 3.1.1
- **Broker Software**: Mosquitto

### Topics

#### sensors/metrics

**Description**: Real-time sensor data from Raspberry Pi Sense HAT

**Topic**: `sensors/metrics`

**Publisher**: Raspberry Pi (`metrics.py`)

**Subscribers**: Frontend web clients, future database services

**Message Format**: JSON

**Publish Frequency**: Every 2 seconds

**Message Schema**:
```json
{
  "temp_humidity": 23.5,
  "temp_pressure": 24.1,
  "humidity": 45.2,
  "pressure": 1013.25,
  "pitch": 2.3,
  "roll": -1.8,
  "yaw": 89.5,
  "accel_x": 0.02,
  "accel_y": -0.01,
  "accel_z": 0.98
}
```

**Field Descriptions**:

| Field | Type | Description | Unit |
|-------|------|-------------|------|
| `temp_humidity` | number | Temperature from humidity sensor | °C |
| `temp_pressure` | number | Temperature from pressure sensor | °C |
| `humidity` | number | Relative humidity | % |
| `pressure` | number | Atmospheric pressure | mbar |
| `pitch` | number | Orientation pitch angle | ° |
| `roll` | number | Orientation roll angle | ° |
| `yaw` | number | Orientation yaw angle | ° |
| `accel_x` | number | Acceleration on X axis | g |
| `accel_y` | number | Acceleration on Y axis | g |
| `accel_z` | number | Acceleration on Z axis | g |

**Example Message**:
```json
{
  "temp_humidity": 23.5,
  "temp_pressure": 24.1,
  "humidity": 45.2,
  "pressure": 1013.25,
  "pitch": 2.3,
  "roll": -1.8,
  "yaw": 89.5,
  "accel_x": 0.02,
  "accel_y": -0.01,
  "accel_z": 0.98
}
```

## Client Connection Examples

### Python Publisher (metrics.py)

```python
import paho.mqtt.client as mqtt
import json

mqtt_client = mqtt.Client(transport="websockets")
mqtt_client.connect("145.241.195.101", 9001, 60)
mqtt_client.loop_start()

metrics = {
    "temp_humidity": 23.5,
    "temp_pressure": 24.1,
    # ... other fields
}
payload = json.dumps(metrics)
mqtt_client.publish("sensors/metrics", payload)
```

### JavaScript Subscriber (Frontend)

```javascript
const client = new Paho.Client("145.241.195.101", 9001, "client_id");
client.connect({
    onSuccess: function() {
        client.subscribe("sensors/metrics");
    }
});

client.onMessageArrived = function(message) {
    const metrics = JSON.parse(message.payloadString);
    // Update UI with metrics
};
```

## Future API Considerations

- REST API for historical data access (Release 2)
- WebSocket API for bidirectional control commands (future)
- Authentication and authorization APIs (security enhancements)
- Configuration API for system settings

## API Documentation Notes

- Current implementation focuses on sensor data publishing
- No authentication currently implemented (planned for future releases)
- Message format is version 1.0 (subject to change in future releases)
- API stability is not guaranteed until Release 2

---

**Navigation**

[← Previous Section](data-flow.md) | [Table of Contents](index.md) | [Next Section →](security.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)
