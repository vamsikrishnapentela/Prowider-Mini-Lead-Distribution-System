import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mandatoryProviders: { type: [Number], required: true },
  fairPool: { type: [Number], required: true },
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
