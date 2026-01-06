import React, { useMemo } from 'react';
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

// Register Chart.js components
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

function SensorChart({ title, dataKey, unit, history, color }) {
  const { isDark } = useTheme();

  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const labels = history.map((_, index) => {
      const date = new Date(history[index].timestamp);
      return date.toLocaleTimeString();
    });

    const data = history.map((item) => {
      const value = item[dataKey];
      return value !== null && value !== undefined ? parseFloat(value) : null;
    });

    const borderColor = color || (isDark ? '#6ea8fe' : '#0d6efd');
    const backgroundColor = isDark
      ? 'rgba(110, 168, 254, 0.1)'
      : 'rgba(13, 110, 253, 0.1)';

    return {
      labels,
      datasets: [
        {
          label: `${title} (${unit})`,
          data,
          borderColor,
          backgroundColor,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
        },
      ],
    };
  }, [history, dataKey, title, unit, color, isDark]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: isDark ? '#adb5bd' : '#212529',
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: isDark ? 'rgba(33, 37, 41, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: isDark ? '#fff' : '#212529',
          bodyColor: isDark ? '#adb5bd' : '#212529',
          borderColor: isDark ? '#495057' : '#dee2e6',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: isDark ? '#adb5bd' : '#212529',
            maxTicksLimit: 8,
          },
        },
        y: {
          display: true,
          grid: {
            color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: isDark ? '#adb5bd' : '#212529',
          },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    }),
    [isDark]
  );

  if (!history || history.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
        <p className="text-muted mb-0">No data available</p>
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
}

export default SensorChart;

