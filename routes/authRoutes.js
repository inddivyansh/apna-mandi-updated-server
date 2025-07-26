import express from 'express';
import { googleSignIn, completeOnboarding, updateUserProfile, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/google', googleSignIn);
router.post('/onboarding', protect, completeOnboarding);
router.route('/profile').put(protect, updateUserProfile).delete(protect, deleteAccount);

export default router;