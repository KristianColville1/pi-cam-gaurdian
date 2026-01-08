import React, { useState } from 'react';
import { NavDropdown, Spinner } from 'react-bootstrap';
import { useToast } from '@hooks/useToast';
import { useRecording } from '../../contexts/RecordingContext';
import { cameraAPI } from '../../lib/api/camera';
import { FaCamera, FaVideo, FaStop } from 'react-icons/fa';

/**
 * ActionsDropdown component
 * Provides camera actions (capture, record) in a dropdown menu
 * @returns {JSX.Element} The ActionsDropdown component
 */
function ActionsDropdown() {
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
    await cameraAPI.captureImage();
    triggerToast('success', 'Image Captured', 'Image captured successfully!');
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
  };

  return (
    <NavDropdown title="Actions" id="actions-dropdown" className="ms-2">
      <NavDropdown.Item
        onClick={() => handleAction('capture', handleCaptureImage)}
        disabled={loading.capture}
      >
        {loading.capture ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Capturing...
          </>
        ) : (
          <>
            <FaCamera className="me-2" />
            Capture Image
          </>
        )}
      </NavDropdown.Item>
      {isRecording ? (
        <NavDropdown.Item
          onClick={() => handleAction('stopRecording', handleStopRecording)}
          disabled={loading.stopRecording}
        >
          {loading.stopRecording ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Stopping...
            </>
          ) : (
            <>
              <FaStop className="me-2" />
              Stop Recording
            </>
          )}
        </NavDropdown.Item>
      ) : (
        <NavDropdown.Item
          onClick={() => handleAction('startRecording', handleStartRecording)}
          disabled={loading.startRecording}
        >
          {loading.startRecording ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Starting...
            </>
          ) : (
            <>
              <FaVideo className="me-2" />
              Start Recording
            </>
          )}
        </NavDropdown.Item>
      )}
    </NavDropdown>
  );
}

export default ActionsDropdown;

