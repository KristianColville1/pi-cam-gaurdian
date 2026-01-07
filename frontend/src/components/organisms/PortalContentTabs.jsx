import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { cameraAPI } from '../../lib/api/camera';
import { FaImage, FaVideo, FaHistory } from 'react-icons/fa';
import './PortalContentTabs.css';

/**
 * PortalContentTabs component
 * Displays tabs for Images, Recordings, and Events
 * @param {Object} props - Component props
 * @param {string} props.activeTab - The active tab
 * @param {Function} props.onTabChange - Callback to change active tab
 * @param {Function} props.onImageCaptured - Callback when image is captured
 * @returns {JSX.Element} The PortalContentTabs component
 */
function PortalContentTabs({ activeTab, onTabChange, onImageCaptured }) {
  const [images, setImages] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState({ images: false, recordings: false, events: false });

  useEffect(() => {
    if (activeTab === 'images') {
      loadImages();
    } else if (activeTab === 'recordings') {
      loadRecordings();
    } else if (activeTab === 'events') {
      loadEvents();
    }
  }, [activeTab]);

  useEffect(() => {
    if (onImageCaptured) {
      loadImages();
    }
  }, [onImageCaptured]);

  const loadImages = async () => {
    setLoading((prev) => ({ ...prev, images: true }));
    try {
      // TODO: Replace with actual API endpoint when available
      // const response = await cameraAPI.getImages({ limit: 5 });
      // setImages(response.data || []);
      setImages([]);
    } catch (error) {
      console.error('Failed to load images:', error);
      setImages([]);
    } finally {
      setLoading((prev) => ({ ...prev, images: false }));
    }
  };

  const loadRecordings = async () => {
    setLoading((prev) => ({ ...prev, recordings: true }));
    try {
      // TODO: Replace with actual API endpoint when available
      // const response = await cameraAPI.getRecordings({ limit: 10 });
      // setRecordings(response.data || []);
      setRecordings([]);
    } catch (error) {
      console.error('Failed to load recordings:', error);
      setRecordings([]);
    } finally {
      setLoading((prev) => ({ ...prev, recordings: false }));
    }
  };

  const loadEvents = async () => {
    setLoading((prev) => ({ ...prev, events: true }));
    try {
      const response = await cameraAPI.getEvents({ limit: 20 });
      setEvents(response.data || []);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setLoading((prev) => ({ ...prev, events: false }));
    }
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
            {loading.images ? (
              <div className="text-center py-4">
                <p className="text-muted">Loading images...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-4">
                <FaImage className="text-muted mb-2" style={{ fontSize: '3rem' }} />
                <p className="text-muted">No images available</p>
                <small className="text-muted">Capture an image to see it here</small>
              </div>
            ) : (
              <div className="d-grid gap-2">
                {images.map((image, index) => (
                  <div key={index} className="border rounded p-2">
                    <img
                      src={image.url}
                      alt={image.filename || `Image ${index + 1}`}
                      className="img-fluid rounded"
                      style={{ maxHeight: '150px', width: '100%', objectFit: 'contain' }}
                    />
                    <small className="text-muted d-block mt-1">
                      {image.filename || image.created_at || 'Unknown'}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'recordings' && (
          <>
            {loading.recordings ? (
              <div className="text-center py-4">
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
                {recordings.map((recording, index) => (
                  <div key={index} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{recording.filename || `Recording ${index + 1}`}</h6>
                        <small className="text-muted">
                          {recording.duration || recording.size || 'Unknown details'}
                        </small>
                      </div>
                      <a
                        href={recording.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'events' && (
          <>
            {loading.events ? (
              <div className="text-center py-4">
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

