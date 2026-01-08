import React from 'react';
import { Button } from 'react-bootstrap';
import { FaEye } from 'react-icons/fa';
import { formatTimestamp } from '../../utils/date_utils';

const CDN_BASE_URL = 'https://pi-guardian.b-cdn.net/';

/**
 * ImageCard component
 * Displays an image card with thumbnail and view button
 * @param {Object} props - Component props
 * @param {Object} props.image - Image data object
 * @param {Function} props.onView - Callback when view button is clicked
 * @returns {JSX.Element} The ImageCard component
 */
function ImageCard({ image, onView }) {
  const getImageUrl = (img) => {
    if (!img.path) return '';
    return `${CDN_BASE_URL}${img.path}`;
  };

  return (
    <div className="border rounded p-2">
      <div className="position-relative">
        <img
          src={getImageUrl(image)}
          alt={image.object_name || `Image ${image.id}`}
          className="img-fluid rounded"
          style={{ maxHeight: '150px', width: '100%', objectFit: 'contain', display: 'block' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <small className="text-muted">
          {formatTimestamp(image.created_at)}
        </small>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => onView(image)}
        >
          <FaEye className="me-1" />
          View
        </Button>
      </div>
    </div>
  );
}

export default ImageCard;

