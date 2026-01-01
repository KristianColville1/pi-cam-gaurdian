import apiClient from '../apiClient.js';

/**
 * Authentication API functions
 */

export const authAPI = {
  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise} Axios response
   */
  login: async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  /**
   * Register user
   * @param {Object} userData
   * @param {string} userData.email
   * @param {string} userData.password
   * @param {string} [userData.firstName]
   * @param {string} [userData.lastName]
   * @returns {Promise} Axios response
   */
  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  /**
   * Logout user
   * @returns {Promise} Axios response
   */
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Get current user
   * @returns {Promise} Axios response
   */
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },
};

export default authAPI;

