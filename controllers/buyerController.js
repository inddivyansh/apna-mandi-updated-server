import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

export const browseProducts = async (req, res) => {
  const availableSellers = await User.find({ role: 'Seller', isAvailable: true }).select('_id');
  const sellerIds = availableSellers.map(s => s._id);
  const products = await Product.find({ seller: { $in: sellerIds }, stock: { $gt: 0 } }).populate('seller', 'name');
  res.json(products);
};

export const placeOrder = async (req, res) => {
  const { cart, sellerId, deliveryAddress, totalPrice } = req.body;
  if (!cart || cart.length === 0) return res.status(400).json({ message: 'No order items' });
  try {
    for (const item of cart) {
        const product = await Product.findById(item._id);
        if (!product || product.stock < item.quantity) {
            return res.status(400).json({ message: `Not enough stock for ${item.name}.` });
        }
    }
    for (const item of cart) {
        await Product.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
    }
    const orderItems = cart.map(item => ({
        name: item.name, quantity: item.quantity, price: item.price, product: item._id,
    }));
    const order = new Order({
      buyer: req.user._id, seller: sellerId, orderItems, deliveryAddress, totalPrice,
      deliveryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    });
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
      res.status(500).json({ message: "Server error during order placement." });
  }
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).populate('seller', 'name').sort({ createdAt: -1 });
  res.json(orders);
};