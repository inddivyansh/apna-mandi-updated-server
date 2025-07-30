import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { NotificationService } from '../services/notificationService.js';

export const getReceivedOrders = async (req, res) => {
  const orders = await Order.find({ seller: req.user._id }).populate('buyer', 'name address').sort({ createdAt: -1 });
  res.json(orders);
};

export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  const { status } = req.body;
  if (order && order.seller.toString() === req.user._id.toString()) {
    const oldStatus = order.status;
    if ((status === 'Declined' || status === 'Cancelled') && order.status!== 'Declined' && order.status!== 'Cancelled') {
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: +item.quantity } });
        }
    }
    order.status = status || order.status;
    const updatedOrder = await order.save();
    
    // Send notifications for status update
    if (oldStatus !== status) {
      await NotificationService.orderStatusUpdated(
        order._id,
        order.buyer,
        order.seller,
        status,
        {
          orderItems: order.orderItems,
          totalPrice: order.totalPrice,
          deliveryDate: order.deliveryDate
        }
      );
    }
    
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found or not authorized' });
  }
};

export const getMyProducts = async (req, res) => {
  const products = await Product.find({ seller: req.user._id });
  res.json(products);
};

export const addProduct = async (req, res) => {
  const { name, category, price, unit, stock, image } = req.body;
  try {
    const product = new Product({
      name, category, price, unit, stock, image, seller: req.user._id,
    });
    const createdProduct = await product.save();
    
    // Send notification for new product
    await NotificationService.productAdded(
      req.user._id,
      name,
      createdProduct._id
    );
    
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product' });
  }
};

export const updateProduct = async (req, res) => {
  const { name, category, price, unit, stock, image } = req.body;
  const product = await Product.findById(req.params.id);
  if (product && product.seller.toString() === req.user._id.toString()) {
    const oldStock = product.stock;
    product.name = name?? product.name;
    product.category = category?? product.category;
    product.price = price?? product.price;
    product.unit = unit?? product.unit;
    product.stock = stock?? product.stock;
    product.image = image?? product.image;
    const updatedProduct = await product.save();
    
    // Check for stock alerts if stock was updated
    if (stock !== undefined && oldStock !== stock) {
      if (stock === 0) {
        await NotificationService.productOutOfStock(
          req.user._id,
          product.name,
          product._id
        );
      } else if (stock <= 10 && oldStock > 10) {
        await NotificationService.stockLowAlert(
          req.user._id,
          product.name,
          stock,
          product._id
        );
      }
    }
    
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found or not authorized' });
  }
};

export const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product && product.seller.toString() === req.user._id.toString()) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found or not authorized' });
    }
};