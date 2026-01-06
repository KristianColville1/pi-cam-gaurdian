import React, { useState, useEffect } from 'react';
import { ButtonGroup, Button, Spinner } from 'react-bootstrap';
import { useToast } from '@hooks/useToast';
import { piAPI } from '../../lib/api/pi';
import { 
  FaCamera, 
  FaVideo, 
  FaStop, 
  FaHistory,
  FaInfoCircle 
} from 'react-icons/fa';

function PortalActions() {
  const { triggerToast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState(null);
  const [loading, setLoading] = useState({});

  // Check recording status on mount
  useEffect(() => {
    checkRecordingStatus();
    // Poll recording status every 5 seconds
    const interval = setInterval(checkRecordingStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkRecordingStatus = async () => {
    try {
      const response = await piAPI.getRecordingStatus();
      setIsRecording(response.data?.recording || false);
      setRecordingStatus(response.data);
    } catch (error) {
      console.debug('Recording status check failed:', error);
    }
  };

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
    const response = await piAPI.captureImage();
    triggerToast('success', 'Image Captured', 'Image captured successfully!');
    if (response.data?.url) {
      window.open(response.data.url, '_blank');
    }
  };

  const handleStartRecording = async () => {
    await piAPI.startRecording();
    setIsRecording(true);
    triggerToast('success', 'Recording Started', 'Video recording has started');
  };

  const handleStopRecording = async () => {
    await piAPI.stopRecording();
    setIsRecording(false);
    triggerToast('success', 'Recording Stopped', 'Video recording has stopped');
  };

  const handleViewEvents = async () => {
    const response = await piAPI.getEvents({ limit: 50 });
    triggerToast('info', 'Events', `Loaded ${response.data?.length || 0} events`);
  };

  const handleGetStatus = async () => {
    const response = await piAPI.getStatus();
    const status = response.data;
    triggerToast(
      'info',
      'System Status',
      `Camera: ${status?.camera?.status || 'unknown'}, Metrics: ${status?.metrics?.status || 'unknown'}`
    );
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
          onClick={() => handleAction('events', handleViewEvents)}
          disabled={loading.events}
          className="rounded-0"
        >
          {loading.events ? (
            <Spinner animation="border" size="sm" className="me-1" />
          ) : (
            <FaHistory className="me-1" />
          )}
          Events
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleAction('status', handleGetStatus)}
          disabled={loading.status}
          className="rounded-0"
        >
          {loading.status ? (
            <Spinner animation="border" size="sm" className="me-1" />
          ) : (
            <FaInfoCircle className="me-1" />
          )}
          Status
        </Button>
      </ButtonGroup>
      {recordingStatus && isRecording && (
        <small className="text-muted">
          Recording... Duration: {recordingStatus.duration || 'N/A'}
        </small>
      )}
    </div>
  );
}

export default PortalActions;

