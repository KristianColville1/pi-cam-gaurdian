import React, { useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import SwaggerUI from 'swagger-ui-react';
import { useApiDocs } from '@hooks/useApiDocs';
import { useTheme } from '@hooks/useTheme';

function ApiDocs() {
  const { spec, loading, error, fetchApiDocs } = useApiDocs();
  const { isDark } = useTheme();

  useEffect(() => {
    if (!spec && !loading && !error) {
      fetchApiDocs();
    }
  }, [spec, loading, error, fetchApiDocs]);

  if (loading) {
    return (
      <Container fluid className="py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading API documentation...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Failed to Load API Documentation</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!spec) {
    return (
      <Container fluid className="py-5">
        <Alert variant="warning">
          <Alert.Heading>No API Documentation Available</Alert.Heading>
          <p>Unable to load the API specification.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="display-5 fw-bold mb-2">API Documentation</h1>
        <p className="text-muted">Interactive API documentation for PiCam Guardian backend</p>
      </div>
      <div 
        style={{ minHeight: '600px' }}
      >
        <SwaggerUI spec={spec}  />
      </div>
    </Container>
  );
}

export default ApiDocs;

