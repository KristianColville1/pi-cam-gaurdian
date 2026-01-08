## Startup/Service Hanging Assessment

- **Observed issue**: FastAPI app became unresponsive (even `/`) because service startup lived inside a single background coroutine with an infinite retry loop around camera init. A stuck camera or MQTT connection would keep the coroutine alive indefinitely, and streaming start was tightly coupled to that loop.
- **Risks**: Unbounded retries blocked streaming start, masked partial availability, and made shutdown uncertain. No hard timeouts existed for hardware init; a single slow dependency could dominate startup.
- **Approach**: Replace the monolithic retry loop with independent, time-bounded tasks launched during FastAPI lifespan. Camera starts in a worker thread with a 20s cap; streaming waits up to 10s for camera readiness; metrics start in a worker thread but do not block HTTP readiness. All services are registered on `app.state` immediately so routes continue to respond even if a service is still coming up or degraded.
- **Shutdown**: Services are stopped in a safe order (streaming > metrics > camera) using threads where needed to avoid blocking the event loop. Startup tasks are cancelled on shutdown to avoid dangling work.
- **Operational notes**: If camera start times out, streaming stays disabled until a manual restart. Health endpoints now remain responsive because HTTP readiness no longer waits on service startup. Consider tuning the camera timeout for your hardware and adding structured health signals if you want to expose partial availability upstream.

## Picamera2 Recording Limitation

- **Issue**: `stop_recording()` in picamera2 interrupts ALL streams regardless of channel/stream name. This breaks concurrent streaming (lores) and recording (main) - stopping recording also stops the streaming pipeline.
- **Solution**: Use a persistent recording pattern where the recording encoder/output is always running on the main stream, but file writing is controlled via `output.enabled = True/False`. This avoids pipeline interruption - the encoder continues running, only the file output is toggled.
- **Implementation**: Recording encoder and FileOutput are set up during camera initialization and never stopped. Recording is controlled by toggling `recording_output.enabled` instead of calling `start_recording()/stop_recording()`. When a recording session ends, the file is converted and a new FileOutput is prepared for the next session.
