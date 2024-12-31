import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, fetchCart, removeFromCart } from '../../redux/slices/cartSlice';
import { selectCartItems, selectTotalPrice } from '../../redux/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Table, Image, Row, Col, Card } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import { currency } from '../../App';
import { addAddress, fetchAddresses, selectAddresses, updateAddress } from '../../redux/slices/addressSlice';
import { createOrder } from '../../redux/slices/orderSlice';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);
  const addresses = useSelector(selectAddresses);

  const [selectedAddress, setSelectedAddress] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullname: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      dispatch(fetchCart(userId));
      dispatch(fetchAddresses(userId));
    }
  }, [dispatch, userId]);

  const handleRemoveItem = (productId, size) => {
    dispatch(removeFromCart({ productId, size, userId })).then(() => {
      dispatch(fetchCart(userId));
    });
    toast.success('Item removed from cart.');
  };

  const handleAddAddress = () => {
    const areFieldsValid = (address) => {
      return Object.values(address).every((field) => field && field.trim());
    };

    if (areFieldsValid(newAddress)) {
      const addressPayload = {
        userId,
        ...newAddress,
      };

      if (isEditing) {
        dispatch(updateAddress({ ...addressPayload, addressId: newAddress._id }));
        toast.success('Address updated successfully!');
      } else {
        dispatch(addAddress(addressPayload));
        toast.success('Address added successfully!');
      }

      setShowAddressForm(false);
      setIsEditing(false);
      setNewAddress({
        fullname: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      });
    } else {
      toast.error('Please fill all fields');
    }
  };

  const handleEditAddress = (address) => {
    setIsEditing(true);
    setShowAddressForm(true);
    setNewAddress({
      _id: address._id,
      fullname: address.fullname,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    });
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Swal.fire({
        icon: 'warning',
        title: 'Address Required',
        text: 'Please select an address before placing the order.',
      });
      return;
    }
  
    const orderItems = cartItems.map((item) => ({
      product: item.product?._id || item.productId,  // Ensure you're using the correct product reference (_id or productId)
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      size: item.size,
    }));
  
    const address = selectedAddress
      ? addresses.find((address) => address._id === selectedAddress)
      : newAddress;
  
    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
    dispatch(
      createOrder({
        userId,
        items: orderItems,
        totalPrice,
        totalQuantity,
        address,
      })
    )
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Order Placed',
          text: 'Your order has been placed successfully! Payment mode: Cash on Delivery.',
        }).then(() => {
          dispatch(clearCart(userId));
          setSelectedAddress('');
          navigate('/orders');
        });
      })
      .catch(() => {
        toast.error('Failed to place the order');
      });
  };
  
  return (
    <div className="container py-5">
      <ToastContainer />
      <h2 className="mb-4">Checkout</h2>
      <Row>
        <Col md={8} sm={12} className="mb-4">
        <Table bordered responsive>
  <thead>
    <tr>
      <th>Product</th>
      <th>Name</th>
      <th>Quantity</th>
      <th>Price</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {cartItems.map((item, index) => (
      <tr key={`${item.productId}-${item.size || index}`}>
        <td>
          <Image
            src={item.product?.images?.[0]?.url || '/default-image.jpg'}
            alt={item.product.name}
            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            fluid
          />
        </td>
        <td>{item.product.name || 'No Name Available'}</td>
        <td>{item.quantity}</td>
        <td>{currency}{(item.price * item.quantity).toFixed(2)}</td>
        <td>
          <Button
            variant="danger"
            onClick={() => handleRemoveItem(item.product?._id, item.size)}
          >
            Remove
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>

        </Col>

        <Col md={4} sm={12}>
  <h4>Address</h4>
  <Form.Select
  value={selectedAddress}
  onChange={(e) => setSelectedAddress(e.target.value)}
>
  <option>Select Address</option>
  {addresses.map((address) => (
    <option key={address._id} value={address._id}>
      {`${address.fullname}, ${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}`}
    </option>
  ))}
</Form.Select>

  <div className="mt-3">
  {addresses.map((address) => (
  <div key={`${address._id}-details`} className="mb-3">

        <div className="d-flex justify-content-between">
          <div>
            <strong>{address.fullname}</strong>
            <p className="mb-0">
              {`${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}`}
            </p>
            <p>{address.phone}</p>
          </div>
          <Button
            variant="warning"
            size="sm"
            onClick={() => handleEditAddress(address)}
          >
            Edit
          </Button>
        </div>
        <hr />
      </div>
    ))}
  </div>
  <Button
    variant="link"
    onClick={() => setShowAddressForm((prev) => !prev)}
    className="my-3"
  >
    {showAddressForm ? 'Cancel' : 'Add Address'}
  </Button>
  {showAddressForm && (
    <Form>
      {['fullname', 'phone', 'street', 'city', 'state', 'zip', 'country'].map((field) => (
        <Form.Group key={field} className="mb-2">
          <Form.Control
            type="text"
            placeholder={field}
            value={newAddress[field]}
            onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
          />
        </Form.Group>
      ))}
      <Button onClick={handleAddAddress} className="mt-2">
        {isEditing ? 'Update Address' : 'Save Address'}
      </Button>
    </Form>
  )}
</Col>

      </Row>

      <Row className="mt-4">
        <Col md={4} sm={12} className="offset-md-8">
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <Card.Text>
  <div className="list-summary">
    <ul className="list-unstyled">
    {cartItems.map((item, index) => (
  <li key={`${item.productId || item.product?._id}-${item.size || 'N/A'}-${index}`} className="d-flex justify-content-between">

          <span>{item.product.name} ({item.size || 'N/A'}) x {item.quantity}</span>
          <span>{currency}{(item.quantity * item.price).toFixed(2)}</span>
        </li>
      ))}
    </ul>
    <hr />
    <div className="d-flex justify-content-between">
      <strong>Subtotal</strong>
      <span>{currency}{totalPrice.toFixed(2)}</span>
    </div>
    <div className="d-flex justify-content-between">
      <strong>Shipping</strong>
      <span>{currency}0.00</span>
    </div>
    <hr />
    <div className="d-flex justify-content-between">
      <strong>Total</strong>
      <span>{currency}{totalPrice.toFixed(2)}</span>
    </div>
    <div className="text-center mt-3">
      <Button
        onClick={handlePlaceOrder}
        variant="success"
        className="w-100"
        disabled={!cartItems.length || !selectedAddress}
      >
        Place Order
      </Button>
    </div>
  </div>
</Card.Text>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;
