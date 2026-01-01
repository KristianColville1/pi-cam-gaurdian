# Architecture Overview

**PiCam Guardian - System Architecture**

## High-Level Architecture

PiCam Guardian follows a client-server architecture with three primary components:

1. **Raspberry Pi (Edge Device)**
   - Camera module for video capture
   - Sense HAT for environmental and motion sensor data
   - Local services for data collection and transmission

2. **Cloud Server (Oracle Cloud Free Tier)**
   - MediaMTX server for RTSP/WebRTC video streaming
   - Mosquitto MQTT broker for sensor data messaging
   - Web server hosting frontend interface

3. **Frontend Client**
   - Web browser-based interface
   - Real-time video playback via WebRTC
   - Real-time sensor data display via MQTT WebSocket

## System Architecture Diagram

*[Placeholder for architecture diagram showing: Raspberry Pi → Cloud Server → Frontend with data flow paths]*

The architecture diagram will illustrate:
- Raspberry Pi with camera and Sense HAT components
- Network connections to cloud server
- Cloud server components (MediaMTX, Mosquitto, Web Server)
- Frontend client connections
- Data flow paths for video streaming and sensor data

## Architecture Principles

- **Edge Computing**: Data collection and initial processing at the Raspberry Pi edge device
- **Cloud Processing**: Centralized video streaming and message brokering on cloud infrastructure
- **Real-Time Communication**: Low-latency protocols (WebRTC, MQTT WebSocket) for live data delivery
- **Separation of Concerns**: Video streaming and sensor data use separate communication channels
- **Scalable Infrastructure**: Cloud-based components allow for future scaling and expansion

---

**Navigation**

[← Previous Section](index.md) | [Table of Contents](index.md) | [Next Section →](components.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)
