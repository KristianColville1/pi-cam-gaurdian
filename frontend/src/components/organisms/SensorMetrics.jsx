import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useSensorData } from '@hooks/useSensorData';
import MetricCard from '@components/molecules/MetricCard';
import { 
  FaTemperatureHalf, 
  FaGauge, 
  FaCompass,
  FaChartLine 
} from 'react-icons/fa6';
import {
    FaTint
} from 'react-icons/fa';

function SensorMetrics() {
  const { metrics, isConnected } = useSensorData();

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title as="h5" className="mb-0">
          Live Sensor Metrics
        </Card.Title>
        <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'} slow-bounce`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col xs={12} sm={6} lg={6}>
            <MetricCard
              title="Temperature (H)"
              value={metrics.temp_humidity}
              unit="°C"
              icon={FaTemperatureHalf}
              color="danger"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <MetricCard
              title="Temperature (P)"
              value={metrics.temp_pressure}
              unit="°C"
              icon={FaTemperatureHalf}
              color="warning"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <MetricCard
              title="Humidity"
              value={metrics.humidity}
              unit="%"
              icon={FaTint}
              color="info"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <MetricCard
              title="Pressure"
              value={metrics.pressure}
              unit="mbar"
              icon={FaGauge}
              color="primary"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <MetricCard
              title="Pitch"
              value={metrics.pitch}
              unit="°"
              icon={FaCompass}
              color="secondary"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <MetricCard
              title="Roll"
              value={metrics.roll}
              unit="°"
              icon={FaCompass}
              color="secondary"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <MetricCard
              title="Yaw"
              value={metrics.yaw}
              unit="°"
              icon={FaCompass}
              color="secondary"
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <MetricCard
              title="Acceleration"
              value={
                metrics.accel_x !== null && metrics.accel_y !== null && metrics.accel_z !== null
                  ? Math.sqrt(
                      Math.pow(metrics.accel_x, 2) +
                      Math.pow(metrics.accel_y, 2) +
                      Math.pow(metrics.accel_z, 2)
                    ).toFixed(2)
                  : null
              }
              unit="g"
              icon={FaChartLine}
              color="success"
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default SensorMetrics;

