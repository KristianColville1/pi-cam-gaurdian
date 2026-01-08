import React from 'react';
import { Spinner } from 'react-bootstrap';
import { FaVideo } from 'react-icons/fa';
import RecordingCard from './RecordingCard';

/**
 * RecordingsTabContent component
 * Displays the recordings tab content
 * @param {Object} props - Component props
 * @param {Array} props.recordings - Array of recording objects
 * @param {boolean} props.loading - Whether data is loading
 * @returns {JSX.Element} The RecordingsTabContent component
 */
function RecordingsTabContent({ recordings, loading }) {
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" className="mb-2" />
        <p className="text-muted">Loading recordings...</p>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="text-center py-4">
        <FaVideo className="text-muted mb-2" style={{ fontSize: '3rem' }} />
        <p className="text-muted">No recordings available</p>
        <small className="text-muted">Start a recording to see it here</small>
      </div>
    );
  }

  return (
    <div className="d-grid gap-3">
      {recordings.map((recording) => (
        <RecordingCard key={recording.id} recording={recording} />
      ))}
    </div>
  );
}

export default RecordingsTabContent;

