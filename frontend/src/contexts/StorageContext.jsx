import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { storageAPI } from '../lib/api/storage';

export const StorageContext = createContext();

/**
 * StorageProvider - manages storage files and recordings data with polling
 * @param {Object} children - The children components
 * @returns {JSX.Element}
 * @description Provides the StorageContext to the component.
 */
export const StorageProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState({ files: false, recordings: false });
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ files: null, recordings: null });
  const [isPolling, setIsPolling] = useState(false);
  
  const pollingIntervalRef = useRef(null);
  const lastFetchTimeRef = useRef({ files: null, recordings: null });

  const fetchFiles = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading((prev) => ({ ...prev, files: true }));
    }
    setError(null);

    try {
      const response = await storageAPI.getFiles({
        page: 1,
        limit: 50,
        sort: 'created_at',
        order: 'DESC',
        file_type: 'image',
      });
      
      setFiles(response.data || []);
      setPagination((prev) => ({ ...prev, files: response.pagination || null }));
      lastFetchTimeRef.current.files = Date.now();
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load files');
      setFiles([]);
    } finally {
      if (showLoading) {
        setLoading((prev) => ({ ...prev, files: false }));
      }
    }
  }, []);

  const fetchRecordings = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading((prev) => ({ ...prev, recordings: true }));
    }
    setError(null);

    try {
      const response = await storageAPI.getRecordings({
        page: 1,
        limit: 50,
        sort: 'created_at',
        order: 'DESC',
      });
      
      setRecordings(response.data || []);
      setPagination((prev) => ({ ...prev, recordings: response.pagination || null }));
      lastFetchTimeRef.current.recordings = Date.now();
    } catch (err) {
      console.error('Failed to fetch recordings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load recordings');
      setRecordings([]);
    } finally {
      if (showLoading) {
        setLoading((prev) => ({ ...prev, recordings: false }));
      }
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return; // Already polling
    }

    setIsPolling(true);
    
    // Poll every 10 seconds for files and recordings
    pollingIntervalRef.current = setInterval(() => {
      fetchFiles(false);
      fetchRecordings(false);
    }, 10000);
  }, [fetchFiles, fetchRecordings]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
    }
  }, []);

  const refreshFiles = useCallback(() => {
    fetchFiles(true);
  }, [fetchFiles]);

  const refreshRecordings = useCallback(() => {
    fetchRecordings(true);
  }, [fetchRecordings]);

  const refreshAll = useCallback(() => {
    fetchFiles(true);
    fetchRecordings(true);
  }, [fetchFiles, fetchRecordings]);

  // Initial fetch
  useEffect(() => {
    fetchFiles(true);
    fetchRecordings(true);
  }, [fetchFiles, fetchRecordings]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const value = {
    files,
    recordings,
    loading,
    error,
    pagination,
    isPolling,
    fetchFiles,
    fetchRecordings,
    refreshFiles,
    refreshRecordings,
    refreshAll,
    startPolling,
    stopPolling,
  };

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
};

