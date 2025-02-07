import React from 'react';
import { Table } from 'react-bootstrap';

const ReportTable = ({ report }) => {
    if (!report) {
      console.log('Report is null or undefined.');
      return <p>No report data available. Please generate a report.</p>;
    }
  
    if (!report.categories || report.categories.length === 0) {
      console.log('Report categories are empty:', report.categories);
      return <p>No sales data found for the selected filters.</p>;
    }
  
    return (
      <div className="mt-4">
        <h5 className="mb-3">Sales Report</h5>
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>Category</th>
              <th>Quantity Sold</th>
              <th>Revenue</th>
              <th>Discount</th>
            </tr>
          </thead>
          <tbody>
            {report.categories.map((category, idx) => (
              <tr key={idx}>
                <td>{category.name || 'N/A'}</td>
                <td>{category.totalQuantity || 0}</td>
                <td>{category.totalRevenue || 0}</td>
                <td>{category.totalDiscount || 0}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };
  
export default ReportTable;
