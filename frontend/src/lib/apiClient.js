import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * apiClient
 * @returns {Object} The apiClient instance
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * @param {Object} config - The request config
 * @returns {Object} The request config
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add any default headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * @param {Object} response - The response
 * @returns {Object} The response
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      // Could dispatch logout action here
    }
    return Promise.reject(error);
  }
);

export default apiClient;

