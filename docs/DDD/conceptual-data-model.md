# Conceptual Data Model

**High-Level Data Model**

## Entity Overview

The conceptual data model for PiCam Guardian represents the core entities and their relationships within the system.

## Current Entities

### User Entity

The **User** entity represents system users who can access the monitoring portal.

**Key Concepts:**

- **Authentication**: Users have email addresses and password hashes for secure login
- **Profile Information**: Optional first name and last name fields
- **Account Status**: Users have verification status and active/inactive flags
- **Session Tracking**: Last login timestamp for activity monitoring
- **Preferences**: JSON-stored user preferences for customization
- **Soft Deletes**: Support for soft deletion with `deleted_at` timestamp
- **Audit Trail**: Created and updated timestamps for record tracking

**Business Rules:**

- Each user must have a unique email address
- User accounts can be verified or unverified
- User accounts can be activated or deactivated
- Soft deletion allows for data recovery and audit purposes

## Relationships

Currently, the database contains a single entity with no explicit relationships defined. Future entities will establish relationships such as:

- Users to Sessions
- Users to Sensor Data Records
- Users to Alerts/Notifications

## Entity Characteristics

All entities in the system follow common patterns:

- **Primary Keys**: UUID-based identifiers for unique identification
- **Timestamps**: Created, updated, and deleted timestamps for audit purposes
- **Soft Deletes**: Support for logical deletion without physical data removal
- **TypeORM Integration**: All entities defined using TypeORM EntitySchema pattern

---

**Navigation**

[← Previous Section](system-description.md) | [Table of Contents](index.md) | [Next Section →](logical-data-model.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)

