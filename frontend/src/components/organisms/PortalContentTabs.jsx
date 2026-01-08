import React, { useState, useEffect } from 'react';
import { Card, Spinner, Modal, Button } from 'react-bootstrap';
import { cameraAPI } from '../../lib/api/camera';
import { useStorage } from '../../hooks/useStorage';
import { formatTimestamp } from '../../utils/date_utils';
import { FaImage, FaVideo, FaHistory, FaEye } from 'react-icons/fa';
import './PortalContentTabs.css';

/**
 * PortalContentTabs component
 * Displays tabs for Images, Recordings, and Events
 * @param {Object} props - Component props
 * @param {string} props.activeTab - The active tab
 * @param {Function} props.onTabChange - Callback to change active tab
 * @param {number} props.onImageCaptured - Trigger count when image is captured
 * @returns {JSX.Element} The PortalContentTabs component
 */
function PortalContentTabs({ activeTab, onTabChange, onImageCaptured }) {
  const { files, recordings, loading, refreshFiles, refreshRecordings, startPolling } = useStorage();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'events') {
      loadEvents();
    }
  }, [activeTab]);

  useEffect(() => {
    if (onImageCaptured > 0) {
      setIsCapturing(true);
      // Start polling immediately and continue every 10 seconds
      startPolling();
      refreshFiles();
      refreshRecordings();
      
      // Keep spinner visible for a few seconds to show activity
      const timer = setTimeout(() => {
        setIsCapturing(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [onImageCaptured, refreshFiles, refreshRecordings, startPolling]);

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await cameraAPI.getEvents({ limit: 20 });
      setEvents(response.data || []);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const images = (files || []).filter(file => 
    file.content_type && file.content_type.startsWith('image/')
  );
  const isLoadingImages = loading.files || isCapturing;
  const isLoadingRecordings = loading.recordings;

  const CDN_BASE_URL = 'https://pi-guardian.b-cdn.net/';

  const getImageUrl = (image) => {
    if (!image.path) return '';
    return `${CDN_BASE_URL}${image.path}`;
  };

  const handleViewImage = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const tabs = [
    { key: 'images', label: 'Images', icon: FaImage },
    { key: 'recordings', label: 'Recordings', icon: FaVideo },
    { key: 'events', label: 'Events', icon: FaHistory },
  ];

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="d-flex align-items-center p-0 border-0">
        <div className="portal-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                className={`portal-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => onTabChange(tab.key)}
              >
                <Icon className="me-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card.Header>
      <Card.Body className="p-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {activeTab === 'images' && (
          <>
            {isLoadingImages ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" className="mb-2" />
                <p className="text-muted">Loading images...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-4">
                <FaImage className="text-muted mb-2" style={{ fontSize: '3rem' }} />
                <p className="text-muted">No images available</p>
                <small className="text-muted">Capture an image to see it here</small>
              </div>
            ) : (
              <>
                <div className="d-grid gap-2">
                  {images.map((image) => (
                    <div key={image.id} className="border rounded p-2">
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
                          onClick={() => handleViewImage(image)}
                        >
                          <FaEye className="me-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                  <Modal.Header closeButton>
                    <Modal.Title>
                      {selectedImage?.object_name || 'Image'}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="text-center">
                    {selectedImage && (
                      <img
                        src={getImageUrl(selectedImage)}
                        alt={selectedImage.object_name || 'Image'}
                        className="img-fluid"
                        style={{ maxHeight: '70vh', width: 'auto' }}
                      />
                    )}
                    <div className="mt-3">
                      <small className="text-muted">
                        {selectedImage && formatTimestamp(selectedImage.created_at)}
                      </small>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>
              </>
            )}
          </>
        )}

        {activeTab === 'recordings' && (
          <>
            {isLoadingRecordings ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" className="mb-2" />
                <p className="text-muted">Loading recordings...</p>
              </div>
            ) : recordings.length === 0 ? (
              <div className="text-center py-4">
                <FaVideo className="text-muted mb-2" style={{ fontSize: '3rem' }} />
                <p className="text-muted">No recordings available</p>
                <small className="text-muted">Start a recording to see it here</small>
              </div>
            ) : (
              <div className="list-group">
                {recordings.map((recording) => (
                  <div key={recording.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{recording.title || `Recording ${recording.id}`}</h6>
                        <small className="text-muted">
                          {recording.duration ? `${recording.duration}s` : ''}
                          {recording.file_size ? ` • ${(recording.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
                          {recording.status ? ` • ${recording.status}` : ''}
                        </small>
                        <br />
                        <small className="text-muted">
                          {recording.recorded_at ? new Date(recording.recorded_at).toLocaleString() : ''}
                        </small>
                      </div>
                      {recording.video_url && (
                        <a
                          href={recording.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'events' && (
          <>
            {eventsLoading ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" className="mb-2" />
                <p className="text-muted">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-4">
                <FaHistory className="text-muted mb-2" style={{ fontSize: '3rem' }} />
                <p className="text-muted">No events available</p>
              </div>
            ) : (
              <div className="list-group">
                {events.map((event, index) => (
                  <div key={index} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{event.type || event.title || 'Event'}</h6>
                        <p className="mb-1 small">{event.message || event.description || ''}</p>
                        <small className="text-muted">
                          {event.timestamp || event.created_at || 'Unknown time'}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default PortalContentTabs;

