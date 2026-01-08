import React from 'react';
import { formatTimestamp } from '../../utils/date_utils';

/**
 * EventItem component
 * Displays an event list item
 * @param {Object} props - Component props
 * @param {Object} props.event - Event data object
 * @returns {JSX.Element} The EventItem component
 */
function EventItem({ event }) {
  return (
    <div className="list-group-item">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <h6 className="mb-1">{event.type || event.title || 'Event'}</h6>
          <p className="mb-1 small">{event.message || event.description || ''}</p>
          <small className="text-muted">
            {formatTimestamp(event.timestamp || event.created_at)}
          </small>
        </div>
      </div>
    </div>
  );
}

export default EventItem;

