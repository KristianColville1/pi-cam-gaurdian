import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import LoginModal from './LoginModal';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
  ];

  // Add Portal link only if authenticated
  if (isAuthenticated) {
    navLinks.push({ path: '/portal', label: 'Portal' });
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            PiCam Guardian
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {navLinks.map((link) => (
                <Nav.Link
                  key={link.path}
                  as={Link}
                  to={link.path}
                  active={location.pathname === link.path}
                >
                  {link.label}
                </Nav.Link>
              ))}
              {!isAuthenticated && (
                <Button
                  variant="outline-light"
                  className="ms-2"
                  onClick={() => setShowLoginModal(true)}
                >
                  Login
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          navigate('/portal');
        }}
      />
    </>
  );
}

export default Navigation;

