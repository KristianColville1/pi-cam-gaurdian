import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { formatTimestamp } from '../../utils/date_utils';
import BunnyVideoPlayer from './BunnyVideoPlayer';

/**
 * RecordingModal component
 * Displays a recording in a modal dialog with video player
 * @param {Object} props - Component props
 * @param {Object} props.recording - Recording data object
 * @param {boolean} props.show - Whether to show the modal
 * @param {Function} props.onHide - Callback when modal is closed
 * @returns {JSX.Element} The RecordingModal component
 */
function RecordingModal({ recording, show, onHide }) {
  if (!recording) return null;

  const videoId = recording.video_id || recording.guid;
  const libraryId = recording.video_library_id;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {recording.title || `Recording ${recording.id}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <small className="text-muted">
            <strong>Duration:</strong> {recording.duration ? `${recording.duration}s` : 'N/A'}
            {recording.file_size && ` • ${(recording.file_size / 1024 / 1024).toFixed(2)} MB`}
            {recording.status && ` • Status: ${recording.status}`}
          </small>
          <br />
          <small className="text-muted">
            <strong>Recorded:</strong> {formatTimestamp(recording.recorded_at || recording.created_at)}
          </small>
        </div>
        <BunnyVideoPlayer libraryId={libraryId} videoId={videoId} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RecordingModal;

