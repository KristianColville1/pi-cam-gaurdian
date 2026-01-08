import React from 'react';
import { Spinner } from 'react-bootstrap';
import { FaImage } from 'react-icons/fa';
import ImageCard from './ImageCard';
import ImageModal from './ImageModal';

/**
 * ImagesTabContent component
 * Displays the images tab content
 * @param {Object} props - Component props
 * @param {Array} props.images - Array of image objects
 * @param {boolean} props.loading - Whether data is loading
 * @param {Object} props.selectedImage - Selected image for modal
 * @param {boolean} props.showModal - Whether modal is visible
 * @param {Function} props.onViewImage - Callback when view button is clicked
 * @param {Function} props.onCloseModal - Callback when modal is closed
 * @returns {JSX.Element} The ImagesTabContent component
 */
function ImagesTabContent({ images, loading, selectedImage, showModal, onViewImage, onCloseModal }) {
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" className="mb-2" />
        <p className="text-muted">Loading images...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-4">
        <FaImage className="text-muted mb-2" style={{ fontSize: '3rem' }} />
        <p className="text-muted">No images available</p>
        <small className="text-muted">Capture an image to see it here</small>
      </div>
    );
  }

  return (
    <>
      <div className="d-grid gap-2">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} onView={onViewImage} />
        ))}
      </div>
      <ImageModal image={selectedImage} show={showModal} onHide={onCloseModal} />
    </>
  );
}

export default ImagesTabContent;

