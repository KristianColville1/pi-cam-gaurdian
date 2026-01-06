import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, ButtonGroup, NavDropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@hooks/useTheme';
import Brand from '@components/atoms/Brand';
import HamburgerMenu from '@components/atoms/HamburgerMenu/HamburgerMenu';
import NavigationOffcanvas from '@components/molecules/NavigationOffcanvas';
import LoginModal from './LoginModal';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
  ];

  // Add Portal link only if authenticated
  if (isAuthenticated) {
    navLinks.push({ path: '/portal', label: 'Portal' });
  }

  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  return (
    <>
      <Navbar expand="lg" className="border-bottom">
        <Container>
          <Brand as={Link} to="/" showLogo={true} />
          <div className="d-flex d-lg-none">
            <HamburgerMenu
              isOpen={isOffcanvasOpen}
              onClick={() => setIsOffcanvasOpen(!isOffcanvasOpen)}
              ariaControls="navigation-offcanvas"
            />
          </div>
          <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-flex">
            <Nav className="ms-auto align-items-center">
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
              <NavDropdown title="APIs" id="apis-dropdown" className="ms-2">
                <NavDropdown.Item as={Link} to="/api-docs">
                  Backend API
                </NavDropdown.Item>
              </NavDropdown>
              <ButtonGroup className="ms-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={toggleTheme}
                  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? <FaMoon /> : <FaSun />}
                </Button>
              </ButtonGroup>
              {!isAuthenticated && (
                <Button
                  variant="primary"
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
      <NavigationOffcanvas
        show={isOffcanvasOpen}
        onHide={() => setIsOffcanvasOpen(false)}
        onLoginClick={() => setShowLoginModal(true)}
      />
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

