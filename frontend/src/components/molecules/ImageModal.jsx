import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { formatTimestamp } from '../../utils/date_utils';

const CDN_BASE_URL = 'https://pi-guardian.b-cdn.net/';

/**
 * ImageModal component
 * Displays an image in a modal dialog
 * @param {Object} props - Component props
 * @param {Object} props.image - Image data object
 * @param {boolean} props.show - Whether to show the modal
 * @param {Function} props.onHide - Callback when modal is closed
 * @returns {JSX.Element} The ImageModal component
 */
function ImageModal({ image, show, onHide }) {
  const getImageUrl = (img) => {
    if (!img?.path) return '';
    return `${CDN_BASE_URL}${img.path}`;
  };

  if (!image) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {image.object_name || 'Image'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <img
          src={getImageUrl(image)}
          alt={image.object_name || 'Image'}
          className="img-fluid"
          style={{ maxHeight: '70vh', width: 'auto' }}
        />
        <div className="mt-3">
          <small className="text-muted">
            {formatTimestamp(image.created_at)}
          </small>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ImageModal;

