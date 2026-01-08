import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

/**
 * EditRecordingModal component
 * Modal for editing recording name or deleting recording
 * @param {Object} props - Component props
 * @param {Object} props.recording - Recording data object
 * @param {boolean} props.show - Whether to show the modal
 * @param {Function} props.onHide - Callback when modal is closed
 * @param {Function} props.onSave - Callback when recording is saved (receives new title)
 * @param {Function} props.onDelete - Callback when recording is deleted
 * @returns {JSX.Element} The EditRecordingModal component
 */
function EditRecordingModal({ recording, show, onHide, onSave, onDelete }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (recording) {
      setTitle(recording.title || '');
    }
  }, [recording]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }
    setLoading(true);
    try {
      await onSave(title.trim());
      onHide();
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return;
    }
    setLoading(true);
    try {
      await onDelete();
      onHide();
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setLoading(false);
    }
  };

  if (!recording) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Recording</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Recording Name</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter recording name"
              disabled={loading}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-danger"
            onClick={handleDelete}
            disabled={loading}
          >
            <FaTrash className="me-1" />
            Delete
          </Button>
          <Button
            variant="secondary"
            onClick={onHide}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || !title.trim()}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EditRecordingModal;

