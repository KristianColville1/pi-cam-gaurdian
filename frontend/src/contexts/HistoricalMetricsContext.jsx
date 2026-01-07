import React, { createContext, useState, useCallback } from 'react';
import { metricsAPI } from '../lib/api/metrics';

export const HistoricalMetricsContext = createContext();

/**
 * HistoricalMetricsProvider - manages historical sensor metrics data
 * @param {Object} children - The children components
 * @returns {JSX.Element}
 * @description Provides the HistoricalMetricsContext to the component.
 */
export const HistoricalMetricsProvider = ({ children }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    start_date: null,
    end_date: null,
    device_id: null,
    page: 1,
    limit: 100,
    sort: 'recorded_at',
    order: 'DESC',
  });

  const fetchMetrics = useCallback(async (newFilters = {}) => {
    setLoading(true);
    setError(null);
    
    return new Promise((resolve) => {
      setFilters((prev) => {
        const currentFilters = { ...prev, ...newFilters };
        
        // Build query params
        const params = {
          page: currentFilters.page,
          limit: currentFilters.limit,
          sort: currentFilters.sort,
          order: currentFilters.order,
        };

        if (currentFilters.start_date) {
          params.start_date = new Date(currentFilters.start_date).toISOString();
        }

        if (currentFilters.end_date) {
          params.end_date = new Date(currentFilters.end_date).toISOString();
        }

        if (currentFilters.device_id) {
          params.device_id = currentFilters.device_id;
        }

        metricsAPI.getMetrics(params)
          .then((response) => {
            setMetrics(response.data || []);
            setPagination(response.pagination || null);
            setLoading(false);
            resolve(response);
          })
          .catch((err) => {
            console.error('Failed to fetch metrics:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load metrics');
            setMetrics([]);
            setPagination(null);
            setLoading(false);
            resolve(null);
          });

        return currentFilters;
      });
    });
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      start_date: null,
      end_date: null,
      device_id: null,
      page: 1,
      limit: 100,
      sort: 'recorded_at',
      order: 'DESC',
    };
    setFilters(defaultFilters);
  }, []);

  const value = {
    metrics,
    loading,
    error,
    pagination,
    filters,
    fetchMetrics,
    updateFilters,
    resetFilters,
  };

  return (
    <HistoricalMetricsContext.Provider value={value}>
      {children}
    </HistoricalMetricsContext.Provider>
  );
};

