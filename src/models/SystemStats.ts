import mongoose from 'mongoose';

const SystemStatsSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Singleton 'main'
  duplicatesBlocked: { type: Number, default: 0 },
  webhooksProcessed: { type: Number, default: 0 },
});

delete mongoose.models.SystemStats;
export default mongoose.models.SystemStats || mongoose.model('SystemStats', SystemStatsSchema);
