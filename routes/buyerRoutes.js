import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isBuyer } from '../middleware/roleMiddleware.js';
import { browseProducts, placeOrder, getMyOrders } from '../controllers/buyerController.js';
const router = express.Router();

router.use(protect, isBuyer);
router.get('/products', browseProducts);
router.route('/orders').post(placeOrder).get(getMyOrders);

export default router;