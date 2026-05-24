import mongoose from 'mongoose';

const ProviderSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  quotaUsed: { type: Number, required: true, default: 0 },
  monthlyQuota: { type: Number, required: true, default: 10 },
}, { timestamps: true });

export default mongoose.models.Provider || mongoose.model('Provider', ProviderSchema);
