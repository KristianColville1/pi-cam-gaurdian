import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light mt-auto py-4">
      <Container>
        <Row>
          <Col md={6}>
            <h5>PiCam Guardian</h5>
            <p className="mb-0">Raspberry Pi-based remote monitoring system</p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-0">
              &copy; {currentYear} PiCam Guardian. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;

