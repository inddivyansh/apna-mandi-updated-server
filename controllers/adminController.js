import User from '../models/User.js';
import Order from '../models/Order.js';

export const getDashboardStats = async (req, res) => {
  const buyerCount = await User.countDocuments({ role: 'Buyer' });
  const sellerCount = await User.countDocuments({ role: 'Seller' });
  const orderCount = await Order.countDocuments();
  res.json({ buyerCount, sellerCount, orderCount });
};

export const getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate('buyer', 'name').populate('seller', 'name');
  res.json(orders);
};

export const getGroupedOrders = async (req, res) => {
    const orders = await Order.find({ status: 'Pending' }).populate('buyer', 'name address');
    const grouped = orders.reduce((acc, order) => {
        const pincode = order.deliveryAddress.pincode || 'N/A';
        if (!acc[pincode]) {
            acc[pincode] = { orders: [], totalItems: {} };
        }
        acc[pincode].orders.push(order);
        order.orderItems.forEach(item => {
            if (!acc[pincode].totalItems[item.name]) {
                acc[pincode].totalItems[item.name] = 0;
            }
            acc[pincode].totalItems[item.name] += item.quantity;
        });
        return acc;
    }, {});
    res.json(grouped);
};
