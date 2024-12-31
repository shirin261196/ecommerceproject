import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
          validate: {
            validator: Number.isInteger,
            message: 'Quantity must be an integer',
          },
        },
          price: { type: Number},
          size: { type: String },
          stock: { type: Number }, // Adding stock field
          images: [{ type: String }], // Storing images as an array
        
      },
    ],
    totalPrice: { type: Number, default: 0 },
    totalQuantity: { type: Number, default: 0 }
  },
  {
    timestamps: true,
  }



);
  
  const Cart = mongoose.model('Cart', cartSchema);
  
  export default Cart