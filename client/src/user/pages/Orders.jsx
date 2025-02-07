import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cancelOrder, fetchOrderHistory, selectOrderError, selectOrderHistory, selectOrderStatus } from '../../redux/slices/orderSlice.js';
import { currency } from '../../App.jsx';
import { useNavigate } from 'react-router-dom';
import { Pagination } from 'react-bootstrap';

const UserOrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orders = useSelector(selectOrderHistory);
  const status = useSelector(selectOrderStatus);
  const error = useSelector(selectOrderError);

  const userId = localStorage.getItem('userId'); 

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10; // Number of orders to display per page

  useEffect(() => {
    if (userId) {
      dispatch(fetchOrderHistory(userId));
    }
  }, [dispatch, userId]);

  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };
  

  // Sort orders by date in descending order
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Pagination calculations
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">My Orders</h1>

      {status === 'loading' && <div className="text-center">Loading...</div>}
      {status === 'failed' && <div className="alert alert-danger text-center">{error}</div>}

      {orders.length === 0 && status !== 'loading' && (
        <div className="text-center">No orders found!</div>
      )}

<ul className="list-group">
  {currentOrders.length > 0 &&
    currentOrders.map((order) => (
      <li
        key={order.id || order._id}
        className="list-group-item d-flex justify-content-between align-items-start"
      >
        <div>
          <h5>Order ID: {order.id || order._id}</h5>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Payment Status:</strong> {order.paymentStatus}
          </p>
          <p>
            <strong>Payment Method:</strong> {order.paymentMethod}
          </p>
          <p>
            <strong>Total Price:</strong> {currency}
            {order.totalPrice && !isNaN(order.totalPrice) ? order.totalPrice.toFixed(2) : 'N/A'}
          </p>
          <p>
            <strong>Order Date:</strong>{' '}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Items:</strong>
          </p>
          <ul>
  {order.items?.length > 0 ? (
    order.items.map((item) => (
      <li key={item._id || Math.random()}>
        {item.product
          ? `${item.product.name} - ${item.quantity} x ${currency}${item.price && !isNaN(item.price) ? item.price.toFixed(2) : 'N/A'}`
          : 'Product no longer available'}
        {item.size && ` (Size: ${item.size})`}
      </li>
    ))
  ) : (
    <li>No items found.</li>
  )}
</ul>

        </div>
        <div>
          <button
            className="btn btn-info btn-sm"
            onClick={() => handleViewDetails(order._id)}
          >
            View Details
          </button>
        </div>
      </li>
    ))}
</ul>


      {/* Pagination */}
      {sortedOrders.length > ordersPerPage && (
        <Pagination className="justify-content-center mt-4">
          <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
          {[...Array(totalPages).keys()].map((num) => (
            <Pagination.Item
              key={num + 1}
              active={currentPage === num + 1}
              onClick={() => paginate(num + 1)}
            >
              {num + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      )}
    </div>
  );
};

export default UserOrderPage;
