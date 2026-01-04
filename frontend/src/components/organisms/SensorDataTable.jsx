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
      // MQTT Configuration - connect through nginx proxy
      const MQTT_BROKER = 'pi-guardian.kcolville.com';
      const isSecure = window.location.protocol === 'https:';
      // Use default HTTPS port (443) when secure, otherwise use 9001 for HTTP
      const MQTT_PORT = isSecure ? 443 : 9001;
      const MQTT_PATH = '/mqtt'; // Path matches nginx location /mqtt/
      const MQTT_TOPIC = 'sensors/metrics';

      // eslint-disable-next-line no-undef
      if (typeof Paho === 'undefined' || typeof Paho.Client === 'undefined') {
        console.error('[MQTT] Paho MQTT library failed to load', {
          pahoExists: typeof Paho !== 'undefined',
          clientExists: typeof Paho !== 'undefined' && typeof Paho.Client !== 'undefined',
        });
        return;
      }

      try {
        // Create MQTT client - constructor: (host, port, path, clientId)
        const clientId = 'web_client_' + Math.random().toString(16).substr(2, 8);
        // eslint-disable-next-line no-undef
        client = new Paho.Client(
          MQTT_BROKER,
          MQTT_PORT,
          MQTT_PATH,
          clientId
        );

        console.log('[MQTT] Initializing connection', {
          broker: MQTT_BROKER,
          port: MQTT_PORT,
          path: MQTT_PATH,
          clientId,
        });

        // Set callback handlers
        client.onConnectionLost = function (responseObject) {
          if (!responseObject) {
            console.error('[MQTT] Connection lost - response object is undefined or null');
            return;
          }

          const errorCode = responseObject.errorCode ?? 'unknown';
          const errorMessage = responseObject.errorMessage ?? 'No error message provided';

          if (errorCode !== 0) {
            console.error('[MQTT] Connection lost', {
              errorCode,
              errorMessage,
              responseObject,
            });
          } else {
            console.log('[MQTT] Connection lost (normal disconnect)');
          }
        };

        client.onMessageArrived = function (message) {
          if (!message) {
            console.error('[MQTT] Message arrived but message object is null/undefined');
            return;
          }

          try {
            if (!message.payloadString) {
              console.error('[MQTT] Message has no payload string', { message });
              return;
            }

            const data = JSON.parse(message.payloadString);
            
            if (!data || typeof data !== 'object') {
              console.warn('[MQTT] Parsed message is not an object', { data, message });
              return;
            }

            setMetrics((prev) => ({
              ...prev,
              ...data,
            }));
          } catch (e) {
            console.error('[MQTT] Error parsing message', {
              error: e,
              errorMessage: e?.message ?? 'Unknown error',
              errorStack: e?.stack,
              payload: message?.payloadString,
              topic: message?.destinationName,
              message,
            });
          }
        };

        client.connect({
          onSuccess: function () {
            console.log('[MQTT] Successfully connected to broker');
            try {
              client.subscribe(MQTT_TOPIC);
              console.log('[MQTT] Subscribed to topic:', MQTT_TOPIC);
            } catch (e) {
              console.error('[MQTT] Error subscribing to topic', {
                error: e,
                errorMessage: e?.message ?? 'Unknown error',
                topic: MQTT_TOPIC,
              });
            }
          },
          onFailure: function (error) {
            console.error('[MQTT] Failed to connect to broker', {
              error,
              errorCode: error?.errorCode ?? 'unknown',
              errorMessage: error?.errorMessage ?? 'No error message provided',
              errorString: error?.errorString ?? 'No error string provided',
              broker: MQTT_BROKER,
              port: MQTT_PORT,
              path: MQTT_PATH,
              useSSL: isSecure,
              protocol: window.location.protocol,
            });
          },
          useSSL: isSecure,
        });
      } catch (e) {
        console.error('[MQTT] Error initializing MQTT client', {
          error: e,
          errorMessage: e?.message ?? 'Unknown error',
          errorStack: e?.stack,
          broker: MQTT_BROKER,
          port: MQTT_PORT,
          path: MQTT_PATH,
        });
      }
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
      <Card.Header className="bg-primary">
        <Card.Title as="h2" className="mb-0 text-danger">
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

