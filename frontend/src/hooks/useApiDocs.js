import { useContext } from 'react';
import { ApiDocsContext } from '../contexts/ApiDocsContext';

/**
 * useApiDocs hook
 * @returns {Object}
 * @description Provides the ApiDocsContext to the component.
 */
export const useApiDocs = () => {
  const context = useContext(ApiDocsContext);
  if (!context) {
    throw new Error('useApiDocs must be used within an ApiDocsProvider');
  }
  return context;
};

