import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, ButtonGroup } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@hooks/useTheme';
import Brand from '@components/atoms/Brand';
import HamburgerMenu from '@components/atoms/HamburgerMenu/HamburgerMenu';
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

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Navbar expand="lg" className="border-bottom" expanded={isOpen} onToggle={setIsOpen}>
        <Container>
          <Brand as={Link} to="/" showLogo={true} />
          <HamburgerMenu
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            ariaControls="basic-navbar-nav"
          />
          <Navbar.Collapse id="basic-navbar-nav">
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

