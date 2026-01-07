import React, { createContext, useState, useEffect, useCallback } from 'react';

export const SensorDataContext = createContext();

/**
 * SensorDataProvider - manages live MQTT sensor data
 * @param {Object} children - The children components
 * @returns {JSX.Element}
 * @description Provides the SensorDataContext to the component.
 */
export const SensorDataProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({
    temp_humidity: null,
    temp_pressure: null,
    humidity: null,
    pressure: null,
    pitch: null,
    roll: null,
    yaw: null,
    accel_x: null,
    accel_y: null,
    accel_z: null,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [history, setHistory] = useState([]);
  const [maxHistoryLength] = useState(100); // Keep last 100 data points for charts

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
      const MQTT_BROKER = 'pi-guardian.kcolville.com';
      const isSecure = window.location.protocol === 'https:';
      const MQTT_PORT = isSecure ? 443 : 9001;
      const MQTT_PATH = '/mqtt';
      const MQTT_TOPIC = 'sensors/metrics';

      // eslint-disable-next-line no-undef
      if (typeof Paho === 'undefined' || typeof Paho.Client === 'undefined') {
        console.error('[MQTT] Paho MQTT library failed to load');
        return;
      }

      try {
        const clientId = 'web_client_' + Math.random().toString(16).substr(2, 8);
        // eslint-disable-next-line no-undef
        client = new Paho.Client(MQTT_BROKER, MQTT_PORT, MQTT_PATH, clientId);

        client.onConnectionLost = function (responseObject) {
          setIsConnected(false);
          if (responseObject && responseObject.errorCode !== 0) {
            console.error('[MQTT] Connection lost', responseObject);
          }
        };

        client.onMessageArrived = function (message) {
          if (!message || !message.payloadString) {
            return;
          }

          try {
            const data = JSON.parse(message.payloadString);
            
            if (!data || typeof data !== 'object') {
              return;
            }

            // Update current metrics
            setMetrics((prev) => ({
              ...prev,
              ...data,
            }));

            // Add to history with timestamp
            setHistory((prev) => {
              const newHistory = [
                ...prev,
                {
                  ...data,
                  timestamp: new Date().toISOString(),
                },
              ];
              // Keep only last maxHistoryLength items
              return newHistory.slice(-maxHistoryLength);
            });
          } catch (e) {
            console.error('[MQTT] Error parsing message', e);
          }
        };

        client.connect({
          onSuccess: function () {
            console.log('[MQTT] Successfully connected to broker');
            setIsConnected(true);
            try {
              client.subscribe(MQTT_TOPIC);
              console.log('[MQTT] Subscribed to topic:', MQTT_TOPIC);
            } catch (e) {
              console.error('[MQTT] Error subscribing to topic', e);
            }
          },
          onFailure: function (error) {
            console.error('[MQTT] Failed to connect to broker', error);
            setIsConnected(false);
          },
          useSSL: isSecure,
        });
      } catch (e) {
        console.error('[MQTT] Error initializing MQTT client', e);
        setIsConnected(false);
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
  }, [maxHistoryLength]);

  const value = {
    metrics,
    isConnected,
    history,
    maxHistoryLength,
  };

  return <SensorDataContext.Provider value={value}>{children}</SensorDataContext.Provider>;
};

