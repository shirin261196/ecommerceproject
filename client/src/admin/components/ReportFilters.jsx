import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

const ReportFilters = ({ onFilter }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('');

  const handleQuickFilter = (period) => {
    const now = moment();
    let start, end;

    switch (period) {
      case '1-day':
        start = now.clone().subtract(1, 'day').startOf('day').format('YYYY-MM-DD');
        end = now.clone().endOf('day').format('YYYY-MM-DD');
        break;
      case '1-week':
        start = now.clone().subtract(1, 'week').startOf('day').format('YYYY-MM-DD');
        end = now.clone().endOf('day').format('YYYY-MM-DD');
        break;
      case '1-month':
        start = now.clone().subtract(1, 'month').startOf('day').format('YYYY-MM-DD');
        end = now.clone().endOf('day').format('YYYY-MM-DD');
        break;
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({ startDate, endDate});
  };
  const handlePeriodChange = (e) => {
    const selectedPeriod = e.target.value;
    setPeriod(selectedPeriod);
    handleQuickFilter(selectedPeriod);
  };
  return (
    <Form onSubmit={handleSubmit} className="p-3 border rounded bg-light">
      <Row className="mb-3">
        <Col>
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Col>
        <Col>
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Col>
        <Col>
          <Form.Label>Quick Filter</Form.Label>
          <Form.Select value={period} onChange={handlePeriodChange}>
            <option value="">Select</option>
            <option value="1-day">Last 1 Day</option>
            <option value="1-week">Last 1 Week</option>
            <option value="1-month">Last 1 Month</option>
          </Form.Select>
        </Col>
      </Row>
      <Button type="submit" variant="primary" className="w-100">
        Generate Report
      </Button>
    </Form>
  );
};

export default ReportFilters;
