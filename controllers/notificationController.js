import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Utility function to create notifications
export const createNotification = async (recipientId, title, message, type, data = {}, priority = 'medium') => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      title,
      message,
      type,
      data,
      priority
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Bulk notification creation for multiple recipients
export const createBulkNotifications = async (recipients, title, message, type, data = {}, priority = 'medium') => {
  try {
    const notifications = recipients.map(recipientId => ({
      recipient: recipientId,
      title,
      message,
      type,
      data,
      priority
    }));
    
    await Notification.insertMany(notifications);
    return notifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

// Get notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user._id;
    
    const query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });
    
    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: totalCount > parseInt(page) * parseInt(limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { 
        read: true, 
        readAt: new Date() 
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany(
      { recipient: userId, read: false },
      { 
        read: true, 
        readAt: new Date() 
      }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.deleteMany({ recipient: userId });
    
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Error clearing notifications' });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Notification.aggregate([
      { $match: { recipient: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ['$read', false] }, 1, 0]
            }
          },
          high_priority: {
            $sum: {
              $cond: [{ $in: ['$priority', ['high', 'urgent']] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    const result = stats[0] || { total: 0, unread: 0, high_priority: 0 };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ message: 'Error fetching notification stats' });
  }
};
