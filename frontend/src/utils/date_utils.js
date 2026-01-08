/**
 * Format timestamp to human-readable date string
 * @param {string|Date} timestamp - ISO timestamp string or Date object
 * @returns {string} Formatted date string (e.g., "Jan 8, 2026, 04:16 PM")
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

