import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Brand from '@components/atoms/Brand';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-4 border-top">
      <Container>
        <Row>
          <Col md={6}>
            <h5>
              <Brand />
            </h5>
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

