import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import StorageTabsNavigation from '../components/molecules/StorageTabsNavigation';
import FilesTable from '../components/molecules/FilesTable';
import RecordingsTable from '../components/molecules/RecordingsTable';
import ImageModal from '../components/molecules/ImageModal';
import RecordingModal from '../components/molecules/RecordingModal';

/**
 * Storage page component
 * Displays files and recordings in tables with management options
 * @returns {JSX.Element} The Storage page component
 */
function Storage() {
  const [activeTab, setActiveTab] = useState('files');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);

  const handleViewImage = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleViewRecording = (recording) => {
    setSelectedRecording(recording);
    setShowRecordingModal(true);
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="display-5 fw-bold mb-2">Storage Management</h1>
        <p className="text-muted">Manage files and recordings</p>
      </div>

      <StorageTabsNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'files' && <FilesTable onViewImage={handleViewImage} />}
      {activeTab === 'recordings' && <RecordingsTable onViewRecording={handleViewRecording} />}

      <ImageModal
        image={selectedImage}
        show={showImageModal}
        onHide={() => {
          setShowImageModal(false);
          setSelectedImage(null);
        }}
      />

      <RecordingModal
        recording={selectedRecording}
        show={showRecordingModal}
        onHide={() => {
          setShowRecordingModal(false);
          setSelectedRecording(null);
        }}
      />
    </Container>
  );
}

export default Storage;

