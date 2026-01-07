import React from 'react';
import { Card } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useTheme } from '@hooks/useTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * HistoricalChart component
 * @param {Object} props - The component props
 * @param {string} props.title - The title of the chart
 * @param {Array} props.data - The data for the chart
 * @param {Array} props.labels - The labels for the chart
 * @param {string} props.color - The color of the chart
 * @param {string} props.unit - The unit of the chart
 * @param {string} props.yAxisLabel - The label for the y-axis
 * @returns {JSX.Element} The HistoricalChart component
 */
function HistoricalChart({ title, data, labels, color, unit = '', yAxisLabel }) {
  const { isDark } = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <p className="text-muted">No data available</p>
        </Card.Body>
      </Card>
    );
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const textColor = isDark ? '#adb5bd' : '#212529';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? 'rgba(33, 37, 41, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#fff' : '#212529',
        bodyColor: textColor,
        borderColor: isDark ? '#495057' : '#dee2e6',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            return `${context.parsed.y}${unit}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          color: textColor,
        },
        ticks: {
          color: textColor,
          callback: (value) => `${value}${unit}`,
        },
        grid: {
          color: gridColor,
        },
      },
      x: {
        ticks: {
          color: textColor,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: gridColor,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <div style={{ height: '300px', position: 'relative' }}>
          <Line data={chartData} options={options} />
        </div>
      </Card.Body>
    </Card>
  );
}

export default HistoricalChart;

