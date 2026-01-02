import React, { useState, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';

function SensorDataTable() {
  const [metrics, setMetrics] = useState({
    temp_humidity: '--',
    temp_pressure: '--',
    humidity: '--',
    pressure: '--',
    pitch: '--',
    roll: '--',
    yaw: '--',
    accel_x: '--',
    accel_y: '--',
    accel_z: '--',
  });

  useEffect(() => {
    let client = null;
    let script = null;

    // Check if Paho is already loaded
    // eslint-disable-next-line no-undef
    if (typeof Paho !== 'undefined' && typeof Paho.Client !== 'undefined') {
      initializeMQTT();
    } else {
      // Load Paho MQTT library dynamically
      script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.1.0/paho-mqtt.min.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        initializeMQTT();
      };
    }

    function initializeMQTT() {
      // MQTT Configuration
      const MQTT_BROKER = 'pi-guardian.kcolville.com';
      const MQTT_PORT = 9001; // WebSocket port
      const MQTT_TOPIC = 'sensors/metrics';

      // eslint-disable-next-line no-undef
      if (typeof Paho === 'undefined' || typeof Paho.Client === 'undefined') {
        console.error('Paho MQTT library failed to load');
        return;
      }

      // Create MQTT client
      // eslint-disable-next-line no-undef
      client = new Paho.Client(
        MQTT_BROKER,
        MQTT_PORT,
        'web_client_' + Math.random().toString(16).substr(2, 8)
      );

      // Set callback handlers
      client.onConnectionLost = function (responseObject) {
        if (responseObject.errorCode !== 0) {
          console.error('MQTT connection lost: ' + responseObject.errorMessage);
        }
      };

      client.onMessageArrived = function (message) {
        try {
          const data = JSON.parse(message.payloadString);
          setMetrics((prev) => ({
            ...prev,
            ...data,
          }));
        } catch (e) {
          console.error('Error parsing MQTT message:', e);
        }
      };

      // Connect to MQTT broker via WebSocket (WSS for HTTPS)
      // Use secure WebSocket (WSS) when the page is served over HTTPS
      const isSecure = window.location.protocol === 'https:';
      
      client.connect({
        onSuccess: function () {
          console.log('Connected to MQTT broker');
          client.subscribe(MQTT_TOPIC);
        },
        onFailure: function (error) {
          console.error('Failed to connect to MQTT broker:', error.errorMessage);
        },
        useSSL: isSecure,
      });
    }

    // Cleanup function
    return () => {
      if (client && client.isConnected()) {
        client.disconnect();
      }
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const sensorRows = [
    { label: 'Temperature (Humidity)', key: 'temp_humidity', unit: '°C' },
    { label: 'Temperature (Pressure)', key: 'temp_pressure', unit: '°C' },
    { label: 'Humidity', key: 'humidity', unit: '%' },
    { label: 'Pressure', key: 'pressure', unit: 'mbar' },
    { label: 'Pitch', key: 'pitch', unit: '°' },
    { label: 'Roll', key: 'roll', unit: '°' },
    { label: 'Yaw', key: 'yaw', unit: '°' },
    { label: 'Acceleration X', key: 'accel_x', unit: 'g' },
    { label: 'Acceleration Y', key: 'accel_y', unit: 'g' },
    { label: 'Acceleration Z', key: 'accel_z', unit: 'g' },
  ];

  return (
    <Card className="shadow-sm">
      <Card.Header>
        <Card.Title as="h2" className="mb-0">
          Sense HAT Sensor Data
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Sensor</th>
              <th>Value</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {sensorRows.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{metrics[row.key]}</td>
                <td>{row.unit}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default SensorDataTable;

