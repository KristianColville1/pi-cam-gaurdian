import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '@hooks/useAuth';

function Portal() {
  const { user } = useAuth();

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="display-4 mb-4">Portal</h1>
          <Card>
            <Card.Body>
              <Card.Title>Welcome, {user?.first_name || user?.email}!</Card.Title>
              <Card.Text>
                You are successfully logged in. This is a protected page that requires authentication.
              </Card.Text>
              <Card.Text>
                <strong>Email:</strong> {user?.email}
              </Card.Text>
              {user?.first_name && (
                <Card.Text>
                  <strong>Name:</strong> {user.first_name} {user.last_name || ''}
                </Card.Text>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Portal;

