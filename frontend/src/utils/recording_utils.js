/**
 * Recording status codes and their descriptions
 */
export const RECORDING_STATUS = {
  0: { label: 'Queued', variant: 'secondary' },
  1: { label: 'Processing', variant: 'warning' },
  2: { label: 'Encoding', variant: 'info' },
  3: { label: 'Finished', variant: 'success' },
  4: { label: 'Resolution Finished', variant: 'success' },
  5: { label: 'Failed', variant: 'danger' },
};

/**
 * Get recording status info by status code or string
 * @param {number|string} status - Status code (0-5) or status string
 * @returns {Object} Status info with label and variant
 */
export const getRecordingStatus = (status) => {
  if (status === null || status === undefined) {
    return { label: 'Unknown', variant: 'secondary' };
  }

  // Handle numeric status codes
  if (typeof status === 'number' && RECORDING_STATUS[status]) {
    return RECORDING_STATUS[status];
  }

  // Handle string status (like 'finished', 'processing', etc.)
  const statusLower = String(status).toLowerCase();
  const statusMap = {
    'queued': RECORDING_STATUS[0],
    'processing': RECORDING_STATUS[1],
    'encoding': RECORDING_STATUS[2],
    'finished': RECORDING_STATUS[3],
    'resolution_finished': RECORDING_STATUS[4],
    'resolution finished': RECORDING_STATUS[4],
    'failed': RECORDING_STATUS[5],
  };

  return statusMap[statusLower] || { label: String(status), variant: 'secondary' };
};

