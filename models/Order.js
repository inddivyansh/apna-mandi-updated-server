import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  seller: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  orderItems: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' }
  }],
  deliveryAddress: {
    street: String,
    city: String,
    pincode: String,
  },
  totalPrice: { type: Number, required: true, default: 0.0 },
  status: { type: String, required: true, default: 'Pending', enum: ['Pending', 'Accepted', 'Scheduled', 'Out for Delivery', 'Delivered', 'Declined', 'Cancelled'] },
  deliveryDate: { type: Date },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;