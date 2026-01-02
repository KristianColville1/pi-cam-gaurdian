# Purpose

**Database Design Document - Purpose**

This document outlines the database design for PiCam Guardian, detailing the data models, relationships, and storage architecture used to support the system's functionality.

## Database Objectives

The PiCam Guardian database serves the following purposes:

- **User Management**: Store user accounts, authentication credentials, and user preferences
- **Data Persistence**: Provide a foundation for storing historical sensor data and system logs
- **Authentication Support**: Enable secure user authentication and authorization
- **Future Expansion**: Support planned features including historical data analysis, alerts, and extended monitoring capabilities

## Technology Stack

The database implementation uses:

- **TypeORM** - Object-Relational Mapping (ORM) library for Node.js/TypeScript
- **SQLite** - Lightweight, serverless database engine (currently `db.sqlite3` for local development)
- **Entity Schema Pattern** - TypeORM EntitySchema for defining data models in JavaScript

## Current Implementation Status

The database is currently in initial development phase with a single entity:

- **User Entity** - Complete implementation for user authentication and management

Future entities for sensor data, sessions, and other features are planned for subsequent releases.

---

**Navigation**

[← Previous Section](index.md) | [Table of Contents](index.md) | [Next Section →](system-description.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)

