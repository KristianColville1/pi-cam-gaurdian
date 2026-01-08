import React from 'react';
import { Spinner } from 'react-bootstrap';
import { FaHistory } from 'react-icons/fa';
import EventItem from './EventItem';

/**
 * EventsTabContent component
 * Displays the events tab content
 * @param {Object} props - Component props
 * @param {Array} props.events - Array of event objects
 * @param {boolean} props.loading - Whether data is loading
 * @returns {JSX.Element} The EventsTabContent component
 */
function EventsTabContent({ events, loading }) {
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" className="mb-2" />
        <p className="text-muted">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-4">
        <FaHistory className="text-muted mb-2" style={{ fontSize: '3rem' }} />
        <p className="text-muted">No events available</p>
      </div>
    );
  }

  return (
    <div className="list-group">
      {events.map((event, index) => (
        <EventItem key={index} event={event} />
      ))}
    </div>
  );
}

export default EventsTabContent;

