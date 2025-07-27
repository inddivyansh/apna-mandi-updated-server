// backend/models/requirement.model.js
import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  maxPrice: { type: Number },
  urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  deadline: { type: Date },
  description: { type: String }
}, { timestamps: true });

const Requirement = mongoose.model('Requirement', requirementSchema);
export default Requirement;