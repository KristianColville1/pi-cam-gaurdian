import React from 'react';
import { Card } from 'react-bootstrap';

function VideoStream() {
  const STREAM_URL = 'https://pi-guardian.kcolville.com:8889/cam';

  return (
    <Card className="shadow-sm">
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

