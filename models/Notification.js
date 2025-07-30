import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: [
      // Admin notifications
      'NEW_ORDER', 'NEW_SELLER_REGISTRATION', 'NEW_BUYER_REGISTRATION', 'LOW_STOCK_ALERT',
      'ORDER_CANCELLED', 'PAYMENT_RECEIVED',
      // Seller notifications  
      'ORDER_RECEIVED', 'ORDER_ASSIGNED', 'STOCK_LOW', 'PRODUCT_OUT_OF_STOCK',
      'ORDER_CANCELLED_BY_BUYER', 'PAYMENT_CONFIRMED',
      // Buyer notifications
      'ORDER_PLACED', 'ORDER_ACCEPTED', 'ORDER_ASSIGNED_TO_SELLER', 'ORDER_SCHEDULED',
      'ORDER_OUT_FOR_DELIVERY', 'ORDER_DELIVERED', 'ORDER_DECLINED', 'SELLER_UNAVAILABLE'
    ]
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  readAt: { 
    type: Date 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
