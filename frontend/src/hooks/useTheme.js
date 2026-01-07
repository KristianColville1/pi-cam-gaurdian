import { useContext } from 'react';
import { ThemeContext } from '@contexts/ThemeContext';

/**
 * Hook to use theme context
 * @returns {Object}
 * @description Provides the ThemeContext to the component.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

