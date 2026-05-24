import mongoose from 'mongoose';

const IdempotencyKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  createdAt: { type: Date, expires: '24h', default: Date.now }
});

export default mongoose.models.IdempotencyKey || mongoose.model('IdempotencyKey', IdempotencyKeySchema);
