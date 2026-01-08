import { useContext } from 'react';
import { StorageContext } from '../contexts/StorageContext';

/**
 * useStorage hook
 * @returns {Object}
 * @description Provides the StorageContext to the component.
 */
export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};

