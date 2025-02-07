import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { currency } from '../../App';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SalesReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totals, setTotals] = useState({ totalSales: 0, totalOrders: 0, totalDiscount: 0 });

  // Fetch Sales Report
  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/api/reports/generate', {
        params: {
          filter,
          startDate: startDate ? moment(startDate).format('YYYY-MM-DD') : undefined,
          endDate: endDate ? moment(endDate).format('YYYY-MM-DD') : undefined,
        },
      });

      // Sort orders by createdAt (newest to oldest)
      const sortedOrders = response.data.data.orders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setData(sortedOrders);
      setTotals({
        totalSales: response.data.data.totalSales,
        totalOrders: response.data.data.totalOrders,
        totalDiscount: response.data.data.totalDiscount,
      });

      toast.success('Sales report generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch sales report.');
    } finally {
      setLoading(false);
    }
  };

  // Download Report
  const downloadReport = async (type) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/reports/download/${type}`, {
        responseType: 'blob',
        params: {
          startDate: startDate ? moment(startDate).format('YYYY-MM-DD') : undefined,
          endDate: endDate ? moment(endDate).format('YYYY-MM-DD') : undefined,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${type.toUpperCase()} report downloaded successfully!`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to download ${type.toUpperCase()} report.`);
    }
  };

  return (
    <div>
      <h1 className="text-center mb-4">Sales Report</h1>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Filter Options */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Filter By</label>
          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {filter === 'custom' && (
          <>
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}
        <div className="col-md-3 d-flex align-items-end">
          <button className="btn btn-primary w-100" onClick={fetchSalesReport} disabled={loading}>
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="p-3 bg-light border rounded">
            <h5>Total Sales</h5>
            <p>{currency}{totals.totalSales}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-light border rounded">
            <h5>Total Orders</h5>
            <p>{totals.totalOrders}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-light border rounded">
            <h5>Total Discount</h5>
            <p>{currency}{totals.totalDiscount}</p>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Order ID</th>
            <th>Total Price</th>
            <th>Final Price</th>
            <th>Discount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{currency}{order.totalPrice}</td>
              <td>{currency}{order.finalPrice}</td>
              <td>{currency}{order.discountAmount}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Download Buttons */}
      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-success me-2" onClick={() => downloadReport('pdf')}>
          Download PDF
        </button>
        <button className="btn btn-success" onClick={() => downloadReport('excel')}>
          Download Excel
        </button>
      </div>
    </div>
  );
};

export default SalesReport;
