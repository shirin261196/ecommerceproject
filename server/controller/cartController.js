import Cart from "../models/cartModel.js";
import productModel from "../models/productModel.js";


// Fetch Cart
export const getCart = async (req, res) => {
  const { userId } = req.params;
  try {
    const cart = await Cart.findOne({ userId })
    .populate({
      path: 'items.product',
      select: 'name sizes images price stock', // Specify fields to populate
    })
    .exec();
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json({ data: cart });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error });
  }
};


// Add Item to Cart
export const addItemToCart = async (req, res, next) => {
  const { userId, productId, size, quantity, price, stock, images } = req.body; // Ensure destructuring matches frontend
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0, totalQuantity: 0 });
    }

    const productData = await productModel.findById(productId);
    if (!productData) return res.status(404).json({ message: 'Product not found' });

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId, // Map correctly
        size,
        quantity,
        price: price || productData.price, // Use price from body or fallback to product data
        stock: stock || productData.stock, // Use stock from body or fallback to product data
        images: images?.length > 0 ? images : productData.images, // Use provided or fallback
      });
    }

    // Update total price and quantity
    cart.totalPrice = cart.items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
    cart.totalQuantity = cart.items.reduce((acc, item) => acc + (item.quantity || 0), 0);

    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
};


// Update Item Quantity
export const updateItemQuantity = async (req, res, next) => {
  const { userId, productId, size, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId && item.size === size);
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

    cart.items[itemIndex].quantity = quantity;

    // Update total price and quantity
    cart.totalPrice = cart.items.reduce((acc, item) => {
      if (typeof item.price === 'number' && typeof item.quantity === 'number') {
        return acc + item.price * item.quantity;
      }
      return acc;
    }, 0);
    cart.totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// Remove Item from Cart
export const removeItemFromCart = async (req, res, next) => {
  const { userId, productId } = req.params; // Destructure size from URL
  const { size } = req.body; 
  console.log('Received userId:', userId);
console.log('Received productId:', productId);
console.log('Received size:', size);
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

    cart.items.splice(itemIndex, 1);

    // Update total price and quantity
    cart.totalPrice = cart.items.reduce((acc, item) => {
      if (typeof item.price === 'number' && typeof item.quantity === 'number') {
        return acc + item.price * item.quantity;
      }
      return acc;
    }, 0);
    
    cart.totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
};


// Clear Cart
export const clearCart = async (req, res, next) => {
  const { userId } = req.params;

  try {
    // Find the user's cart and remove all items
    const result = await Cart.updateOne(
      { userId },
      { $set: { items: [] } } // Clear all items in the cart
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Cart not found or already empty.' });
    }

    res.status(200).json({ message: 'Cart cleared successfully.' });
  } catch (error) {
   next(error)
  }
};

