# PiCam Guardian - Project Reflection

**Reflections on Development Process, Challenges, and Lessons Learned**

---

## Time Management & Development Challenges

### Camera Stability Issues

**Major Time Consumer**

The most significant time drain during development was addressing camera stability issues. The Raspberry Pi camera system required extensive troubleshooting and refactoring to achieve reliable operation, particularly when implementing multi-channel streaming for live viewing, image capture, and video recording simultaneously.

**Specific Challenges:**

- **FFmpeg Pipe Failures**: Encountered frequent FFmpeg stdin pipe breaks that caused the camera service to fail. This required implementing robust error handling, retry mechanisms, and process monitoring.
- **Camera Interruption on Recording Stop**: Stopping recordings would interrupt the picamera2 service and cause the FFmpeg process to become stuck, making the camera unavailable. This led to implementing the "pause recording" pattern, which required significant research and trial-and-error to implement correctly.
- **Process Architecture Issues**: Initially attempted to use FastAPI to manage all processes, but this didn't account for the process requirements of camera services, MQTT publishing, and streaming. Required refactoring to use a unified startup approach that properly managed all processes.
- **Metrics Stalling Camera**: Discovered that blocking metrics operations could stall the camera stream, requiring asynchronous logic implementation.

**Impact on Development:**

Camera stability issues consumed significantly more development time than anticipated. The debugging, refactoring, and implementation of stable patterns (pause recording, error handling, process management) took substantial time away from feature development, particularly in the final release period.

**Lessons Learned:**

- Hardware integration complexity should be given more buffer time in planning
- Research existing patterns and limitations before implementation (pause recording pattern was known but not discovered early)
- Prioritize stability testing earlier in the development cycle
- Consider dedicating a separate iteration specifically for hardware stability before feature development

### TypeScript Migration

**Decision Point**

Migrated the backend from JavaScript to TypeScript partway through Release 3. While this provided type safety benefits and improved developer experience, it also consumed development time that could have been allocated to features.

**Trade-offs:**

- **Pros**: Type safety, better IDE support, cleaner code structure
- **Cons**: Time spent on migration, configuration adjustments, build system updates
- **Approach**: Used loose typing (non-strict TypeScript) to maintain development velocity

**Reflection:**

The TypeScript migration was valuable but could have been planned earlier or deferred. The timing (mid-release) created additional pressure on development timelines.

### Backend Build Configuration Issues

Encountered issues after TypeScript migration where the backend went down due to missing build process. Route detection also failed initially due to missing file extension globbing for TypeScript files. While resolved quickly, these issues highlight the importance of thorough testing after major infrastructure changes.

## What Would I Do Differently?

### Planning & Time Allocation

1. **Dedicate More Time to Hardware Stability**
   - Allocate specific iteration/sprint for camera stability before feature development
   - Research hardware limitations and patterns earlier in the project lifecycle
   - Build more comprehensive error handling and monitoring from the start

2. **Earlier Infrastructure Decisions**
   - Make TypeScript decision at project start rather than mid-development
   - Plan CDN integration earlier to avoid last-minute setup
   - Establish testing procedures for infrastructure changes

3. **Feature Scope Management**
   - Be more aggressive about feature pruning when time is limited
   - Prioritize core functionality over nice-to-have features
   - Create clearer MVP boundaries for each release

### Development Approach

1. **Testing & Stability First**
   - Invest more time in stability testing before adding features
   - Implement comprehensive error handling earlier
   - Create better monitoring and logging from the beginning

2. **Research & Documentation**
   - Research hardware limitations and patterns before implementation
   - Read official documentation more thoroughly (picamera2 manual, etc.)
   - Document architectural decisions and patterns as they're established

3. **Process Architecture**
   - Design process management architecture earlier
   - Avoid assumptions about framework capabilities (FastAPI process management)
   - Test process management patterns before full implementation

### Code Organization

1. **Repository Pattern Earlier**
   - Implement repository pattern from the start rather than refactoring later
   - Establish consistent patterns across modules earlier
   - Create manager layer for external services earlier

2. **Error Handling**
   - Implement comprehensive error handling patterns from baseline
   - Create consistent error response structures earlier
   - Better error logging and monitoring infrastructure

## What Went Well?

### CI/CD Pipeline

Implementing the GitHub Actions CI/CD pipeline early in Release 2 paid significant dividends, especially during Release 3 development. The ability to deploy frontend changes automatically accelerated development and reduced deployment friction.

### Modular Architecture

The Domain-Driven Design approach with modular structure made it easier to add new features (storage module, webhook handlers) without disrupting existing functionality. The repository pattern, while implemented later, provided clean separation of concerns.

### OpenAPI Integration

Building OpenAPI specification generation early provided useful API documentation and made it easier to understand available endpoints. The Swagger UI integration helped with testing and documentation.

### TypeScript Approach

While the timing could have been better, the decision to use loose TypeScript (non-strict) was appropriate for the project size and timeline. It provided benefits without excessive complexity or time investment.

## Lessons Learned for Future Projects

### Hardware Integration

- Hardware integration often takes longer than expected - always add buffer time
- Research hardware limitations and patterns before implementation
- Prioritize stability testing for hardware-dependent features
- Consider hardware integration as a separate risk factor in planning

### Time Management

- Build more buffer time into estimates for unfamiliar technologies
- Prioritize stability and core functionality over features
- Be willing to defer nice-to-have features to maintain quality
- Create clearer MVP boundaries and stick to them

### Development Practices

- Implement infrastructure improvements early rather than mid-development
- Establish testing and error handling patterns from the start
- Document architectural decisions as they're made
- Research thoroughly before implementation, especially for hardware

### Project Planning

- Dedicate specific time blocks for stability and testing
- Plan infrastructure decisions (TypeScript, CDN, etc.) at project start
- Create clearer separation between stability work and feature development
- Be more aggressive about scope management when timelines are tight

## Conclusion

While camera stability issues consumed more time than anticipated, the project successfully delivered a comprehensive monitoring system with real-time video streaming, sensor data collection, media capture, and storage management. The challenges encountered provided valuable learning experiences about hardware integration, time management, and development prioritization that will inform future projects.

The final system represents a solid foundation that could be extended with additional features such as scheduled recordings, motion detection, enhanced analytics, and improved security measures in future iterations.

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)

