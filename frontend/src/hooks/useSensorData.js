import { useContext } from 'react';
import { SensorDataContext } from '../contexts/SensorDataContext';

export const useSensorData = () => {
  const context = useContext(SensorDataContext);
  if (!context) {
    throw new Error('useSensorData must be used within a SensorDataProvider');
  }
  return context;
};

