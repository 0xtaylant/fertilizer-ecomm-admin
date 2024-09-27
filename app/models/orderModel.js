import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    stokIsmi: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  status: { 
    type: String, 
    required: true, 
    default: 'pending',
    enum: ['pending', 'processing', 'completed', 'cancelled']
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);