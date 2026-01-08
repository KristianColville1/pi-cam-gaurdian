import React, { useState, useEffect } from 'react';
import { Table, Button, ButtonGroup, Spinner, Form, Pagination } from 'react-bootstrap';
import { FaEye, FaTrash } from 'react-icons/fa';
import { formatTimestamp } from '../../utils/date_utils';
import { getRecordingStatus } from '../../utils/recording_utils';
import { storageAPI } from '../../lib/api/storage';
import { useToast } from '@hooks/useToast';
import { RECORDING_STATUS } from '../../utils/recording_utils';

const MAX_ROWS_PER_PAGE = 10;

/**
 * RecordingsTable component
 * Displays recordings in a table with filtering and pagination
 * @param {Object} props - Component props
 * @param {Function} props.onViewRecording - Callback when view button is clicked
 * @returns {JSX.Element} The RecordingsTable component
 */
function RecordingsTable({ onViewRecording }) {
  const { triggerToast } = useToast();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: MAX_ROWS_PER_PAGE,
    sort: 'created_at',
    order: 'DESC',
    status: '',
  });

  const fetchRecordings = async (newFilters = {}) => {
    setLoading(true);
    try {
      const params = { ...filters, ...newFilters };
      if (!params.status || params.status === '') delete params.status;
      const response = await storageAPI.getRecordings(params);
      setRecordings(response.data || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
      triggerToast('danger', 'Error', 'Failed to load recordings');
      setRecordings([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchRecordings(newFilters);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value, page: 1 };
    setFilters(newFilters);
    fetchRecordings(newFilters);
  };

  const handleDelete = async (recordingId) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return;
    }
    try {
      await storageAPI.deleteRecording(recordingId);
      triggerToast('success', 'Recording Deleted', 'Recording deleted successfully');
      fetchRecordings(filters);
    } catch (error) {
      triggerToast('danger', 'Delete Failed', error.response?.data?.message || 'Failed to delete recording');
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const items = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === pagination.page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} recordings
        </div>
        <Pagination size="sm">
          <Pagination.Prev
            disabled={!pagination.hasPrevPage}
            onClick={() => pagination.hasPrevPage && handlePageChange(pagination.page - 1)}
          />
          {items}
          <Pagination.Next
            disabled={!pagination.hasNextPage}
            onClick={() => pagination.hasNextPage && handlePageChange(pagination.page + 1)}
          />
        </Pagination>
      </div>
    );
  };

  if (loading && recordings.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading recordings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <Form className="row g-2">
          <div className="col-md-3">
            <Form.Select
              size="sm"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || null)}
            >
              <option value="">All Statuses</option>
              {Object.entries(RECORDING_STATUS).map(([code, status]) => (
                <option key={code} value={code}>
                  {status.label}
                </option>
              ))}
            </Form.Select>
          </div>
          <div className="col-md-3">
            <Form.Select
              size="sm"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="created_at">Sort by Date</option>
              <option value="recorded_at">Sort by Recorded</option>
              <option value="status">Sort by Status</option>
              <option value="uploaded_at">Sort by Uploaded</option>
            </Form.Select>
          </div>
          <div className="col-md-2">
            <Form.Select
              size="sm"
              value={filters.order}
              onChange={(e) => handleFilterChange('order', e.target.value)}
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </Form.Select>
          </div>
        </Form>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Duration</th>
              <th>Size</th>
              <th>Status</th>
              <th>Recorded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recordings.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  No recordings available
                </td>
              </tr>
            ) : (
              recordings.map((recording) => {
                const statusInfo = getRecordingStatus(recording.status);
                return (
                  <tr key={recording.id}>
                    <td>{recording.title || `Recording ${recording.id}`}</td>
                    <td>{recording.duration ? `${recording.duration}s` : 'N/A'}</td>
                    <td>{recording.file_size ? `${(recording.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</td>
                    <td>
                      <span className={`badge bg-${statusInfo.variant}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>{formatTimestamp(recording.recorded_at || recording.created_at)}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-light"
                          onClick={() => onViewRecording(recording)}
                          title="View recording"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => handleDelete(recording.id)}
                          title="Delete recording"
                        >
                          <FaTrash />
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {renderPagination()}
    </div>
  );
}

export default RecordingsTable;

