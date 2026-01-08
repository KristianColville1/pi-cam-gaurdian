import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import VideoStream from '@components/organisms/VideoStream';
import SensorMetrics from '@components/organisms/SensorMetrics';
import SensorCharts from '@components/organisms/SensorCharts';
import SensorDataTable from '@components/organisms/SensorDataTable';
import PortalActions from '@components/organisms/PortalActions';
import PortalContentTabs from '@components/organisms/PortalContentTabs';

/**
 * Portal page component
 * @returns {JSX.Element}
 * @description Displays the portal page for the PiCam Guardian application.
 */
function Portal() {
  const [activeTab, setActiveTab] = useState('images');
  const [imageCaptured, setImageCaptured] = useState(0);
  const [recordingStopped, setRecordingStopped] = useState(0);

  const handleImageCaptured = () => {
    setImageCaptured((prev) => prev + 1);
  };

  const handleRecordingStopped = () => {
    setRecordingStopped((prev) => prev + 1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

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

          {/* Main Content - Video Stream, Actions, Metrics and Content Tabs */}
          <Row className="g-4 mb-4">
              <Col lg={6}>
                  <VideoStream />
                  <div className="mt-3">
                      <PortalActions 
                          onImageCaptured={handleImageCaptured}
                          onRecordingStopped={handleRecordingStopped}
                          onTabChange={handleTabChange}
                      />
                  </div>
                  <div className="mt-3">
                      <SensorMetrics />
                  </div>
              </Col>
              <Col lg={6}>
                  <PortalContentTabs 
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                      onImageCaptured={imageCaptured}
                      onRecordingStopped={recordingStopped}
                  />
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
