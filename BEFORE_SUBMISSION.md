# Before Submission Checklist

## Missing Image Placeholders

This document lists all image placeholders that need to be created before submission.

### System Design Document (SDD)

#### docs/SDD/architecture.md

- Architecture diagram showing: Raspberry Pi → Cloud Server → Frontend with data flow paths

#### docs/SDD/components.md

- Component interaction diagram showing relationships between hardware and software components

#### docs/SDD/network.md

- Network diagram showing: Local Network (Raspberry Pi) → Internet → Oracle Cloud (VCN, Subnets, Security Groups)
- Detailed network diagram showing: IP addresses, port mappings, protocol flows, security boundaries

#### docs/SDD/data-flow.md

- Video streaming flow diagram showing: Camera → rpicam-vid → ffmpeg → RTSP → MediaMTX → WebRTC → Browser
- Sensor data flow diagram showing: Sense HAT → metrics.py → MQTT (1883) → Mosquitto → MQTT WebSocket (9001) → Browser → Table Update
- Comprehensive data flow diagram showing both video and sensor data flows in parallel

#### docs/SDD/security.md

- Security architecture diagram showing: current security boundaries, attack surfaces, planned security enhancements

#### docs/SDD/deployment.md

- Deployment architecture diagram showing: Raspberry Pi deployment, Cloud server deployment, service configurations
- Deployment diagram showing: Infrastructure components, service locations, network connections, configuration files
