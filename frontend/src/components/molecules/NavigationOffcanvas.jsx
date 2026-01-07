import React from 'react';
import { Offcanvas, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@hooks/useTheme';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import './NavigationOffcanvas.css';

/**
 * NavigationOffcanvas component
 * @param {Object} props - The component props
 * @param {boolean} props.show - Whether the offcanvas is shown
 * @param {Function} props.onHide - The function to call when the offcanvas is hidden
 * @param {Function} props.onLoginClick - The function to call when the login button is clicked
 * @returns {JSX.Element} The NavigationOffcanvas component
 */
function NavigationOffcanvas({ show, onHide, onLoginClick }) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { path: '/', label: 'Home' },
  ];

  // Add Portal and Metrics History links only if authenticated
  if (isAuthenticated) {
    navLinks.push({ path: '/portal', label: 'Portal' });
    navLinks.push({ path: '/metrics-history', label: 'Metrics History' });
  }

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" backdrop={false}>
      <Offcanvas.Body>
        <Nav className="flex-column">
          {navLinks.map((link) => (
            <Nav.Link
              key={link.path}
              as={Link}
              to={link.path}
              active={location.pathname === link.path}
              onClick={onHide}
              className="mb-2"
            >
              {link.label}
            </Nav.Link>
          ))}
          {isAuthenticated && (
            <NavDropdown title="APIs" id="apis-dropdown-mobile" className="mb-2">
              <NavDropdown.Item as={Link} to="/api-docs" onClick={onHide}>
                Backend API
              </NavDropdown.Item>
            </NavDropdown>
          )}
          <div className="mt-auto pt-3 border-top">
            <ButtonGroup className="w-100 mb-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                className="flex-fill"
              >
                {theme === 'light' ? <FaMoon /> : <FaSun />}
                <span className="ms-2">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </Button>
            </ButtonGroup>
            {!isAuthenticated && (
              <Button
                variant="primary"
                className="w-100"
                onClick={() => {
                  onHide();
                  onLoginClick();
                }}
              >
                Login
              </Button>
            )}
          </div>
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default NavigationOffcanvas;

