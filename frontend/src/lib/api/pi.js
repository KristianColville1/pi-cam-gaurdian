import apiClient from '../apiClient.js';

/**
 * Pi Guardian API functions
 * Handles communication with the Raspberry Pi FastAPI service
 */
export const piAPI = {
  /**
   * Capture an image from the camera
   * @returns {Promise} Axios response with image data
   */
  captureImage: async () => {
    return apiClient.post('/pi/capture');
  },

  /**
   * Start video recording
   * @returns {Promise} Axios response
   */
  startRecording: async () => {
    return apiClient.post('/pi/recording/start');
  },

  /**
   * Stop video recording
   * @returns {Promise} Axios response
   */
  stopRecording: async () => {
    return apiClient.post('/pi/recording/stop');
  },

  /**
   * Get recording status
   * @returns {Promise} Axios response
   */
  getRecordingStatus: async () => {
    return apiClient.get('/pi/recording/status');
  },

  /**
   * Get events/logs
   * @param {Object} params - Query parameters (limit, offset, etc.)
   * @returns {Promise} Axios response
   */
  getEvents: async (params = {}) => {
    return apiClient.get('/pi/events', { params });
  },

  /**
   * Get system status/health
   * @returns {Promise} Axios response
   */
  getStatus: async () => {
    return apiClient.get('/pi/status');
  },
};

export default piAPI;

