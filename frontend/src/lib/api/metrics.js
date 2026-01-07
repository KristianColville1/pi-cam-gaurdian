import apiClient from '../apiClient';

export const metricsAPI = {
  /**
   * Get paginated metrics with optional filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 50, max: 100)
   * @param {string} params.sort - Sort field (default: 'created_at')
   * @param {string} params.order - Sort order 'ASC' or 'DESC' (default: 'DESC')
   * @param {string} params.device_id - Filter by device ID
   * @param {string} params.start_date - Start date (ISO string)
   * @param {string} params.end_date - End date (ISO string)
   */
  getMetrics: async (params = {}) => {
    const response = await apiClient.get('/metrics', { params });
    return response.data;
  },

  /**
   * Get latest metric
   * @param {Object} params - Query parameters
   * @param {string} params.device_id - Filter by device ID
   */
  getLatestMetric: async (params = {}) => {
    const response = await apiClient.get('/metrics/latest', { params });
    return response.data;
  },

  /**
   * Get statistics
   * @param {Object} params - Query parameters
   * @param {string} params.device_id - Filter by device ID
   * @param {string} params.start_date - Start date (ISO string)
   * @param {string} params.end_date - End date (ISO string)
   */
  getStatistics: async (params = {}) => {
    const response = await apiClient.get('/metrics/statistics', { params });
    return response.data;
  },

  /**
   * Get metric by ID
   * @param {string} id - Metric ID
   */
  getMetricById: async (id) => {
    const response = await apiClient.get(`/metrics/${id}`);
    return response.data;
  },
};

