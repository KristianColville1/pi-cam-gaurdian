import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { useSensorData } from '@hooks/useSensorData';

/**
 * SensorDataTable component
 * @returns {JSX.Element} The SensorDataTable component
 */
function SensorDataTable() {
  const { metrics, isConnected } = useSensorData();

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

  const formatValue = (value) => {
    if (value === null || value === undefined) return '--';
    return typeof value === 'number' ? value.toFixed(2) : value;
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title as="h5" className="mb-0">
          Sense HAT Sensor Data
        </Card.Title>
        <Badge bg={isConnected ? 'success' : 'danger'}>
          {isConnected ? 'Live' : 'Offline'}
        </Badge>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
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
                <td className="fw-semibold">{formatValue(metrics[row.key])}</td>
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
