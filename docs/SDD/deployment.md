# Deployment Architecture

**PiCam Guardian - Deployment & Infrastructure**

## Deployment Overview

PiCam Guardian is deployed across two primary environments: the Raspberry Pi edge device and the Oracle Cloud Infrastructure server.

## Deployment Architecture Diagram

*[Placeholder for deployment architecture diagram showing: Raspberry Pi deployment, Cloud server deployment, service configurations]*

## Raspberry Pi Deployment

### Hardware Requirements

- Raspberry Pi board (model with camera support)
- Raspberry Pi Camera Module
- Sense HAT add-on board
- Network connectivity (WiFi or Ethernet)
- Power supply
- SD card for operating system

### Software Deployment

#### Operating System

- Raspberry Pi OS (recommended)
- Linux-based distribution with camera and Sense HAT support

#### Service Deployment (systemd)

Services are deployed as systemd units for automatic startup and management:

**stream.py Service**

- **Service File**: `/etc/systemd/system/stream.service` (planned)
- **Purpose**: Camera streaming service
- **Configuration**: Auto-start on boot, restart on failure
- **Dependencies**: rpicam-vid, ffmpeg

**metrics.py Service**

- **Service File**: `/etc/systemd/system/metrics.service` (planned)
- **Purpose**: Sensor data collection and publishing
- **Configuration**: Auto-start on boot, restart on failure
- **Dependencies**: sense-hat Python package, paho-mqtt Python package

#### Installation Steps

1. Install operating system and dependencies
2. Configure camera module and Sense HAT
3. Install Python dependencies (`pip install paho-mqtt`)
4. Deploy service files to systemd
5. Enable and start services
6. Configure network connectivity

## Cloud Server Deployment

### Infrastructure

- **Provider**: Oracle Cloud Infrastructure (Free Tier)
- **Instance Type**: VM.Standard.E2.1.Micro (Free Tier eligible)
- **Operating System**: Ubuntu 22.04 LTS
- **Public IP**: 145.241.195.101
- **Region**: Oracle Cloud region (specific region TBD)

### Service Deployment

#### MediaMTX (Video Streaming Server)

- **Installation**: Downloaded and configured MediaMTX binary
- **Service**: systemd service for automatic management
- **Configuration**: `/etc/mediamtx/mediamtx.yml`
- **Ports**: 8554 (RTSP), 8889 (WebRTC)
- **Status**: Enabled and running

#### Mosquitto (MQTT Broker)

- **Installation**: `sudo apt install mosquitto mosquitto-clients`
- **Service**: systemd service (`mosquitto.service`)
- **Configuration**: `/etc/mosquitto/mosquitto.conf`
- **Ports**: 1883 (standard MQTT), 9001 (WebSocket)
- **Status**: Enabled and running

**Mosquitto Configuration Highlights**:
```
listener 1883
protocol mqtt

listener 9001
protocol websockets
```

#### Web Server

- **Status**: Basic web server for frontend hosting
- **Future**: Planned enhancement for Release 2

### Network Configuration

#### Oracle Cloud Network Security Groups (NSG)

- Configured ingress rules for required ports
- Configured egress rules for outbound traffic
- Security list rules for additional protection

#### Server Firewall (iptables)

- Rules configured and persisted in `/etc/iptables/rules.v4`
- Rules restored on system boot
- Connection state tracking enabled

#### Port Configuration

| Service | Port | Protocol | Configuration Method |
|---------|------|----------|---------------------|
| RTSP | 8554 | TCP | iptables + NSG |
| WebRTC | 8889 | TCP | NSG |
| MQTT | 1883 | TCP | iptables + NSG |
| MQTT WebSocket | 9001 | TCP | iptables + NSG |
| SSH | 22 | TCP | NSG (default) |

### Deployment Process

1. Provision Oracle Cloud instance
2. Configure network security groups
3. Install and configure MediaMTX
4. Install and configure Mosquitto
5. Configure firewall rules (iptables)
6. Deploy and configure systemd services
7. Test connectivity and functionality
8. Deploy frontend files

## Deployment Diagram

*[Placeholder for deployment diagram showing: Infrastructure components, service locations, network connections, configuration files]*

## Deployment Checklist

### Raspberry Pi

- [ ] Operating system installed
- [ ] Camera module configured
- [ ] Sense HAT configured
- [ ] Python dependencies installed
- [ ] Services configured (systemd)
- [ ] Network connectivity verified
- [ ] Services tested and running

### Cloud Server

- [ ] Oracle Cloud instance provisioned
- [ ] Network security groups configured
- [ ] MediaMTX installed and configured
- [ ] Mosquitto installed and configured
- [ ] Firewall rules configured
- [ ] Services enabled and running
- [ ] Port accessibility verified
- [ ] Frontend deployed

## Service Management

### systemd Service Management

All services use systemd for process management:

```bash
# Enable service to start on boot
sudo systemctl enable service-name

# Start service
sudo systemctl start service-name

# Check service status
sudo systemctl status service-name

# View service logs
sudo journalctl -u service-name -f
```

### Service Dependencies

- Services are designed to be independent
- No explicit dependencies configured (rely on network availability)
- Services include internal retry logic for resilience

## Deployment Notes

- Current deployment is suitable for development and testing
- Production deployment requires additional security measures
- Scaling considerations not yet addressed (single-instance deployment)
- Backup and disaster recovery procedures not yet implemented

---

**Navigation**

[← Previous Section](security.md) | [Table of Contents](index.md) | [Next Section →](../README.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)
