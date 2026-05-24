import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  serviceId: { type: String, required: true },
  description: { type: String, required: true },
  assignedProviders: [{ 
    id: { type: Number, required: true },
    reason: { type: String, enum: ['MANDATORY', 'ROUND_ROBIN'], required: true }
  }],
  status: { type: String, enum: ['PENDING', 'ASSIGNED', 'UNASSIGNED', 'PROCESSING'], default: 'PENDING' },
}, { timestamps: true });

// Prevent duplicate leads for the same phone and service
LeadSchema.index({ phone: 1, serviceId: 1 }, { unique: true });

delete mongoose.models.Lead;
export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
