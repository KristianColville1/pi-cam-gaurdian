import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/apiClient.js';

export const ApiDocsContext = createContext();

/**
 * ApiDocsProvider - manages OpenAPI specification data
 */
export const ApiDocsProvider = ({ children }) => {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApiDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/docs/openapi.json');
      setSpec(response.data);
    } catch (err) {
      console.error('Failed to fetch API docs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load API documentation');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Optionally fetch on mount, or let components trigger it
    // fetchApiDocs();
  }, [fetchApiDocs]);

  const value = {
    spec,
    loading,
    error,
    fetchApiDocs,
    refetch: fetchApiDocs,
  };

  return <ApiDocsContext.Provider value={value}>{children}</ApiDocsContext.Provider>;
};

