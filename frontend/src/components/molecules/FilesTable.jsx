import React, { useState, useEffect } from 'react';
import { Table, Button, ButtonGroup, Spinner, Form, Pagination } from 'react-bootstrap';
import { FaEye, FaTrash } from 'react-icons/fa';
import { formatTimestamp } from '../../utils/date_utils';
import { storageAPI } from '../../lib/api/storage';
import { useToast } from '@hooks/useToast';

const CDN_BASE_URL = 'https://pi-guardian.b-cdn.net/';
const MAX_ROWS_PER_PAGE = 10;

/**
 * FilesTable component
 * Displays files in a table with filtering and pagination
 * @param {Object} props - Component props
 * @param {Function} props.onViewImage - Callback when view button is clicked
 * @returns {JSX.Element} The FilesTable component
 */
function FilesTable({ onViewImage }) {
  const { triggerToast } = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: MAX_ROWS_PER_PAGE,
    sort: 'created_at',
    order: 'DESC',
    file_type: 'image',
  });

  const fetchFiles = async (newFilters = {}) => {
    setLoading(true);
    try {
      const params = { ...filters, ...newFilters };
      const response = await storageAPI.getFiles(params);
      setFiles(response.data || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      triggerToast('danger', 'Error', 'Failed to load files');
      setFiles([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchFiles(newFilters);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value, page: 1 };
    setFilters(newFilters);
    fetchFiles(newFilters);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }
    try {
      await storageAPI.deleteFile(fileId);
      triggerToast('success', 'File Deleted', 'File deleted successfully');
      fetchFiles(filters);
    } catch (error) {
      triggerToast('danger', 'Delete Failed', error.response?.data?.message || 'Failed to delete file');
    }
  };

  const getImageUrl = (image) => {
    if (!image?.path) return '';
    return `${CDN_BASE_URL}${image.path}`;
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
          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} files
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

  if (loading && files.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading files...</p>
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
              value={filters.file_type || ''}
              onChange={(e) => handleFilterChange('file_type', e.target.value || null)}
            >
              <option value="">All Types</option>
              <option value="image">Image</option>
            </Form.Select>
          </div>
          <div className="col-md-3">
            <Form.Select
              size="sm"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="created_at">Sort by Date</option>
              <option value="file_size">Sort by Size</option>
              <option value="file_type">Sort by Type</option>
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
              <th>Preview</th>
              <th>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  No files available
                </td>
              </tr>
            ) : (
              files.map((image) => (
                <tr key={image.id}>
                  <td>
                    <img
                      src={getImageUrl(image)}
                      alt={image.object_name}
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </td>
                  <td>{image.object_name || image.id}</td>
                  <td>{image.file_type || image.content_type || 'N/A'}</td>
                  <td>{image.file_size ? `${(image.file_size / 1024).toFixed(2)} KB` : 'N/A'}</td>
                  <td>{formatTimestamp(image.created_at)}</td>
                  <td>
                    <ButtonGroup size="sm">
                      <Button
                        variant="outline-light"
                        onClick={() => onViewImage(image)}
                        title="View image"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDelete(image.id)}
                        title="Delete file"
                      >
                        <FaTrash />
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {renderPagination()}
    </div>
  );
}

export default FilesTable;

