import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrders,
  selectOrders,
  selectOrderStatus,
  selectOrderError,
} from '../../redux/slices/adminSlice.js';
import { Button, Table, Spinner, Alert, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { currency } from '../../App';

const AdminOrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orders = useSelector(selectOrders);
  const status = useSelector(selectOrderStatus);
  const error = useSelector(selectOrderError);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
 

  
  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="text-center mb-4">Admin Order Management</h2>

     

      
  
      <div className="table-responsive">
        <Table striped bordered hover className="text-center">
          <thead className="thead-dark">
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Items</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>
                <td>{order.user?.name || 'Unknown'}</td>
                <td>
                  {order.items.map((item) => (
                    <div
                      key={item.product._id}
                      className="d-flex justify-content-between align-items-center mb-2"
                    >
                      <div>
                        <strong>{item.product.name}</strong> - {currency}
                        {item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </td>
                <td>
                  {/* Calculate total price for the order */}
                  {order.items.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                  )}
                </td>
                {/* Display the order status in the Status column */}
                <td>
                  <span
                    className={`ms-2 ${
                      order.status === 'DELIVERED'
                        ? 'text-success'
                        : order.status === 'CANCELLED'
                        ? 'text-danger'
                        : 'text-warning'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    View Order
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="d-flex justify-content-center">
        {totalPages > 1 && (
          <Pagination>
            <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i}
                active={i + 1 === currentPage}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} />
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default AdminOrderManagement;
