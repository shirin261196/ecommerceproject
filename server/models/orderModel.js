import mongoose from 'mongoose';

// Define sub-schema for order items
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',  // Assuming your product model is named "Product"
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  trackingStatus: { 
    type: String, 
    default: 'PENDING', 
    set: (value) => value.toUpperCase() // Automatically convert to uppercase
  },
  
});

// Main order schema
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',  // Assuming your user model is named "User"
    required: true,
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true,
  },
  totalQuantity: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'],
    default: 'PENDING',
    set: (value) => value.toUpperCase(), // Convert to uppercase
  },
  
  address: {                          // Adding address to the order schema
    fullname: { type: String },
    phone: { type: String },
    street: { type: String},
    city: { type: String},
    state: { type: String },
    zip: { type: String },
    country: { type: String },
  },  // Add address to the order
}, { timestamps: true });  // This enables createdAt and updatedAt fields

// Create the Order model
const Order = mongoose.model('Order', orderSchema);
export default Order;
