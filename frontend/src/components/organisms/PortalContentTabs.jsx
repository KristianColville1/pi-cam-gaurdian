import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { cameraAPI } from '../../lib/api/camera';
import EventsTabContent from '../molecules/EventsTabContent';
import './PortalContentTabs.css';

/**
 * PortalContentTabs component
 * Displays Events content
 * @param {Object} props - Component props
 * @param {string} props.activeTab - The active tab (kept for compatibility, but only events is used)
 * @returns {JSX.Element} The PortalContentTabs component
 */
function PortalContentTabs({ activeTab }) {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await cameraAPI.getEvents({ limit: 20 });
      setEvents(response.data || []);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="d-flex align-items-center p-0 border-0">
        <div className="portal-tabs">
          <button
            type="button"
            className="portal-tab active"
          >
            Events
          </button>
        </div>
      </Card.Header>
      <Card.Body className="p-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <EventsTabContent
          events={events}
          loading={eventsLoading}
        />
      </Card.Body>
    </Card>
  );
}

export default PortalContentTabs;
