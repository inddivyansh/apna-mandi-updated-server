import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  profilePicture: { type: String },
  role: { type: String, enum: ['Buyer', 'Seller', 'Admin', 'Pending'], default: 'Pending' },

  businessName: { type: String },
  gstNumber: { type: String },
  businessCategory: { type: String },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    pincode: String,
    coordinates: { lat: Number, lng: Number }
  },
  
  isAvailable: { type: Boolean, default: true },
  operatingPincodes: [String],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;