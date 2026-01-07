import React from 'react';
import { Card } from 'react-bootstrap';
import { useTheme } from '@hooks/useTheme';

/**
 * MetricCard component
 * @param {Object} props - The component props
 * @param {string} props.title - The title of the card
 * @param {number} props.value - The value of the card
 * @param {string} props.unit - The unit of the card
 * @param {React.ElementType} props.icon - The icon to display
 * @param {string} props.color - The color of the card
 * @param {number} props.trend - The trend of the card
 * @returns {JSX.Element} The MetricCard component
 */
function MetricCard({ title, value, unit, icon: Icon, color = 'primary', trend }) {
  const { isDark } = useTheme();

  const displayValue = value !== null && value !== undefined ? value : '--';
  const colorClass = `text-${color}`;

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Card.Title as="h6" className="text-muted mb-1 small text-uppercase">
              {title}
            </Card.Title>
            <div className="d-flex align-items-baseline">
              <span className={`fs-3 fw-bold ${colorClass}`}>{displayValue}</span>
              {unit && (
                <span className="text-muted ms-2 small">{unit}</span>
              )}
            </div>
          </div>
          {Icon && (
            <Icon
              size={24}
              className={colorClass}
              style={{ opacity: 0.7 }}
            />
          )}
        </div>
        {trend && (
          <div className="mt-2">
            <small className={`text-${trend > 0 ? 'success' : 'danger'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default MetricCard;

