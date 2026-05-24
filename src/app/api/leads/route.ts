import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongoose';
import Lead from '../../../models/Lead';
import { allocateProviders } from '../../../lib/allocation';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Normalize phone number (remove spaces, dashes)
    let phone = body.phone?.replace(/\D/g, '');
    
    if (!phone || !body.name || !body.serviceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Quick pre-check for duplicates to fail early
    const existing = await Lead.findOne({ phone, serviceId: body.serviceId });
    if (existing) {
      await dbConnect();
      const SystemStats = (await import('../../../models/SystemStats')).default;
      await SystemStats.findOneAndUpdate({ id: 'main' }, { $inc: { duplicatesBlocked: 1 } }, { upsert: true });
      return NextResponse.json({ error: 'Duplicate lead for this phone and service' }, { status: 409 });
    }

    // 2. Perform allocation FIRST
    const allocationResult = await allocateProviders(body.serviceId);
    
    // 3. Save Lead with assigned providers
    const lead = new Lead({
      name: body.name,
      phone,
      city: body.city || '',
      serviceId: body.serviceId,
      description: body.description || '',
      assignedProviders: allocationResult.assigned,
      status: allocationResult.success ? 'ASSIGNED' : 'UNASSIGNED'
    });

    try {
      await lead.save();
    } catch (err: any) {
      // 4. If DB-level unique constraint fails (race condition duplicate), rollback allocation!
      if (err.code === 11000) {
        await dbConnect();
        const Provider = (await import('../../../models/Provider')).default;
        await Provider.updateMany(
          { id: { $in: allocationResult.assigned.map((a: any) => a.id) } },
          { $inc: { quotaUsed: -1 } }
        );
        const SystemStats = (await import('../../../models/SystemStats')).default;
        await SystemStats.findOneAndUpdate({ id: 'main' }, { $inc: { duplicatesBlocked: 1 } }, { upsert: true });
        return NextResponse.json({ error: 'Duplicate lead for this phone and service' }, { status: 409 });
      }
      throw err;
    }

    if (!allocationResult.success) {
      return NextResponse.json({ 
        message: 'Request received. Currently no providers are available.', 
        lead, 
        assignedProviders: [] 
      });
    }

    return NextResponse.json({ message: 'Lead created successfully', lead, assignedProviders: allocationResult.assigned });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const providerId = url.searchParams.get('providerId');
    
    let query = {};
    if (providerId) {
      query = { assignedProviders: parseInt(providerId, 10) };
    }
    
    const leads = await Lead.find(query).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
