import apiClient from '../apiClient';

/**
 * Storage API functions
 * Handles communication with the storage service
 */
export const storageAPI = {
  /**
   * Get paginated files
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 50, max: 100)
   * @param {string} params.sort - Sort field (default: 'created_at')
   * @param {string} params.order - Sort order 'ASC' or 'DESC' (default: 'DESC')
   * @param {string} params.file_type - Filter by file type
   */
  getFiles: async (params = {}) => {
    const response = await apiClient.get('/storage/files', { params });
    return response.data;
  },

  /**
   * Get file by ID
   * @param {string} id - File ID
   */
  getFileById: async (id) => {
    const response = await apiClient.get(`/storage/files/${id}`);
    return response.data;
  },

  /**
   * Update file
   * @param {string} id - File ID
   * @param {Object} data - File data to update
   */
  updateFile: async (id, data) => {
    const response = await apiClient.put(`/storage/files/${id}`, data);
    return response.data;
  },

  /**
   * Delete file (soft delete)
   * @param {string} id - File ID
   */
  deleteFile: async (id) => {
    const response = await apiClient.delete(`/storage/files/${id}`);
    return response.data;
  },

  /**
   * Get paginated recordings
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 50, max: 100)
   * @param {string} params.sort - Sort field (default: 'created_at')
   * @param {string} params.order - Sort order 'ASC' or 'DESC' (default: 'DESC')
   * @param {string} params.status - Filter by status
   */
  getRecordings: async (params = {}) => {
    const response = await apiClient.get('/storage/recordings', { params });
    return response.data;
  },

  /**
   * Get recording by ID
   * @param {string} id - Recording ID
   */
  getRecordingById: async (id) => {
    const response = await apiClient.get(`/storage/recordings/${id}`);
    return response.data;
  },

  /**
   * Update recording
   * @param {string} id - Recording ID
   * @param {Object} data - Recording data to update
   */
  updateRecording: async (id, data) => {
    const response = await apiClient.put(`/storage/recordings/${id}`, data);
    return response.data;
  },

  /**
   * Delete recording (soft delete)
   * @param {string} id - Recording ID
   */
  deleteRecording: async (id) => {
    const response = await apiClient.delete(`/storage/recordings/${id}`);
    return response.data;
  },
};

export default storageAPI;

