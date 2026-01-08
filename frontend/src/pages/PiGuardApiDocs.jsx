import React, { useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import SwaggerUI from 'swagger-ui-react';
import { useApiDocs } from '@hooks/useApiDocs';
import { useTheme } from '@hooks/useTheme';

/**
 * PiGuardApiDocs page component
 * @returns {JSX.Element}
 * @description Displays the API documentation for the Raspberry Pi Guard service.
 */
function PiGuardApiDocs() {
  const { piGuardSpec, piGuardLoading, piGuardError, fetchPiGuardApiDocs } = useApiDocs();
  const { isDark } = useTheme();

  useEffect(() => {
    if (!piGuardSpec && !piGuardLoading && !piGuardError) {
      fetchPiGuardApiDocs();
    }
  }, [piGuardSpec, piGuardLoading, piGuardError, fetchPiGuardApiDocs]);

  if (piGuardLoading) {
    return (
      <Container fluid className="py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading Pi Guard API documentation...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (piGuardError) {
    return (
      <Container fluid className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Failed to Load Pi Guard API Documentation</Alert.Heading>
          <p>{piGuardError}</p>
        </Alert>
      </Container>
    );
  }

  if (!piGuardSpec) {
    return (
      <Container fluid className="py-5">
        <Alert variant="warning">
          <Alert.Heading>No Pi Guard API Documentation Available</Alert.Heading>
          <p>Unable to load the Pi Guard API specification.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="display-5 fw-bold mb-2">Pi Guard API Documentation</h1>
        <p className="text-muted">Interactive API documentation for Raspberry Pi Guard service</p>
      </div>
      <div 
        style={{ minHeight: '600px' }}
      >
        <SwaggerUI spec={piGuardSpec}  />
      </div>
    </Container>
  );
}

export default PiGuardApiDocs;

