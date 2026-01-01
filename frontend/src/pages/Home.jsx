import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Home() {
  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="display-4 mb-4">Welcome to PiCam Guardian</h1>
          <p className="lead">
            Raspberry Pi-based remote monitoring system for camera feeds and sensor data.
          </p>
          <hr className="my-4" />
          <p>
            Monitor Pi remotely with real-time video streaming and sensor metrics.
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;

