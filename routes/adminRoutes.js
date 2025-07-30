import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';
import { 
  getDashboardStats, 
  getAllUsers, 
  getAllOrders, 
  getGroupedOrders, 
  getPendingOrders, 
  assignOrderToSeller,
  getAvailableSellers
} from '../controllers/adminController.js';
const router = express.Router();

router.use(protect, isAdmin);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.get('/orders/grouped', getGroupedOrders);
router.get('/orders/pending', getPendingOrders);
router.get('/sellers/available', getAvailableSellers);
router.put('/orders/:orderId/assign', assignOrderToSeller);

export default router;
