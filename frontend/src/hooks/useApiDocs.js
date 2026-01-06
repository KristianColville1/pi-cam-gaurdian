import { useContext } from 'react';
import { ApiDocsContext } from '../contexts/ApiDocsContext';

export const useApiDocs = () => {
  const context = useContext(ApiDocsContext);
  if (!context) {
    throw new Error('useApiDocs must be used within an ApiDocsProvider');
  }
  return context;
};

