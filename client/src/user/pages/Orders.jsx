import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cancelOrder, fetchOrderHistory, selectOrderError, selectOrderHistory, selectOrderStatus } from '../../redux/slices/orderSlice.js';

import { currency } from '../../App.jsx';
import { useNavigate } from 'react-router-dom';

// Add any custom styles here if needed

const UserOrderPage = () => {
  const dispatch = useDispatch();
  const navigate= useNavigate()
  const orders = useSelector(selectOrderHistory);
  const status = useSelector(selectOrderStatus);
  const error = useSelector(selectOrderError);
  const userId = localStorage.getItem('userId'); 
  useEffect(() => {
   // Assuming `userId` is stored in localStorage
    if (userId) {
      dispatch(fetchOrderHistory(userId));
    }
  }, [dispatch,userId]);

 
  
  
  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`); // Navigate to order details page
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">My Orders</h1>

      {status === 'loading' && <div className="text-center">Loading...</div>}
      {status === 'failed' && <div className="alert alert-danger text-center">{error}</div>}

      {/* Display orders even if they're empty */}
      {orders.length === 0 && status !== 'loading' && (
        <div className="text-center">No orders found!</div>
      )}

      <div className="row">
      {orders.length > 0 &&
  orders.map((order, index) => (
    <div className="col-md-6 col-lg-4 mb-4" key={order.id || order._id || index}>
      <div className="card shadow-sm h-100">
        <div className="card-body">
          <h5 className="card-title">Order ID: {order.id || order._id}</h5>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Total Price:</strong> {currency}
            {order.totalPrice.toFixed(2)}
          </p>
          <p>
            <strong>Total Quantity:</strong> {order.totalQuantity}
          </p>
          <div>
            <strong>Items:</strong>
            <ul>
              {order.items.map((item) => (
                <li key={item._id || Math.random()}> {/* Generate unique keys */}
                  {item.product
                    ? `${item.product.name} - ${item.quantity} x ${currency}${item.price.toFixed(
                        2
                      )}`
                    : 'Product no longer available'}
                  {item.size && ` (Size: ${item.size})`}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card-footer text-center">
         
          
            <button className="btn btn-info btn-sm ml-2" onClick={() => handleViewDetails(order._id)}>
                  View Details
                </button>
        </div>
      </div>
    </div>
  ))}

      </div>
    </div>
  );
};

export default UserOrderPage;
