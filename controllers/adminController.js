import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { NotificationService } from '../services/notificationService.js';

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

export const getPendingOrders = async (req, res) => {
  try {
    const pendingOrders = await Order.find({ 
      status: 'Pending Assignment' 
    }).populate('buyer', 'name email phone').sort({ createdAt: -1 });
    res.json(pendingOrders);
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ message: 'Error fetching pending orders' });
  }
};

export const getAvailableSellers = async (req, res) => {
  try {
    const { productIds } = req.query; // Comma-separated product IDs
    
    if (!productIds) {
      // Get all active sellers
      const sellers = await User.find({ 
        role: 'Seller', 
        isAvailable: true 
      }).select('name email phone');
      return res.json(sellers);
    }

    const productIdArray = productIds.split(',');
    
    // Find sellers who have all the required products in stock
    const sellers = await User.find({ 
      role: 'Seller', 
      isAvailable: true 
    }).select('name email phone');

    const availableSellers = [];
    
    for (const seller of sellers) {
      const sellerProducts = await Product.find({ 
        seller: seller._id, 
        _id: { $in: productIdArray },
        stock: { $gt: 0 }
      });
      
      // Check if seller has all required products
      if (sellerProducts.length === productIdArray.length) {
        availableSellers.push({
          ...seller.toObject(),
          products: sellerProducts
        });
      }
    }

    res.json(availableSellers);
  } catch (error) {
    console.error('Error fetching available sellers:', error);
    res.status(500).json({ message: 'Error fetching available sellers' });
  }
};

export const assignOrderToSeller = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { sellerId } = req.body;

    // Find the order
    const order = await Order.findById(orderId).populate('buyer', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Pending Assignment') {
      return res.status(400).json({ message: 'Order is not pending assignment' });
    }

    // Find the seller
    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== 'Seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Check if seller has enough stock for all items
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (!product || product.seller.toString() !== sellerId) {
        return res.status(400).json({ 
          message: `Product ${item.name} is not available from this seller` 
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${item.name}. Available: ${product.stock}, Required: ${item.quantity}` 
        });
      }
    }

    // Reduce stock from seller's products
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { 
        $inc: { stock: -item.quantity } 
      });
    }

    // Update order with seller assignment
    order.seller = sellerId;
    order.status = 'Pending';
    order.assignedBy = req.user._id;
    order.assignedAt = new Date();
    await order.save();

    // Send notifications
    await NotificationService.orderAssignedToSeller(
      order._id,
      order.buyer._id,
      sellerId,
      {
        buyerName: order.buyer.name,
        totalPrice: order.totalPrice,
        itemCount: order.orderItems.length
      }
    );

    // Check for low stock alerts after assignment
    await NotificationService.checkLowStockAlerts();

    const updatedOrder = await Order.findById(orderId)
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    res.json({ 
      message: 'Order assigned successfully', 
      order: updatedOrder 
    });
  } catch (error) {
    console.error('Error assigning order to seller:', error);
    res.status(500).json({ message: 'Error assigning order to seller' });
  }
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
