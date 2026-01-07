import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import VideoStream from '@components/organisms/VideoStream';
import SensorMetrics from '@components/organisms/SensorMetrics';
import SensorCharts from '@components/organisms/SensorCharts';
import SensorDataTable from '@components/organisms/SensorDataTable';
import PortalActions from '@components/organisms/PortalActions';

/**
 * Portal page component
 * @returns {JSX.Element}
 * @description Displays the portal page for the PiCam Guardian application.
 */
function Portal() {
  return (
      <Container fluid className="py-4">
          {/* Header Section */}
          <Row className="mb-4">
              <Col>
                  <h1 className="display-5 fw-bold mb-2">Monitoring Portal</h1>
                  <p className="text-muted">
                      Real-time camera feed and sensor data Raspberry Pi
                  </p>
              </Col>
          </Row>

          {/* Main Content - Video Stream with Actions */}
          <Row className="g-4 mb-4">
              <Col lg={6}>
                  <VideoStream />
                  <PortalActions />
              </Col>
              <Col lg={6} className="d-flex align-items-start">
                  <SensorMetrics />
              </Col>
          </Row>

          {/* Sensor Charts Section */}
          <Row className="mb-4">
              <Col>
                  <SensorCharts />
              </Col>
          </Row>

          {/* Detailed Sensor Data Table */}
          <Row>
              <Col>
                  <SensorDataTable />
              </Col>
          </Row>
      </Container>
  );
}

export default Portal;
