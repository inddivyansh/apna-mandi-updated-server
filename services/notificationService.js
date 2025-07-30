import { createNotification, createBulkNotifications } from '../controllers/notificationController.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

export class NotificationService {
  
  // Buyer notifications
  static async orderPlaced(orderId, buyerId, orderItems, totalPrice) {
    try {
      // Notify buyer
      await createNotification(
        buyerId,
        'Order Placed Successfully',
        `Your order for ₹${totalPrice} has been placed and is pending admin assignment.`,
        'ORDER_PLACED',
        { orderId, orderItems, totalPrice },
        'medium'
      );

      // Notify all admins about new order that needs seller assignment
      const admins = await User.find({ role: 'Admin' }).select('_id');
      if (admins.length > 0) {
        await createBulkNotifications(
          admins.map(admin => admin._id),
          'New Order Requires Assignment',
          `A new order worth ₹${totalPrice} has been placed and needs to be assigned to a seller.`,
          'NEW_ORDER',
          { orderId, buyerId, totalPrice, orderItems },
          'high'
        );
      }
    } catch (error) {
      console.error('Error sending order placed notifications:', error);
    }
  }

  static async orderStatusUpdated(orderId, buyerId, sellerId, newStatus, orderDetails) {
    try {
      const statusMessages = {
        'Accepted': {
          buyer: 'Your order has been accepted by the seller.',
          seller: 'You have successfully accepted the order.',
          type: 'ORDER_ACCEPTED'
        },
        'Scheduled': {
          buyer: 'Your order has been scheduled for delivery.',
          seller: 'Order has been scheduled for delivery.',
          type: 'ORDER_SCHEDULED'
        },
        'Out for Delivery': {
          buyer: 'Your order is out for delivery!',
          seller: 'Order is out for delivery.',
          type: 'ORDER_OUT_FOR_DELIVERY'
        },
        'Delivered': {
          buyer: 'Your order has been delivered successfully!',
          seller: 'Order has been delivered successfully.',
          type: 'ORDER_DELIVERED'
        },
        'Declined': {
          buyer: 'Your order has been declined by the seller.',
          seller: 'You have declined the order.',
          type: 'ORDER_DECLINED'
        },
        'Cancelled': {
          buyer: 'Your order has been cancelled.',
          seller: 'The order has been cancelled.',
          type: 'ORDER_CANCELLED'
        }
      };

      const statusInfo = statusMessages[newStatus];
      if (!statusInfo) return;

      // Notify buyer
      await createNotification(
        buyerId,
        `Order ${newStatus}`,
        statusInfo.buyer,
        statusInfo.type,
        { orderId, newStatus, orderDetails },
        newStatus === 'Delivered' ? 'high' : 'medium'
      );

      // Notify seller
      await createNotification(
        sellerId,
        `Order ${newStatus}`,
        statusInfo.seller,
        statusInfo.type,
        { orderId, newStatus, orderDetails },
        'medium'
      );

      // Notify admins for important status changes
      if (['Delivered', 'Cancelled', 'Declined'].includes(newStatus)) {
        const admins = await User.find({ role: 'Admin' }).select('_id');
        if (admins.length > 0) {
          await createBulkNotifications(
            admins.map(admin => admin._id),
            `Order ${newStatus}`,
            `Order #${orderId} has been ${newStatus.toLowerCase()}.`,
            statusInfo.type,
            { orderId, newStatus, buyerId, sellerId },
            'low'
          );
        }
      }
    } catch (error) {
      console.error('Error sending order status notifications:', error);
    }
  }

  // Seller notifications
  static async productAdded(sellerId, productName, productId) {
    try {
      await createNotification(
        sellerId,
        'Product Listed Successfully',
        `Your product "${productName}" has been listed successfully.`,
        'PRODUCT_LISTED',
        { productId, productName },
        'low'
      );

      // Notify admins about new product listing
      const admins = await User.find({ role: 'Admin' }).select('_id');
      if (admins.length > 0) {
        await createBulkNotifications(
          admins.map(admin => admin._id),
          'New Product Listed',
          `A seller has listed a new product: "${productName}".`,
          'NEW_LISTING',
          { productId, productName, sellerId },
          'low'
        );
      }
    } catch (error) {
      console.error('Error sending product added notifications:', error);
    }
  }

  static async stockLowAlert(sellerId, productName, currentStock, productId) {
    try {
      await createNotification(
        sellerId,
        'Low Stock Alert',
        `Your product "${productName}" is running low in stock (${currentStock} remaining).`,
        'STOCK_LOW',
        { productId, productName, currentStock },
        'high'
      );
    } catch (error) {
      console.error('Error sending stock low alert:', error);
    }
  }

  static async productOutOfStock(sellerId, productName, productId) {
    try {
      await createNotification(
        sellerId,
        'Product Out of Stock',
        `Your product "${productName}" is now out of stock.`,
        'PRODUCT_OUT_OF_STOCK',
        { productId, productName },
        'high'
      );

      // Notify admins
      const admins = await User.find({ role: 'Admin' }).select('_id');
      if (admins.length > 0) {
        await createBulkNotifications(
          admins.map(admin => admin._id),
          'Product Out of Stock',
          `Product "${productName}" is now out of stock.`,
          'LOW_STOCK_ALERT',
          { productId, productName, sellerId },
          'medium'
        );
      }
    } catch (error) {
      console.error('Error sending out of stock notifications:', error);
    }
  }

  // Admin notifications
  static async newUserRegistration(userId, userName, userRole) {
    try {
      const admins = await User.find({ role: 'Admin' }).select('_id');
      if (admins.length > 0) {
        await createBulkNotifications(
          admins.map(admin => admin._id),
          'New User Registration',
          `A new ${userRole.toLowerCase()} "${userName}" has registered and needs approval.`,
          userRole === 'Seller' ? 'NEW_SELLER_REGISTRATION' : 'NEW_BUYER_REGISTRATION',
          { userId, userName, userRole },
          'medium'
        );
      }
    } catch (error) {
      console.error('Error sending new user registration notifications:', error);
    }
  }

  static async paymentReceived(orderId, amount, buyerId, sellerId) {
    try {
      // Notify seller
      await createNotification(
        sellerId,
        'Payment Received',
        `Payment of ₹${amount} has been received for your order.`,
        'PAYMENT_CONFIRMED',
        { orderId, amount },
        'high'
      );

      // Notify admins
      const admins = await User.find({ role: 'Admin' }).select('_id');
      if (admins.length > 0) {
        await createBulkNotifications(
          admins.map(admin => admin._id),
          'Payment Confirmed',
          `Payment of ₹${amount} has been received for order #${orderId}.`,
          'PAYMENT_RECEIVED',
          { orderId, amount, buyerId, sellerId },
          'medium'
        );
      }
    } catch (error) {
      console.error('Error sending payment received notifications:', error);
    }
  }

  // General notification for order assignment by admin
  static async orderAssignedToSeller(orderId, buyerId, sellerId, orderDetails) {
    try {
      // Notify buyer
      await createNotification(
        buyerId,
        'Order Assigned',
        `Your order has been assigned to a seller and will be processed soon.`,
        'ORDER_ASSIGNED_TO_SELLER',
        { orderId, sellerId, orderDetails },
        'medium'
      );

      // Notify seller
      await createNotification(
        sellerId,
        'New Order Assigned',
        `You have been assigned a new order. Please review and accept.`,
        'ORDER_ASSIGNED',
        { orderId, buyerId, orderDetails },
        'high'
      );
    } catch (error) {
      console.error('Error sending order assignment notifications:', error);
    }
  }

  // Check and send low stock alerts for all products
  static async checkLowStockAlerts() {
    try {
      const products = await Product.find({ 
        stock: { $lte: 10, $gt: 0 } 
      }).populate('seller', '_id name');

      for (const product of products) {
        await this.stockLowAlert(
          product.seller._id,
          product.name,
          product.stock,
          product._id
        );
      }

      // Check for out of stock products
      const outOfStockProducts = await Product.find({ 
        stock: 0 
      }).populate('seller', '_id name');

      for (const product of outOfStockProducts) {
        await this.productOutOfStock(
          product.seller._id,
          product.name,
          product._id
        );
      }
    } catch (error) {
      console.error('Error checking low stock alerts:', error);
    }
  }
}
