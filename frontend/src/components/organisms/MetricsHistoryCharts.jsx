import React, { useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useHistoricalMetrics } from '@hooks/useHistoricalMetrics';
import HistoricalChart from '@components/molecules/HistoricalChart';
import { format } from 'date-fns';

/**
 * MetricsHistoryCharts component
 * @returns {JSX.Element} The MetricsHistoryCharts component
 */
function MetricsHistoryCharts() {
  const { metrics } = useHistoricalMetrics();

  const chartData = useMemo(() => {
    if (!metrics || metrics.length === 0) {
      return {
        labels: [],
        temperature: { humidity: [], pressure: [] },
        humidity: [],
        pressure: [],
        orientation: { pitch: [], roll: [], yaw: [] },
        acceleration: { x: [], y: [], z: [] },
      };
    }

    // Sort by recorded_at (ascending for chart)
    const sortedMetrics = [...metrics].sort((a, b) => {
      const dateA = new Date(a.recorded_at || a.created_at);
      const dateB = new Date(b.recorded_at || b.created_at);
      return dateA - dateB;
    });

    const labels = sortedMetrics.map((m) => {
      const date = new Date(m.recorded_at || m.created_at);
      return format(date, 'MMM dd HH:mm');
    });

    return {
      labels,
      temperature: {
        humidity: sortedMetrics.map((m) => m.temp_humidity || null),
        pressure: sortedMetrics.map((m) => m.temp_pressure || null),
      },
      humidity: sortedMetrics.map((m) => m.humidity || null),
      pressure: sortedMetrics.map((m) => m.pressure || null),
      orientation: {
        pitch: sortedMetrics.map((m) => m.pitch || null),
        roll: sortedMetrics.map((m) => m.roll || null),
        yaw: sortedMetrics.map((m) => m.yaw || null),
      },
      acceleration: {
        x: sortedMetrics.map((m) => m.accel_x || null),
        y: sortedMetrics.map((m) => m.accel_y || null),
        z: sortedMetrics.map((m) => m.accel_z || null),
      },
    };
  }, [metrics]);

  return (
    <>
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <HistoricalChart
            title="Temperature (Humidity Sensor)"
            data={chartData.temperature.humidity}
            labels={chartData.labels}
            color="rgb(220, 53, 69)"
            unit="°C"
            yAxisLabel="Temperature (°C)"
          />
        </Col>
        <Col lg={6}>
          <HistoricalChart
            title="Temperature (Pressure Sensor)"
            data={chartData.temperature.pressure}
            labels={chartData.labels}
            color="rgb(255, 193, 7)"
            unit="°C"
            yAxisLabel="Temperature (°C)"
          />
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={6}>
          <HistoricalChart
            title="Humidity"
            data={chartData.humidity}
            labels={chartData.labels}
            color="rgb(13, 110, 253)"
            unit="%"
            yAxisLabel="Humidity (%)"
          />
        </Col>
        <Col lg={6}>
          <HistoricalChart
            title="Pressure"
            data={chartData.pressure}
            labels={chartData.labels}
            color="rgb(25, 135, 84)"
            unit=" mbar"
            yAxisLabel="Pressure (mbar)"
          />
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={4}>
          <HistoricalChart
            title="Pitch"
            data={chartData.orientation.pitch}
            labels={chartData.labels}
            color="rgb(108, 117, 125)"
            unit="°"
            yAxisLabel="Pitch (°)"
          />
        </Col>
        <Col lg={4}>
          <HistoricalChart
            title="Roll"
            data={chartData.orientation.roll}
            labels={chartData.labels}
            color="rgb(108, 117, 125)"
            unit="°"
            yAxisLabel="Roll (°)"
          />
        </Col>
        <Col lg={4}>
          <HistoricalChart
            title="Yaw"
            data={chartData.orientation.yaw}
            labels={chartData.labels}
            color="rgb(108, 117, 125)"
            unit="°"
            yAxisLabel="Yaw (°)"
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={4}>
          <HistoricalChart
            title="Acceleration X"
            data={chartData.acceleration.x}
            labels={chartData.labels}
            color="rgb(32, 201, 151)"
            unit=" g"
            yAxisLabel="Acceleration (g)"
          />
        </Col>
        <Col lg={4}>
          <HistoricalChart
            title="Acceleration Y"
            data={chartData.acceleration.y}
            labels={chartData.labels}
            color="rgb(32, 201, 151)"
            unit=" g"
            yAxisLabel="Acceleration (g)"
          />
        </Col>
        <Col lg={4}>
          <HistoricalChart
            title="Acceleration Z"
            data={chartData.acceleration.z}
            labels={chartData.labels}
            color="rgb(32, 201, 151)"
            unit=" g"
            yAxisLabel="Acceleration (g)"
          />
        </Col>
      </Row>
    </>
  );
}

export default MetricsHistoryCharts;

