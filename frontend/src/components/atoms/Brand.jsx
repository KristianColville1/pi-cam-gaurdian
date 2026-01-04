import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from 'react-bootstrap';
import logoWhite from '@assets/pi-logo-white.webp';
import logo from '@assets/pi-logo.webp';
import { useTheme } from '@hooks/useTheme';

/**
 * Brand component
 * @param {Object} props - The component props
 * @param {React.ElementType} props.as - The component to render as
 * @param {string} props.to - The URL to link to
 * @param {string} props.className - The className to apply to the component
 * @param {boolean} props.showLogo - Whether to show the logo
 * @returns {JSX.Element} The Brand component
 */
function Brand({ as, to, className, showLogo = true, ...props }) {
  const { isDark } = useTheme();
  const logoSrc = isDark ? logoWhite : logo;

  const brandContent = showLogo ? (
    <img src={logoSrc} alt="PiCam Guardian" width="250" />
  ) : (
    <>PiCam Guardian</>
  );

  if (as === Link || to) {
    return (
      <Navbar.Brand as={Link} to={to || '/'} className={className} {...props}>
        {brandContent}
      </Navbar.Brand>
    );
  }

  return (
    <Navbar.Brand className={className} {...props}>
      {brandContent}
    </Navbar.Brand>
  );
}

export default Brand;
