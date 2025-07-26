import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isSeller } from '../middleware/roleMiddleware.js';
import { getReceivedOrders, updateOrderStatus, getMyProducts, addProduct, updateProduct, deleteProduct } from '../controllers/sellerController.js';
const router = express.Router();

router.use(protect, isSeller);
router.route('/orders').get(getReceivedOrders);
router.route('/orders/:id').put(updateOrderStatus);
router.route('/products').get(getMyProducts).post(addProduct);
router.route('/products/:id').put(updateProduct).delete(deleteProduct);

export default router;