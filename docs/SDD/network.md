# Network Architecture

**PiCam Guardian - Network Design & Configuration**

## Network Overview

The PiCam Guardian system uses a hybrid network architecture connecting a local Raspberry Pi to cloud infrastructure over the public internet.

## Network Topology

### Components

1. **Raspberry Pi (Local Network)**
   - Connected to local network via WiFi/Ethernet
   - Outbound connections to cloud server

2. **Oracle Cloud Infrastructure**
   - Public IP: 145.241.195.101
   - Virtual Cloud Network (VCN) configuration
   - Network Security Groups (NSG) for firewall rules

3. **Internet**
   - Public internet connection between Pi and cloud server

## Network Architecture Diagram

*[Placeholder for network diagram showing: Local Network (Raspberry Pi) → Internet → Oracle Cloud (VCN, Subnets, Security Groups)]*

## Port Configuration

### Cloud Server Ports

| Port | Protocol | Service | Purpose | Access |
|------|----------|---------|---------|--------|
| 8554 | TCP | RTSP | Video streaming input | Raspberry Pi → Server |
| 8889 | TCP | WebRTC | Video streaming output | Frontend → Server |
| 1883 | TCP | MQTT | Sensor data (standard MQTT) | Raspberry Pi → Server |
| 9001 | TCP | MQTT WebSocket | Sensor data (WebSocket) | Frontend → Server |
| 22 | TCP | SSH | Server management | Admin → Server |
| 80/443 | TCP | HTTP/HTTPS | Web server (planned) | Frontend → Server |

## Network Security Configuration

### Oracle Cloud Network Security Groups (NSG)

- **Ingress Rules**: Configured to allow specific ports from authorized sources
- **Egress Rules**: Configured for outbound traffic requirements
- **Security List**: Additional layer of network security controls

### Firewall Configuration (iptables)

The cloud server uses `iptables` for additional firewall management:

```bash
# RTSP port (8554)
sudo iptables -I INPUT 5 -p tcp --dport 8554 -m conntrack --ctstate NEW -j ACCEPT

# WebRTC port (8889)  
# Configured via NSG rules

# MQTT standard port (1883)
sudo iptables -I INPUT 5 -p tcp --dport 1883 -m conntrack --ctstate NEW -j ACCEPT

# MQTT WebSocket port (9001)
sudo iptables -I INPUT 5 -p tcp --dport 9001 -m conntrack --ctstate NEW -j ACCEPT
```

### Network Configuration Management

- iptables rules are persisted in `/etc/iptables/rules.v4`
- Rules are restored on system reboot
- Configuration managed through Oracle Cloud Console and direct server access

## Network Protocols

### Video Streaming Path
- **Protocol**: RTSP → WebRTC
- **Flow**: Raspberry Pi (rpicam-vid + ffmpeg) → RTSP → MediaMTX → WebRTC → Frontend
- **Latency**: ~220ms end-to-end

### Sensor Data Path
- **Protocol**: MQTT (standard and WebSocket)
- **Flow**: Raspberry Pi (metrics.py) → MQTT (1883) → Mosquitto → MQTT WebSocket (9001) → Frontend
- **Update Frequency**: Every 2 seconds

## Network Resilience

- **Connection Handling**: Services configured with automatic reconnection
- **Error Recovery**: Application-level error handling for network failures
- **Service Monitoring**: systemd services ensure automatic restart on failures

## Network Diagram

*[Placeholder for detailed network diagram showing: IP addresses, port mappings, protocol flows, security boundaries]*

---

**Navigation**

[← Previous Section](components.md) | [Table of Contents](index.md) | [Next Section →](data-flow.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)
