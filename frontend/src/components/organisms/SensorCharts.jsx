import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useSensorData } from '@hooks/useSensorData';
import SensorChart from '@components/molecules/SensorChart';
import MultiSensorChart from '@components/molecules/MultiSensorChart';

/**
 * SensorCharts component
 * @returns {JSX.Element} The SensorCharts component
 */
function SensorCharts() {
  const { history } = useSensorData();

  return (
    <>
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <Card.Title as="h5" className="mb-0">
                Temperature Trends
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px', position: 'relative' }}>
                <SensorChart
                  title="Temperature (Humidity)"
                  dataKey="temp_humidity"
                  unit="°C"
                  history={history}
                  color="#dc3545"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <Card.Title as="h5" className="mb-0">
                Humidity
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px', position: 'relative' }}>
                <SensorChart
                  title="Humidity"
                  dataKey="humidity"
                  unit="%"
                  history={history}
                  color="#0dcaf0"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-4">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <Card.Title as="h5" className="mb-0">
                Pressure
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px', position: 'relative' }}>
                <SensorChart
                  title="Pressure"
                  dataKey="pressure"
                  unit="mbar"
                  history={history}
                  color="#0d6efd"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <Card.Title as="h5" className="mb-0">
                Orientation (Pitch, Roll, Yaw)
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px', position: 'relative' }}>
                <MultiSensorChart
                  title="Orientation"
                  history={history}
                  datasets={[
                    {
                      label: 'Pitch',
                      dataKey: 'pitch',
                      unit: '°',
                      color: '#dc3545',
                    },
                    {
                      label: 'Roll',
                      dataKey: 'roll',
                      unit: '°',
                      color: '#0dcaf0',
                    },
                    {
                      label: 'Yaw',
                      dataKey: 'yaw',
                      unit: '°',
                      color: '#0d6efd',
                    },
                  ]}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default SensorCharts;

