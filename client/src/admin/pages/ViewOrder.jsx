import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, selectOrders, updateTrackingStatus, approveReturnRequest } from '../../redux/slices/adminSlice.js';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Alert, Dropdown, Row, Col } from 'react-bootstrap';
import { currency } from '../../App.jsx';
import Swal from 'sweetalert2'; // Import SweetAlert

const ViewOrder = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orders = useSelector(selectOrders);

  // Find the specific order by ID
  const order = orders.find((o) => o._id === orderId);

  useEffect(() => {
    if (!orders.length) {
      dispatch(fetchOrders()); // Fetch orders if not already loaded
    }
  }, [dispatch, orders]);

  const handleTrackingStatusUpdate = async (productId, trackingStatus) => {
    try {
      await dispatch(updateTrackingStatus({ orderId, productId, trackingStatus }));
      dispatch(fetchOrders()); // Refresh orders after status update
    } catch (error) {
      console.error('Error updating tracking status:', error);
    }
  };

  const handleCancelOrder = (productId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        handleTrackingStatusUpdate(productId, 'CANCELLED'); // Change the status to 'CANCELLED'
        Swal.fire('Cancelled!', 'The order has been cancelled.', 'success');
      }
    });
  };

  const handleApproveReturn = (productId) => {
    Swal.fire({
      title: 'Approve Return?',
      text: 'Do you want to approve the return for this product?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(approveReturnRequest({ orderId, productId }));
        Swal.fire('Approved!', 'The return request has been approved.', 'success');
      }
    });
  };

  // Determine order status based on tracking statuses
  const getOrderStatus = () => {
    const trackingStatuses = order.items.map((item) => item.trackingStatus);

    if (trackingStatuses.every((status) => status === 'DELIVERED')) return 'DELIVERED';
    if (trackingStatuses.every((status) => status === 'CANCELLED')) return 'CANCELLED';
    return 'PENDING';
  };

  if (!order) {
    return <Alert variant="danger">Order not found.</Alert>;
  }

  return (
    <div className="container my-4">
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>User:</strong> {order.user?.name || 'Unknown'}</p>
      <p><strong>Total Price:</strong> {currency}{order.totalPrice}</p>
      <p><strong>Order Status:</strong> {getOrderStatus()}</p>

      <h3>Shipping Address</h3>
      <p><strong>Name:</strong> {order.address?.fullname}</p>
      <p><strong>Phone:</strong> {order.address?.phone}</p>
      <p><strong>Street:</strong> {order.address?.street}</p>
      <p><strong>City:</strong> {order.address?.city}</p>
      <p><strong>State:</strong> {order.address?.state}</p>
      <p><strong>Zip Code:</strong> {order.address?.zip}</p>
      <p><strong>Country:</strong> {order.address?.country}</p>

      <h3>Order Items</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Product</th>
            <th>Image</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
            <th>Tracking Status</th>
            <th>Actions</th>
            <th>Change Status</th> {/* New Column */}
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.product._id}>
              <td>{item.product.name}</td>
              <td>
                {item.product.images && item.product.images.length > 0 ? (
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                ) : (
                  <span>No image available</span>
                )}
              </td>
              <td>{item.quantity}</td>
              <td>{currency}{item.price}</td>
              <td>{currency}{item.price * item.quantity}</td>
              <td>{item.trackingStatus}</td>
              <td>
                {/* If returnRequested is true and trackingStatus is 'DELIVERED', show Approve Return */}
                {item.trackingStatus !== 'CANCELLED' && !item.returnRequested && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleCancelOrder(item.product._id)}
                  >
                    Cancel Order
                  </Button>
                )}

                {item.trackingStatus === 'DELIVERED' && item.trackingStatus === 'RETURNED' && (
                  <Button
                    variant="warning"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleApproveReturn(item.product._id)}
                  >
                    Approve Return
                  </Button>
                )}
              </td>
              <td>
                {/* Option to change tracking status */}
                {item.trackingStatus !== 'CANCELLED' && (
                  <Dropdown className="d-inline ms-2">
                    <Dropdown.Toggle size="sm" variant="info">Change</Dropdown.Toggle>
                    <Dropdown.Menu>
                      {['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                        <Dropdown.Item
                          key={status}
                          onClick={() => handleTrackingStatusUpdate(item.product._id, status)}
                        >
                          {status}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="secondary" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </div>
  );
};

export default ViewOrder;
