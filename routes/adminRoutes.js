import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';
import { getDashboardStats, getAllUsers, getAllOrders, getGroupedOrders } from '../controllers/adminController.js';
const router = express.Router();

router.use(protect, isAdmin);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.get('/orders/grouped', getGroupedOrders);

export default router;
