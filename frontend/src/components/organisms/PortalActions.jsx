import React, { useState } from 'react';
import { ButtonGroup, Button, Spinner } from 'react-bootstrap';
import { useToast } from '@hooks/useToast';
import { cameraAPI } from '../../lib/api/camera';
import { 
  FaCamera, 
  FaVideo, 
  FaStop, 
  FaHistory
} from 'react-icons/fa';

/**
 * PortalActions component
 * @param {Object} props - Component props
 * @param {Function} props.onImageCaptured - Callback when image is captured
 * @param {Function} props.onTabChange - Callback to change active tab
 * @returns {JSX.Element} The PortalActions component
 */
function PortalActions({ onImageCaptured, onTabChange }) {
  const { triggerToast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState({});

  const handleAction = async (actionName, actionFn) => {
    setLoading((prev) => ({ ...prev, [actionName]: true }));
    try {
      await actionFn();
    } catch (error) {
      triggerToast(
        'danger',
        'Action Failed',
        error.response?.data?.message || error.message || 'An error occurred'
      );
    } finally {
      setLoading((prev) => ({ ...prev, [actionName]: false }));
    }
  };

  const handleCaptureImage = async () => {
    const response = await cameraAPI.captureImage();
    triggerToast('success', 'Image Captured', 'Image captured successfully!');
    if (onImageCaptured) {
      onImageCaptured();
    }
    if (onTabChange) {
      onTabChange('images');
    }
  };

  const handleStartRecording = async () => {
    await cameraAPI.startRecording();
    setIsRecording(true);
    triggerToast('success', 'Recording Started', 'Video recording has started');
    if (onTabChange) {
      onTabChange('recordings');
    }
  };

  const handleStopRecording = async () => {
    await cameraAPI.stopRecording();
    setIsRecording(false);
    triggerToast('success', 'Recording Stopped', 'Video recording has stopped');
  };

  const handleViewEvents = () => {
    if (onTabChange) {
      onTabChange('events');
    }
  };

  return (
    <div className="d-flex flex-column gap-2">
      <ButtonGroup size="lg" className="flex-wrap rounded-0">
        <Button
          variant="danger"
          onClick={() => handleAction('capture', handleCaptureImage)}
          disabled={loading.capture}
          className="rounded-0"
        >
          {loading.capture ? (
            <Spinner animation="border" size="sm" className="me-1" />
          ) : (
            <FaCamera className="me-1" />
          )}
          Capture
        </Button>
        {isRecording ? (
          <Button
            variant="danger"
            onClick={() => handleAction('stopRecording', handleStopRecording)}
            disabled={loading.stopRecording}
            className="rounded-0"
          >
            {loading.stopRecording ? (
              <Spinner animation="border" size="sm" className="me-1" />
            ) : (
              <FaStop className="me-1" />
            )}
            Stop
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={() => handleAction('startRecording', handleStartRecording)}
            disabled={loading.startRecording}
            className="rounded-0"
          >
            {loading.startRecording ? (
              <Spinner animation="border" size="sm" className="me-1" />
            ) : (
              <FaVideo className="me-1" />
            )}
            Record
          </Button>
        )}
        <Button
          variant="info"
          onClick={handleViewEvents}
          className="rounded-0"
        >
          <FaHistory className="me-1" />
          Events
        </Button>
      </ButtonGroup>
    </div>
  );
}

export default PortalActions;

