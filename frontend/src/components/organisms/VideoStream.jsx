import React from 'react';
import { Card } from 'react-bootstrap';
import { FaVideo } from 'react-icons/fa';

function VideoStream() {
  const STREAM_URL = 'https://pi-guardian.kcolville.com/cam';

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex align-items-center gap-2">
        <FaVideo />
        <Card.Title as="h5" className="mb-0">
          Live Camera Stream
        </Card.Title>
      </Card.Header>
      <Card.Body className="p-0">
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 0,
            paddingBottom: '56.25%', // 16:9 aspect ratio
            overflow: 'hidden',
          }}
        >
          <iframe
            src={STREAM_URL}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Camera Stream"
            allowFullScreen
          />
        </div>
      </Card.Body>
    </Card>
  );
}

export default VideoStream;

