import React, { useState } from 'react';
import { ButtonGroup, Button, Spinner } from 'react-bootstrap';
import { useToast } from '@hooks/useToast';
import { useRecording } from '../../contexts/RecordingContext';
import { cameraAPI } from '../../lib/api/camera';
import { 
  FaCamera, 
  FaVideo, 
  FaStop
} from 'react-icons/fa';

/**
 * PortalActions component
 * @param {Object} props - Component props
 * @param {Function} props.onImageCaptured - Callback when image is captured
 * @param {Function} props.onRecordingStopped - Callback when recording is stopped
 * @returns {JSX.Element} The PortalActions component
 */
function PortalActions({ onImageCaptured, onRecordingStopped }) {
  const { triggerToast } = useToast();
  const { isRecording, startRecording, stopRecording } = useRecording();
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
  };

  const handleStartRecording = async () => {
    await cameraAPI.startRecording();
    startRecording();
    triggerToast('success', 'Recording Started', 'Video recording has started');
  };

  const handleStopRecording = async () => {
    await cameraAPI.stopRecording();
    stopRecording();
    triggerToast('success', 'Recording Stopped', 'Video recording has stopped');
    if (onRecordingStopped) {
      onRecordingStopped();
    }
  };

  return (
    <div className="d-flex flex-column gap-2">
      <ButtonGroup size="lg" className="flex-wrap rounded-0">
        <Button
          variant="outline-danger"
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
            variant="outline-danger"
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
            variant="outline-success"
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
      </ButtonGroup>
    </div>
  );
}

export default PortalActions;

