import React, { useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, ButtonGroup } from 'react-bootstrap';
import { FaDownload, FaSync, FaFilter } from 'react-icons/fa';
import { useHistoricalMetrics } from '@hooks/useHistoricalMetrics';
import MetricsHistoryCharts from '@components/organisms/MetricsHistoryCharts';
import { exportMetricsToPDF } from '@utils/pdfExport';
import { format } from 'date-fns';

/**
 * MetricsHistory page component
 * @returns {JSX.Element}
 * @description Displays the metrics history charts and provides filters to view the data.
 */
function MetricsHistory() {
  const { metrics, loading, error, pagination, filters, fetchMetrics, updateFilters, resetFilters } = useHistoricalMetrics();
  const chartsRef = useRef(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleDateChange = (field, value) => {
    updateFilters({ [field]: value, page: 1 });
  };

  const handleApplyFilters = () => {
    fetchMetrics({});
  };

  const handleResetFilters = () => {
    resetFilters();
    fetchMetrics();
  };

  const handleExportPDF = async () => {
    if (!chartsRef.current) {
      return;
    }

    try {
      const startDate = filters.start_date ? format(new Date(filters.start_date), 'yyyy-MM-dd') : null;
      const endDate = filters.end_date ? format(new Date(filters.end_date), 'yyyy-MM-dd') : null;
      const filename = `metrics-report-${startDate || 'all'}-${endDate || 'all'}.pdf`;

      await exportMetricsToPDF(chartsRef.current, {
        filename,
        startDate,
        endDate,
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage });
    fetchMetrics({ page: newPage });
  };

  return (
    <Container fluid className="py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-5 fw-bold mb-2">Metrics History</h1>
              <p className="text-muted">View and analyze historical sensor data</p>
            </div>
            <ButtonGroup>
              <Button
                variant="primary"
                onClick={handleExportPDF}
                disabled={loading || !metrics || metrics.length === 0}
              >
                <FaDownload className="me-2" />
                Export PDF
              </Button>
              <Button variant="outline-secondary" onClick={() => fetchMetrics()}>
                <FaSync className="me-2" />
                Refresh
              </Button>
            </ButtonGroup>
          </div>
        </Col>
      </Row>

      {/* Filters Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="d-flex align-items-center">
              <FaFilter className="me-2" />
              <Card.Title as="h5" className="mb-0">Filters</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={filters.start_date || ''}
                      onChange={(e) => handleDateChange('start_date', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={filters.end_date || ''}
                      onChange={(e) => handleDateChange('end_date', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Items per Page</Form.Label>
                    <Form.Select
                      value={filters.limit}
                      onChange={(e) => updateFilters({ limit: parseInt(e.target.value), page: 1 })}
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Sort By</Form.Label>
                    <Form.Select
                      value={filters.sort}
                      onChange={(e) => updateFilters({ sort: e.target.value })}
                    >
                      <option value="recorded_at">Recorded At</option>
                      <option value="created_at">Created At</option>
                      <option value="temp_humidity">Temperature (H)</option>
                      <option value="temp_pressure">Temperature (P)</option>
                      <option value="humidity">Humidity</option>
                      <option value="pressure">Pressure</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Order</Form.Label>
                    <Form.Select
                      value={filters.order}
                      onChange={(e) => updateFilters({ order: e.target.value })}
                    >
                      <option value="DESC">Descending</option>
                      <option value="ASC">Ascending</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <ButtonGroup>
                    <Button variant="primary" onClick={handleApplyFilters}>
                      Apply Filters
                    </Button>
                    <Button variant="outline-secondary" onClick={handleResetFilters}>
                      Reset
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Loading State */}
      {loading && (
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading metrics...</p>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Error State */}
      {error && !loading && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">
              <Alert.Heading>Error Loading Metrics</Alert.Heading>
              <p>{error}</p>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Charts Section */}
      {!loading && !error && metrics && metrics.length > 0 && (
        <div ref={chartsRef} className="chart-container">
          <MetricsHistoryCharts />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && (!metrics || metrics.length === 0) && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info">
              <Alert.Heading>No Metrics Found</Alert.Heading>
              <p>No metrics data available for the selected filters. Try adjusting your date range or filters.</p>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Pagination */}
      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <Row className="mt-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total records)
                  </div>
                  <ButtonGroup>
                    <Button
                      variant="outline-primary"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </ButtonGroup>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default MetricsHistory;

