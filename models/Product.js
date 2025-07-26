// =======================================================================
import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String, required: false },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;