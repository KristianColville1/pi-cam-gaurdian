import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { cameraAPI } from '../../lib/api/camera';
import { useStorage } from '../../hooks/useStorage';
import ImagesTabContent from '../molecules/ImagesTabContent';
import RecordingsTabContent from '../molecules/RecordingsTabContent';
import EventsTabContent from '../molecules/EventsTabContent';
import { FaImage, FaVideo, FaHistory } from 'react-icons/fa';
import './PortalContentTabs.css';

/**
 * PortalContentTabs component
 * Displays tabs for Images, Recordings, and Events
 * @param {Object} props - Component props
 * @param {string} props.activeTab - The active tab
 * @param {Function} props.onTabChange - Callback to change active tab
 * @param {number} props.onImageCaptured - Trigger count when image is captured
 * @param {number} props.onRecordingStopped - Trigger count when recording is stopped
 * @returns {JSX.Element} The PortalContentTabs component
 */
function PortalContentTabs({ activeTab, onTabChange, onImageCaptured, onRecordingStopped }) {
  const { files, recordings, loading, refreshFiles, refreshRecordings, startPolling } = useStorage();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecordingStopped, setIsRecordingStopped] = useState(false);
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
      startPolling();
      refreshFiles();
      refreshRecordings();
      
      const timer = setTimeout(() => {
        setIsCapturing(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [onImageCaptured, refreshFiles, refreshRecordings, startPolling]);

  useEffect(() => {
    if (onRecordingStopped > 0) {
      setIsRecordingStopped(true);
      startPolling();
      refreshRecordings();
      
      const timer = setTimeout(() => {
        setIsRecordingStopped(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [onRecordingStopped, refreshRecordings, startPolling]);

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

  const handleViewImage = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const images = (files || []).filter(file => 
    file.content_type && file.content_type.startsWith('image/')
  );
  const isLoadingImages = loading.files || isCapturing;
  const isLoadingRecordings = loading.recordings || isRecordingStopped;

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
          <ImagesTabContent
            images={images}
            loading={isLoadingImages}
            selectedImage={selectedImage}
            showModal={showModal}
            onViewImage={handleViewImage}
            onCloseModal={handleCloseModal}
          />
        )}

        {activeTab === 'recordings' && (
          <RecordingsTabContent
            recordings={recordings}
            loading={isLoadingRecordings}
          />
        )}

        {activeTab === 'events' && (
          <EventsTabContent
            events={events}
            loading={eventsLoading}
          />
        )}
      </Card.Body>
    </Card>
  );
}

export default PortalContentTabs;
