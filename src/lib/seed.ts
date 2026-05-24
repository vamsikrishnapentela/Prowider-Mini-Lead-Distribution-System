import Provider from '../models/Provider';
import Service from '../models/Service';
import RotationState from '../models/RotationState';

export async function runInitialSeed() {
  // Check if already seeded to prevent overwriting quotas on every restart
  const existingProvider = await Provider.findOne({ id: 1 });
  if (existingProvider) return; // Already seeded

  console.log('Running automatic database seed...');

  // Create Providers
  // Create Providers using $setOnInsert to prevent overwriting active quotas during Vercel cold starts
  for (let i = 1; i <= 8; i++) {
    await Provider.findOneAndUpdate(
      { id: i },
      { 
        $setOnInsert: { id: i, name: `Provider ${i}`, monthlyQuota: 10, quotaUsed: 0 } 
      },
      { upsert: true, new: true }
    );
  }

  // Create Services
  const services = [
    { id: 'service1', name: 'Service 1', mandatoryProviders: [1], fairPool: [2, 3, 4] },
    { id: 'service2', name: 'Service 2', mandatoryProviders: [5], fairPool: [6, 7, 8] },
    { id: 'service3', name: 'Service 3', mandatoryProviders: [1, 4], fairPool: [2, 3, 5, 6, 7, 8] },
  ];

  for (const service of services) {
    await Service.findOneAndUpdate(
      { id: service.id },
      service,
      { upsert: true, new: true }
    );
    
    await RotationState.findOneAndUpdate(
      { serviceId: service.id },
      { $setOnInsert: { operationCount: 0 } },
      { upsert: true, new: true }
    );
  }
  console.log('Automatic seed complete.');
}
