import mongoose from 'mongoose';

const RotationStateSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, unique: true },
  operationCount: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export default mongoose.models.RotationState || mongoose.model('RotationState', RotationStateSchema);
