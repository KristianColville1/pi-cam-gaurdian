import apiClient from '../apiClient.js';

/**
 * Camera API functions
 * Handles communication with the camera service
 */
export const cameraAPI = {
  /**
   * Capture an image from the camera
   * @returns {Promise} Axios response with image data
   */
  captureImage: async () => {
    return apiClient.get('/pi-guard/camera/capture');
  },

  /**
   * Start video recording
   * @returns {Promise} Axios response
   */
  startRecording: async () => {
    return apiClient.get('/pi-guard/camera/recording/start');
  },

  /**
   * Stop video recording
   * @returns {Promise} Axios response
   */
  stopRecording: async () => {
    return apiClient.get('/pi-guard/camera/recording/stop');
  },

  /**
   * Get events/logs
   * @param {Object} params - Query parameters (limit, offset, etc.)
   * @returns {Promise} Axios response
   */
  getEvents: async (params = {}) => {
    return apiClient.get('/pi-guard/camera/events', { params });
  },

  /**
   * Get system status/health
   * @returns {Promise} Axios response
   */
  getStatus: async () => {
    return apiClient.get('/pi-guard/camera/status');
  },
};

export default cameraAPI;

