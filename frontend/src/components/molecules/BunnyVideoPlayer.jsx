import React from 'react';
import { FaVideo } from 'react-icons/fa';

/**
 * BunnyVideoPlayer component
 * Displays a Bunny.net video player embed
 * @param {Object} props - Component props
 * @param {string} props.libraryId - Bunny.net video library ID
 * @param {string} props.videoId - Bunny.net video ID or GUID
 * @returns {JSX.Element} The BunnyVideoPlayer component
 */
function BunnyVideoPlayer({ libraryId, videoId }) {
  if (!videoId || !libraryId) {
    return (
      <div className="text-center py-3 text-muted">
        <FaVideo className="mb-2" style={{ fontSize: '2rem' }} />
        <p className="mb-0">Video player unavailable</p>
      </div>
    );
  }

  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;

  return (
    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
      <iframe
        src={embedUrl}
        loading="lazy"
        style={{ border: 0, position: 'absolute', top: 0, height: '100%', width: '100%' }}
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
        allowFullScreen={true}
      />
    </div>
  );
}

export default BunnyVideoPlayer;

