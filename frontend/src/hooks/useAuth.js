import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

/**
 * Hook to use auth context
 * @returns {Object}
 * @description Provides the AuthContext to the component.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

