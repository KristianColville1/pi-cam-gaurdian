import { useContext } from 'react';
import { HistoricalMetricsContext } from '../contexts/HistoricalMetricsContext';

/**
 * useHistoricalMetrics hook
 * @returns {Object}
 * @description Provides the HistoricalMetricsContext to the component.
 */
export const useHistoricalMetrics = () => {
  const context = useContext(HistoricalMetricsContext);
  if (!context) {
    throw new Error('useHistoricalMetrics must be used within a HistoricalMetricsProvider');
  }
  return context;
};

