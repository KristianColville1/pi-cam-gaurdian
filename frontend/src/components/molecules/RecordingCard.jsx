import React from 'react';
import BunnyVideoPlayer from './BunnyVideoPlayer';
import { formatTimestamp } from '../../utils/date_utils';

/**
 * RecordingCard component
 * Displays a recording card with video player and metadata
 * @param {Object} props - Component props
 * @param {Object} props.recording - Recording data object
 * @returns {JSX.Element} The RecordingCard component
 */
function RecordingCard({ recording }) {
  const videoId = recording.video_id || recording.guid;
  const libraryId = recording.video_library_id;

  return (
    <div className="border rounded p-3">
      <div className="mb-2">
        <h6 className="mb-1">{recording.title || `Recording ${recording.id}`}</h6>
        <small className="text-muted">
          {recording.duration ? `${recording.duration}s` : ''}
          {recording.file_size ? ` • ${(recording.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
          {recording.status ? ` • ${recording.status}` : ''}
        </small>
        <br />
        <small className="text-muted">
          {formatTimestamp(recording.recorded_at || recording.created_at)}
        </small>
      </div>
      <BunnyVideoPlayer libraryId={libraryId} videoId={videoId} />
    </div>
  );
}

export default RecordingCard;

