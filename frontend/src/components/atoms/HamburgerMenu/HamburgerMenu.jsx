import React from 'react';
import './HamburgerMenu.css';

/**
 * HamburgerMenu component
 * @param {Object} props - The component props
 * @param {boolean} props.isOpen - Whether the menu is open
 * @param {Function} props.onClick - The function to call when the menu is clicked
 * @param {string} props.ariaControls - The aria-controls attribute
 * @param {string} props.ariaLabel - The aria-label attribute
 * @returns {JSX.Element} The HamburgerMenu component
 */
function HamburgerMenu({ isOpen, onClick, ariaControls, ariaLabel = 'Toggle navigation' }) {
  return (
    <button
      type="button"
      className={`navbar-toggler hamburger hamburger--squeeze ${isOpen ? 'is-active' : ''}`}
      aria-controls={ariaControls}
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span className="hamburger-box">
        <span className="hamburger-inner"></span>
      </span>
    </button>
  );
}

export default HamburgerMenu;

