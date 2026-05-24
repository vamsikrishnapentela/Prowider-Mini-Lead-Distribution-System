import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Provider from '@/models/Provider';
import Lead from '@/models/Lead';
import SystemStats from '@/models/SystemStats';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    const [providers, totalLeads, unassignedLeads, stats] = await Promise.all([
      Provider.find({}),
      Lead.countDocuments({}),
      Lead.countDocuments({ status: 'UNASSIGNED' }),
      SystemStats.findOne({ id: 'main' })
    ]);

    let activeProviders = 0;
    let exhaustedProviders = 0;
    
    providers.forEach(p => {
      if (p.quotaUsed >= p.monthlyQuota) exhaustedProviders++;
      else activeProviders++;
    });

    const duplicatesBlocked = stats?.duplicatesBlocked || 0;
    const webhooksProcessed = stats?.webhooksProcessed || 0;

    return NextResponse.json({
      activeProviders,
      exhaustedProviders,
      totalLeads,
      unassignedLeads,
      assignedLeads: totalLeads - unassignedLeads,
      duplicatesBlocked,
      webhooksProcessed
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
