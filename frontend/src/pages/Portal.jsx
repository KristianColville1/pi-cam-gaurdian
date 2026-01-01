import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import VideoStream from '@components/organisms/VideoStream';
import SensorDataTable from '@components/organisms/SensorDataTable';

function Portal() {
  return (
    <Container fluid className="py-4">
      <Row className="g-4">
        <Col md={6}>
          <VideoStream />
        </Col>
        <Col md={6}>
          <SensorDataTable />
        </Col>
      </Row>
    </Container>
  );
}

export default Portal;

