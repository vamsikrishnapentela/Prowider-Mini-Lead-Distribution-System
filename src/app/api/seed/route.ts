import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Provider from '@/models/Provider';
import Service from '@/models/Service';
import RotationState from '@/models/RotationState';
import Lead from '@/models/Lead';

export async function POST() {
  await dbConnect();

  try {
    // Upsert Providers
    for (let i = 1; i <= 8; i++) {
      await Provider.findOneAndUpdate(
        { id: i },
        { id: i, name: `Provider ${i}`, monthlyQuota: 10 },
        { upsert: true, new: true }
      );
    }

    // Upsert Services
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
    
    // Clear old leads for testing purposes
    await Lead.deleteMany({});
    await Provider.updateMany({}, { quotaUsed: 0 });

    return NextResponse.json({ message: 'Seed successful' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
