import { useContext } from 'react';
import { SensorDataContext } from '../contexts/SensorDataContext';

/**
 * useSensorData hook
 * @returns {Object}
 * @description Provides the SensorDataContext to the component.
 */
export const useSensorData = () => {
  const context = useContext(SensorDataContext);
  if (!context) {
    throw new Error('useSensorData must be used within a SensorDataProvider');
  }
  return context;
};

