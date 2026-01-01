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

### Release 2

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

#### Git Scope & Branching

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

#### Release 2

#### Release 3

## Development & Deployment

### Version Control

### Cloning the Repository

## Credits

---

**Navigation**

[← Previous Section]() | [Table of Contents](README.md) | [Next Section →]()

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)

<!-- Footer Component: README/footer.md -->
