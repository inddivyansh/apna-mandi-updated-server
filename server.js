

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { NotificationService } from './services/notificationService.js';

import authRoutes from './routes/authRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import requirementRoutes from './routes/requirement.js';
import notificationRoutes from './routes/notificationRoutes.js';



dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Apna Mandi Multi-Role API is running...'));

app.use('/api/auth', authRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api/chatbot', chatbotRoutes);

app.use('/api',requirementRoutes)

// Periodic task to check for low stock alerts (runs every hour)
setInterval(async () => {
  try {
    console.log('🔍 Checking for low stock alerts...');
    await NotificationService.checkLowStockAlerts();
  } catch (error) {
    console.error('❌ Error checking low stock alerts:', error);
  }
}, 60 * 60 * 1000); // 1 hour

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('📧 Notification system initialized');
});