import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/apiClient.js';

export const ApiDocsContext = createContext();

/**
 * ApiDocsProvider - manages OpenAPI specification data
 * @param {Object} children - The children components
 * @returns {JSX.Element}
 * @description Provides the ApiDocsContext to the component.
 */
export const ApiDocsProvider = ({ children }) => {
  const [spec, setSpec] = useState(null);
  const [piGuardSpec, setPiGuardSpec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [piGuardLoading, setPiGuardLoading] = useState(false);
  const [error, setError] = useState(null);
  const [piGuardError, setPiGuardError] = useState(null);

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

  const fetchPiGuardApiDocs = useCallback(async () => {
    setPiGuardLoading(true);
    setPiGuardError(null);
    try {
      const response = await apiClient.get('/docs/pi-guard/openapi.json');
      setPiGuardSpec(response.data);
    } catch (err) {
      console.error('Failed to fetch Pi Guard API docs:', err);
      setPiGuardError(err.response?.data?.message || err.message || 'Failed to load Pi Guard API documentation');
    } finally {
      setPiGuardLoading(false);
    }
  }, []);

  useEffect(() => {
    // Optionally fetch on mount, or let components trigger it
    // fetchApiDocs();
  }, [fetchApiDocs]);

  const value = {
    spec,
    piGuardSpec,
    loading,
    piGuardLoading,
    error,
    piGuardError,
    fetchApiDocs,
    fetchPiGuardApiDocs,
    refetch: fetchApiDocs,
    refetchPiGuard: fetchPiGuardApiDocs,
  };

  return <ApiDocsContext.Provider value={value}>{children}</ApiDocsContext.Provider>;
};

