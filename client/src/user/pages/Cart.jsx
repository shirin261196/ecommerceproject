import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItemQty, removeFromCart, clearCart } from '../../redux/slices/cartSlice.js';
import { selectTotalPrice, selectTotalQuantity, selectCartItems } from '../../redux/slices/cartSlice.js';
import { useEffect } from 'react';
import { selectUserId } from '../../redux/slices/authSlice';
import { currency } from '../../App.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Toast library
import Swal from 'sweetalert2'; // SweetAlert library
import 'react-toastify/dist/ReactToastify.css';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems) || []; // Ensure items is always an array

  const userId = useSelector(selectUserId);
  const totalPrice = useSelector(selectTotalPrice);
  const totalQuantity = useSelector(selectTotalQuantity);

  // Fetch cart on initial load or userId change
  useEffect(() => {
    if (userId) {
      dispatch(fetchCart(userId))
        .then((response) => {
          console.log('Cart fetched:', response);
        })
        .catch((error) => {
          console.error('Error fetching cart:', error);
        });
    }
  }, [dispatch, userId]);

  const handleQuantityChange = (productId, size, newQuantity) => {
    const productStock = items.find(
      (item) => item.product?._id === productId && item.size === size
    )?.product?.sizes?.find((s) => s.size === size)?.stock;
  
    if (Number.isInteger(newQuantity) && newQuantity > 0) {
      if (newQuantity > productStock) {
        Swal.fire({
          icon: 'warning',
          title: 'Insufficient Stock',
          text: 'The quantity exceeds the available stock.',
        });
        return;
      }
  
      dispatch(updateCartItemQty({ userId, productId, size, quantity: newQuantity }))
        .then(() => {
          // Refetch cart after quantity update
          dispatch(fetchCart(userId));
          toast.success('Cart updated successfully!');
        })
        .catch((error) => {
          console.error('Error updating cart item:', error);
          toast.error('Failed to update the cart.');
        });
    } else {
      toast.error('Invalid quantity value!');
    }
  };

  const handleRemoveItem = (productId, size) => {
    console.log("Removing item with details:", { userId, productId, size });
    if (userId && productId && size) {
      dispatch(removeFromCart({ userId, productId, size }))
        .then(() => {
          // Refetch cart after item removal
          dispatch(fetchCart(userId));
          toast.success('Item removed from the cart!');
        })
        .catch((error) => {
          console.error('Error removing cart item:', error);
          toast.error('Failed to remove the item.');
        });
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Cart is Empty',
        text: 'Please add some items to your cart before proceeding to checkout.',
      });
    } else {
      navigate('/checkout');
    }
  };

  const handleClearCart = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will remove all items from your cart.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear it!',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearCart(userId))
          .then(() => {
            dispatch(fetchCart(userId)); // Refresh cart
            toast.success('Cart cleared successfully!');
          })
          .catch((error) => {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear the cart.');
          });
      }
    });
  };
  return (
    <div className="container my-5">
      <h2>Your Shopping Cart</h2>
      <div className="row">
        {/* Cart Items */}
        <div className="col-md-8">
          {items && items.length > 0 ? (
            items.map((item, index) => {
              const stock =
                item.product?.sizes?.find((s) => s.size === item.size)?.stock ?? 'N/A'; // Safe access to sizes
              const key = `${item.product?._id}-${item.size}-${item.quantity || index}-${item.product?._id}-${item.size}`;
  
              return (
                <div key={key} className="cart-item mb-3 p-3 border rounded shadow-sm">
                  <div className="row">
                    <div className="col-3">
                      <img
                        src={item.product?.images?.[0]?.url || '/default-image.jpg'}
                        alt={item.product?.name || 'Product Image'}
                        className="img-fluid"
                      />
                    </div>
                    <div className="col-6">
                      <h5>{item.product?.name || 'No Name'}</h5>
                      <p>Size: {item.size || 'N/A'}</p>
                      <p>Stock: {stock}</p>
                      <p>Price: {currency}{item.price || '0.00'}</p>
                    </div>
                    <div className="col-3 text-center">
                      <div>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleQuantityChange(item.product?._id, item.size, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity || 0}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleQuantityChange(item.product?._id, item.size, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="btn btn-danger mt-2"
                        onClick={() => handleRemoveItem(item.product?._id, item.size)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>
  
        {/* Cart Summary */}
        <div className="col-md-4">
          <div className="cart-summary p-3 border rounded shadow-sm">
            <h5>Cart Summary</h5>
            <hr />
            <p><strong>Total Items:</strong> {totalQuantity}</p>
            <p><strong>Total Quantity:</strong> {totalQuantity}</p>
            <p><strong>Total Price:</strong> {currency}{totalPrice.toFixed(2)}</p>
            <button className="btn btn-success w-100" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
  
      {/* Clear Cart and Continue Shopping Buttons */}
      <div className="mt-4 d-flex justify-content-between">
        <button className="btn btn-danger" onClick={handleClearCart}>
          Clear Cart
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}  

export default CartPage;
