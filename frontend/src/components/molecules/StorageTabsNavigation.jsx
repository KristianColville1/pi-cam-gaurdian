import React from 'react';
import { Nav } from 'react-bootstrap';
import { FaImage, FaVideo } from 'react-icons/fa';

/**
 * StorageTabsNavigation component
 * Displays tabs for Files and Recordings
 * @param {Object} props - Component props
 * @param {string} props.activeTab - The active tab
 * @param {Function} props.onTabChange - Callback when tab changes
 * @returns {JSX.Element} The StorageTabsNavigation component
 */
function StorageTabsNavigation({ activeTab, onTabChange }) {
  return (
    <Nav variant="tabs" className="mb-3">
      <Nav.Item>
        <Nav.Link eventKey="files" active={activeTab === 'files'} onClick={() => onTabChange('files')}>
          <FaImage className="me-2" />
          Files
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="recordings" active={activeTab === 'recordings'} onClick={() => onTabChange('recordings')}>
          <FaVideo className="me-2" />
          Recordings
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
}

export default StorageTabsNavigation;

