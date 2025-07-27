

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
<<<<<<< HEAD
import chatbotRoutes from './routes/chatbotRoutes.js';
=======
import requirementRoutes from './routes/requirement.js';

>>>>>>> check

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
<<<<<<< HEAD
app.use('/api/chatbot', chatbotRoutes);

=======
app.use('/api',requirementRoutes)
>>>>>>> check
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));