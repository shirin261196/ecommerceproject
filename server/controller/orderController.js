import Order from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";



export const createOrder = async (req, res,next) => {
  const { items, totalPrice, totalQuantity,address} = req.body;
  console.log('order',req.body)
  console.log(items)
  try {
    // Check if the user exists
    const user = await userModel.findById(req.user.id);
    console.log('user',user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new order
    const newOrder = new Order({
      user:  req.user.id, 
      items,
      totalPrice,
      totalQuantity,
      status: 'PENDING',  // Initial status is PENDING
      address,
   
    });
    console.log('neworder',newOrder)

     // Update stock for each product in the order
     for (const item of items) {
      const product = await productModel.findById(item.product);
      if (product) {
        const sizeData = product.sizes.find((s) => s.size === item.size);
        if (sizeData && sizeData.stock >= item.quantity) {
          sizeData.stock -= item.quantity; // Deduct the stock
        } else {
          return res.status(400).json({ message: `Insufficient stock for size ${item.size}` });
        }
        await product.save();
      }
    }

    // Save the order to the database
    await newOrder.save();

    // Send a success response
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
  next(error)
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { itemId } = req.query; // Extract itemId from query
    console.log("Backend - OrderId:", orderId, "ItemId:", itemId); // Debug logging

    // Validate presence of itemId
    if (!itemId) {
      return res.status(400).json({ message: "ItemId is required" });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the specific item in the order
    const item = order.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in order' });
    }

    // Update logic for cancellation
    if (item.trackingStatus === 'CANCELLED') {
      return res.status(400).json({ message: 'Item is already cancelled' });
    }
    item.trackingStatus = 'CANCELLED';

    // Restore stock
    const product = await productModel.findById(item.product);
    if (product) {
      const sizeData = product.sizes.find((s) => s.size === item.size);
      if (sizeData) {
        sizeData.stock += item.quantity;
        await product.save();
      }
    }

    // Save updated order
    const allItemsCancelled = order.items.every((i) => i.trackingStatus === 'CANCELLED');
    if (allItemsCancelled) order.status = 'CANCELLED';
    await order.save();

    res.json({ message: 'Order item cancelled successfully', updatedOrder: order });
  } catch (error) {
    
    next(error);
  }
};




// Return Order Controller
export const returnOrder = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order is delivered
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ message: 'Order cannot be returned' });
    }

    // Update tracking status of each item and restore stock
    for (let item of order.items) {
      if (item.trackingStatus !== 'RETURNED') {
        item.trackingStatus = 'RETURNED';

        // Restore stock for the product
   
        const product = await productModel.findById(item.product);
        if (product) {
          const sizeData = product.sizes.find((s) => s.size === item.size);
          if (sizeData) {
            sizeData.stock += item.quantity; // Increment the stock
            await product.save();
          }
        }
      }
    }

    // Update the overall order status to 'RETURNED'
    order.status = 'RETURNED';

    // Save the updated order
    await order.save();

    res.status(200).json({ message: 'Order returned successfully', updatedOrder: order });
  } catch (error) {
    console.error('Error in returnOrder:', error);
    next(error);
  }
};


// Change the tracking status of a product in an order
export const changeTrackingStatus = async (req, res, next) => {
  const { orderId, productId } = req.params;
  const { trackingStatus } = req.body;

  console.log('Received orderId:', orderId); // Debugging log
  console.log('Received productId:', productId); // Debugging log
  console.log('Received trackingStatus:', trackingStatus); // Debugging log

  // Validate the tracking status
  if (!['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(trackingStatus)) {
    return res.status(400).json({ message: 'Invalid tracking status', receivedTrackingStatus: trackingStatus });
  }

  // Fetch the order with populated product details
  const order = await Order.findById(orderId).populate('items.product');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  console.log('Populated order items:', order.items);  // Log populated order items

  // Find the product in the order using populated _id
  const product = order.items.find(item => item.product._id.toString() === productId);

  if (!product) {
    return res.status(404).json({ message: 'Product not found in the order' });
  }

  // Update the tracking status
  product.trackingStatus = trackingStatus;
  order.markModified('items');  // Mark 'items' as modified

  console.log('Updated product tracking status:', product.trackingStatus);

  // Recalculate the order status based on all item tracking statuses
  const trackingStatuses = order.items.map(item => item.trackingStatus);

  let newStatus = 'PENDING'; // Default status
  if (trackingStatuses.every(status => status === 'DELIVERED')) {
    newStatus = 'DELIVERED';
  } else if (trackingStatuses.every(status => status === 'CANCELLED')) {
    newStatus = 'CANCELLED';
  } else if (trackingStatuses.some(status => status === 'SHIPPED')) {
    newStatus = 'SHIPPED';
  }

  // Update the order status
  order.status = newStatus;

  // Save the updated order
  await order.save();

  console.log('Saved order with updated tracking status and overall order status:', order);

  return res.status(200).json(order);  // Return the updated order
};




export const fetchOrderHistory = async (req, res, next) => {
  try {
    // Fetch orders for the logged-in user based on userId
    console.log('userId', req.user.id);
    
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'user',  // Populate the user field to get the address details
        select: 'name email addresses',  // Select the needed user fields
      })
      .populate('items.product', 'name price images');  // Populate the product details for items

    console.log('orders', orders);

    // If no orders found
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user.' });
    }

    // Send back the orders data
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};




export const listOrders = async (req, res,next) => {
  try {
    // Fetch all orders from the database
    const orders = await Order.find().populate('user').populate('items.product');
    return res.status(200).json(orders); // Return orders in response
  } catch (error) {
   next(error)
  }
};

// Change the status of an order
export const changeOrderStatus = async (req, res, next) => {
  const { orderId, productId } = req.params;
  const { status } = req.body;

  console.log('Received orderId:', orderId); // Debugging log
  console.log('Received productId:', productId); // Debugging log
  console.log('Received status:', status); // Debugging log

  if (!['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status', receivedStatus: status });
  }

  // Fetch the order with populated product details
  const order = await Order.findById(orderId).populate('items.product');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  console.log('Populated order items:', order.items);  // Log populated order items

  // Find the product in the order using populated _id
  const product = order.items.find(item => item.product._id.toString() === productId);

  if (!product) {
    return res.status(404).json({ message: 'Product not found in the order' });
  }

  // Update the product status
  product.status = status;
  order.markModified('items');  // Mark 'items' as modified

  // If all products in the order are delivered, update the order status
  const allProductsDelivered = order.items.every(item => item.status === 'DELIVERED');
  if (allProductsDelivered) {
    order.status = 'DELIVERED';  // Set the order's status to DELIVERED
  }

  console.log('Updated product status:', product.status);

  await order.save();

  console.log('Saved order:', order);

  return res.status(200).json(order);  // Return the updated order
};



  


// Cancel an order
export const cancelAdminOrder = async (req, res,next) => {
  try {
    const { orderId} = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).send('Order not found');
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Order cannot be canceled because it is not in the PENDING state' });
    }

    // Ensure the order is not already cancelled
    if (order.status === 'CANCELLED') {
      return res.status(400).send('Order is already cancelled');
    }

    // Update the order status to 'CANCELLED'
    order.status = 'CANCELLED';
    await order.save();

    res.status(200).send({ message: 'Order cancelled successfully', order });
  } catch (error) {
    next(error)
  }
};


export const returnApprove = async(req,res,next)=>{
  const { orderId, productId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the item in the order
    const item = order.items.find((item) => item.product._id.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: 'Product not found in this order' });
    }

    // Approve return if requested
    if (item.trackingStatus === 'DELIVERED' && item.returnRequested) {
      item.returnStatus = 'APPROVED'; // Example return status field
      await order.save();
      return res.json(order); // Return the updated order
    } else {
      return res.status(400).json({ message: 'Return request cannot be approved' });
    }
  } catch (error) {
   next(error)
  }
}

// Function to derive overall order status






