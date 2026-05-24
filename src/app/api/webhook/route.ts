import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongoose';
import Provider from '../../../models/Provider';
import IdempotencyKey from '../../../models/IdempotencyKey';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const { idempotencyKey, providerId } = body;
    
    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Missing idempotency key' }, { status: 400 });
    }

    try {
      // Create idempotency key. If it exists, this throws duplicate key error (11000)
      await IdempotencyKey.create({ key: idempotencyKey });
    } catch (err: any) {
      if (err.code === 11000) {
        return NextResponse.json({ message: 'Webhook already processed (idempotent)' });
      }
      throw err;
    }

    // Reset quota
    if (providerId) {
      await Provider.updateOne({ id: providerId }, { $set: { quotaUsed: 0 } });
    } else {
      await Provider.updateMany({}, { $set: { quotaUsed: 0 } });
    }

    const SystemStats = (await import('../../../models/SystemStats')).default;
    await SystemStats.findOneAndUpdate({ id: 'main' }, { $inc: { webhooksProcessed: 1 } }, { upsert: true });

    return NextResponse.json({ message: 'Quota reset successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
