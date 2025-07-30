import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationStats
} from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// Get user notifications
router.get('/', getUserNotifications);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Mark specific notification as read
router.put('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete specific notification
router.delete('/:notificationId', deleteNotification);

// Clear all notifications
router.delete('/', clearAllNotifications);

export default router;
