# PiCam Guardian

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)

**Smart Home Safety & Monitoring System**

PiCam Guardian is an IoT-based smart home monitoring prototype that provides remote visibility into environmental conditions and activity using a Raspberry Pi with sensors and camera capabilities.

---

## Table of Contents

* [Project Goals](#project-goals)
  * [Personal Goals](#personal-goals)
* [User Experience (UX)](#user-experience-ux)
  * [Target Audience](#target-audience)
* [Design](#design)
  * [Color Scheme](#color-scheme)
  * [Typography](#typography)
  * [Layout](#layout)
  * [Icons](#icons)
* [Technologies &amp; Tools](#technologies--tools)
* [Features](#features)
  * [Baseline](#baseline)
  * [Release 1](#release-1)
  * [Release 2](#release-2)
  * [Release 3](#release-3)
* [System Design](#system-design)
* [Database Design](#database-design)
* [Development Log](#development-log)
* [Data](#data)
* [Testing](#testing)
* [Bugs](#bugs)
  * [Bug Details](#bug-details)
* [Releases](#releases)
  * [Overview](#overview)
  * [Git Workflow](#git-workflow)
  * [Development Strategy](#development-strategy)
    * [Timeline](#timeline)
    * [Git Scope & Branching](#git-scope--branching)
  * [Release Results](#release-results)
    * [Baseline](#baseline-1)
    * [Release 1](#release-1-1)
    * [Release 2](#release-2-1)
    * [Release 3](#release-3-1)
* [Development &amp; Deployment](#development--deployment)
  * [Version Control](#version-control)
  * [Cloning the Repository](#cloning-this-repository)
  * [Server Setup](#server-setup)
  * [Setting Up MQTT Mosquitto](#setting-up-mqtt-mosquitto)
* [Credits](#credits)

---

## Project Goals

### Personal Goals

## User Experience (UX)

### Target Audience

## Design

### Color Scheme

### Typography

### Layout

### Icons

## Technologies & Tools

## Features

### Baseline

**Programming & Networking Strands**

- Camera streaming infrastructure using `rpicam-vid` and `ffmpeg`
- RTSP streaming pipeline from Raspberry Pi to cloud server
- Oracle Cloud free tier server setup and configuration
- MediaMTX installation and systemd service configuration for RTSP/WebRTC streaming
- Network configuration (NSG rules, iptables, port forwarding)
- Low-latency video streaming (~220ms) via WebRTC
- Python streaming service (`stream.py`) with error handling and auto-restart
- Basic web interface with embedded WebRTC player
- Dynamic DNS setup for remote access preparation

### Release 1

**Sensor Data Collection & Real-Time Updates**

- MQTT broker (Mosquitto) installation and configuration on cloud server
- MQTT server listening on ports 1883 (standard MQTT) and 9001 (WebSocket)
- Sense HAT sensor metrics collection via `metrics.py`
- Real-time sensor data publishing to MQTT broker (temperature, humidity, pressure, orientation, acceleration)
- WebSocket connection from frontend to MQTT broker
- Dynamic table updates in web interface for real-time sensor data
- Complete end-to-end data flow: Raspberry Pi sensors → MQTT → Frontend display
- Systemd service configuration for metrics collection service
- Network configuration for MQTT ports (1883 and 9001)

### Release 2

**Public Website & Database Integration**

- Development of public-facing website interface
- Implementation of database concepts from database design strand
- Historical data storage and retrieval capabilities
- Enhanced user interface and user experience features

### Release 3

## System Design

The system architecture, component design, and technical specifications for PiCam Guardian are documented in detail in the [System Design Document (SDD)](docs/SDD/index.md).

The SDD covers architecture overview, system components, network architecture, data flow, API design, security considerations, and deployment architecture.

[View System Design Document →](docs/SDD/index.md)

---

## Database Design

The database schema, data models, relationships, and storage design for PiCam Guardian are documented in detail in the [Database Design Document (DDD)](docs/DDD/index.md).

The DDD covers database schema, entity relationships, data models, tables, indexes, and constraints.

[View Database Design Document →](docs/DDD/index.md)

---

## Development Log

The development log provides insight into the development process, documenting the journey from initial concepts to implementation. These entries capture procedural notes, challenges encountered, solutions explored, and the iterative thought process behind design decisions.

These logs are journal-style entries intended to give readers insight into the development experience rather than serving as step-by-step documentation or tutorials.

[View Development Log Index →](docs/dev-log/index.md)

---

## Data

## Testing

## Bugs

### Bug Details

## Releases

### Overview

### Git Workflow

### Development Strategy

The assignment is delivered in multiple iterations:

- **Baseline**
- **Release 1** → **Release 3**
- **Release 4** and beyond (if time permits)

The development approach follows an agile methodology with a focus on rapid prototyping and iterative refinement. The strategy moves from the most abstract concepts to concrete implementations, starting with minimal viable products (MVPs) and progressively optimizing toward production-ready solutions.

**Core Principles:**

- **Abstract to Concrete**: Begin with high-level architecture and system design, then progressively implement specific components
- **Rapid Prototyping**: Quickly build working prototypes to validate concepts and identify challenges early
- **Optimization Iteration**: Each release refines and optimizes previous implementations based on learnings
- **Continuous Mini-MVPs**: Each iteration delivers a functional, testable product that builds upon previous releases
- **Agile Adaptation**: Respond to technical challenges and requirements changes through flexible, iterative development

This approach ensures early validation of core functionality while maintaining flexibility to refine and optimize based on real-world testing and feedback.

#### Timeline

| Milestone                 | Date                 |
| ------------------------- | -------------------- |
| Project Start             | Dec 7th, 2025        |
| Development Start         | Dec 28th, 2025       |
| Expected Final Submission | Jan 8th, 2026        |
| Approximate Duration      | 5/6 weeks            |

#### Git Scope & Branching

| Branch       | Description                   |
| ------------ | ----------------------------- |
| `main`       | Stable, release-ready version |
|              |                               |
| `baseline`   | Baseline project              |
| `rel1`       | Release 1                     |
| `rel2`       | Release 2                     |
| `rel3`       | Release 3                     |

### Release Results

#### Baseline

Successfully established the core networking and programming infrastructure for the camera streaming system. The baseline release focused on proving the concept and establishing a working video streaming pipeline from the Raspberry Pi to a remote server.

**Achievements:**

- **Video Streaming Pipeline**: Implemented end-to-end RTSP streaming from Raspberry Pi camera to Oracle Cloud server using `rpicam-vid` piped through `ffmpeg`
- **Low Latency Streaming**: Achieved ~220ms latency using WebRTC through MediaMTX, exceeding industry standards for live streaming
- **Cloud Infrastructure**: Successfully configured Oracle Cloud free tier instance with proper network security groups, iptables rules, and port management
- **Service Automation**: Configured systemd services for MediaMTX and streaming processes to ensure automatic startup and resilience
- **Network Configuration**: Resolved complex cloud networking challenges including NSG rules, VNIC configuration, and firewall settings
- **Streaming Service**: Developed robust Python streaming service with error handling, process monitoring, and auto-restart capabilities

**Current State:**

The baseline release provides a functional streaming system with camera feed accessible via WebRTC through a web interface.

**Development Approach:**

Implementing a cloud server setup early in the baseline release presented scope and time risks, but was approached from an MVP perspective to validate core infrastructure and networking concepts. Heavy refinements for security hardening, performance optimization, and production-ready configurations are planned for future iterations, allowing the baseline to focus on establishing a working foundation.

**Prepared for Future Releases:**

Networking infrastructure and streaming pipeline are established and ready for integration with additional features such as sensor data collection, database storage, authentication systems, and enhanced user interfaces.

#### Release 1

Successfully implemented sensor data collection and real-time data transmission infrastructure. Release 1 builds upon the baseline streaming foundation by adding comprehensive sensor monitoring capabilities.

**Achievements:**

- **MQTT Infrastructure**: Configured Mosquitto MQTT broker on the cloud server with dual-protocol support (standard MQTT on port 1883 and WebSocket on port 9001)
- **Sensor Data Collection**: Implemented `metrics.py` service to collect Sense HAT sensor metrics including temperature (from humidity and pressure sensors), humidity, pressure, orientation (pitch, roll, yaw), and acceleration (x, y, z axes)
- **Real-Time Data Publishing**: Established continuous data flow with metrics published to MQTT broker every 2 seconds
- **WebSocket Integration**: Enabled WebSocket connections from web frontend to MQTT broker for real-time data reception
- **Dynamic Frontend Updates**: Implemented real-time table updates in web interface, displaying live sensor data as it's received
- **Service Automation**: Configured systemd service for metrics collection with proper error handling and logging
- **Network Configuration**: Configured firewall rules and security groups for MQTT ports (1883 and 9001)

**Current State:**

Release 1 provides a complete real-time monitoring system with both video streaming (from baseline) and sensor data collection. The system demonstrates full end-to-end data flow from Raspberry Pi sensors through MQTT to the web frontend, with all data updating in real-time.

**Prepared for Future Releases:**

The MQTT infrastructure and real-time data flow established in Release 1 provides the foundation for database integration, historical data storage, and advanced analytics features planned for Release 2.

#### Release 2

Release 2 is in development, focusing on implementing a public-facing website and integrating database concepts from the database design strand. This release will expand the system's capabilities to include data persistence, historical analysis, and enhanced user interface features.

#### Release 3

## Development & Deployment

### Version Control

I used [Visual Studio Code](https://code.visualstudio.com/) as a local repository and IDE & [GitHub](https://github.com/) as a remote repository.

1. Firstly, I needed to create a new repository on Github [pi-cam-gaurdian](https://github.com/KristianColville1/pi-cam-gaurdian).
2. I opened that repository on my local machine by copying the URL from that repository and cloning it from my IDE for use.
3. Visual Studio Code opened a new workspace for me.
4. I created files and folders to use.
5. To push my newly created files to GitHub I used the terminal by pressing Ctrl + shift + `.
6. A new terminal opened and then I used the below steps.

   - `git add (name of the file)` *This selects the file for the commit*
   - `git commit -m "Commit message: (i.e. Initial commit)"` *Allows the developer to assign a specific concise statement to the commit*
   - `git push` *The final command sends the code to GitHub*

### Cloning this Repository

If you would like to clone this repository please follow the bellow steps.

Instructions:

1. Log into GitHub.
2. Go to the repository you wish to clone.
3. Click the green "Code" button.
4. Copy the URL provided under the HTTPS option.
5. Open your preferred IDE with Git installed.
6. Open a new terminal window in your IDE.
7. Enter the following command exactly: `git clone the-URL-you-copied-from-GitHub`.
8. Press Enter.

### Server Setup

**Oracle Cloud Free Tier Setup**

The cloud infrastructure for PiCam Guardian is hosted on Oracle Cloud Infrastructure (OCI) using the free tier offering.

**Initial Setup Process:**

1. **Oracle Cloud Account Creation**
   - Signed up for Oracle Cloud free tier account
   - Accessed the Oracle Cloud Console

   ![Oracle Cloud Signup](docs/dev-log/image/30-12-2025/1767105717858.png)
   ![Oracle Cloud Console](docs/dev-log/image/30-12-2025/1767105930294.png)

2. **Instance Creation**
   - Created a compute instance with default settings
   - Configured necessary settings and resolved initial setup errors

   ![Instance Creation](docs/dev-log/image/30-12-2025/1767106256048.png)
   ![Instance Configuration](docs/dev-log/image/30-12-2025/1767106606821.png)

3. **SSH Key Configuration**
   - Encountered SSH key download error during initial setup
   - Downloaded SSH keys from networking section

   ![SSH Key Error](docs/dev-log/image/30-12-2025/1767106689319.png)
   ![SSH Key Download](docs/dev-log/image/30-12-2025/1767106724087.png)

4. **Instance Details**
   - Instance created successfully
   - Obtained FQDN (Fully Qualified Domain Name) for the instance

   ![Instance Created](docs/dev-log/image/30-12-2025/1767106808077.png)
   ![FQDN](docs/dev-log/image/30-12-2025/1767106938355.png)

5. **Network Configuration**
   - Configured local SSH keys for connection
   - Created and attached public IP address to VNIC (Virtual Network Interface Card)
   - Created reserved IP first, then attached to VNIC for public access

   ![SSH Key Configuration](docs/dev-log/image/30-12-2025/1767107679358.png)
   ![Create Public IP](docs/dev-log/image/30-12-2025/1767108282010.png)
   ![Attach IP to VNIC](docs/dev-log/image/30-12-2025/1767108862519.png)
   ![Reserved IP Attached](docs/dev-log/image/30-12-2025/1767109072490.png)

6. **SSH Connection Verification**
   - Successfully tested SSH connection using private key
   - Confirmed remote access to the server

   ![SSH Connection Success](docs/dev-log/image/30-12-2025/1767109200715.png)

**Configuration Notes:**

- Initially tested with Oracle Linux, but performance was too slow
- Switched to Ubuntu 22.04 LTS for better performance and familiarity
- Changed from shared compute to dedicated VPS for improved speed
- After confirming SSH access, the initial instance was deleted and recreated with Ubuntu on dedicated VPS
- The server now runs Ubuntu on a dedicated VPS instance on Oracle Cloud free tier

### Setting Up MQTT Mosquitto

MQTT Mosquitto is used as a publisher/subscriber system on the server so the Raspberry Pi can send events to it.

**Installation:**

```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
```

![Mosquitto Installation](docs/dev-log/image/01-01-2026/1767270903753.png)

**Starting the Service:**

```bash
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

![Mosquitto Service Status](docs/dev-log/image/01-01-2026/1767270949504.png)

**Network Configuration:**

MQTT uses port 1883. Update the iptables and security list on the cloud server:

```bash
sudo iptables -A INPUT -p tcp --dport 1883 -j ACCEPT
```

![Iptables Configuration](docs/dev-log/image/01-01-2026/1767272015212.png)

![Cloud Security List](docs/dev-log/image/01-01-2026/1767272055695.png)

**Verify Service:**

Check that the port is listening:

```bash
ss -nltp
```

![Port Listening Status](docs/dev-log/image/01-01-2026/1767272193402.png)

**Testing Basic Communication:**

Test the MQTT setup by subscribing on the Raspberry Pi or a local Linux machine:

```bash
mosquitto_sub -h your.server.ip -t test/topic
```

On the server, publish a test message:

```bash
mosquitto_pub -h your.server.ip -t test/topic -m "hello"
```

If ports need to be fixed, use a more specific iptables rule:

```bash
sudo iptables -I INPUT 5 -p tcp --dport 1883 -m conntrack --ctstate NEW -j ACCEPT
```

![Iptables Fix](docs/dev-log/image/01-01-2026/1767274152501.png)

![Iptables Save](docs/dev-log/image/01-01-2026/1767274217423.png)

![Pi Communication Confirmation](docs/dev-log/image/01-01-2026/1767274242550.png)

## Credits

---

**Navigation**

[← Previous Section]() | [Table of Contents](README.md) | [Next Section →]()

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)

<!-- Footer Component: README/footer.md -->
