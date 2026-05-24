import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import Lead from '../../../../models/Lead';
import { allocateProviders } from '../../../../lib/allocation';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { leadId } = await req.json();
    
    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
    }

    // Atomically find and lock the lead to prevent concurrent retries
    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, status: 'UNASSIGNED' },
      { status: 'PROCESSING' },
      { new: true }
    );

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found or already processed' }, { status: 400 });
    }

    // Try allocation again
    const allocationResult = await allocateProviders(lead.serviceId);
    
    if (!allocationResult.success) {
      // Revert status back to UNASSIGNED if allocation fails
      await Lead.updateOne({ _id: leadId }, { status: 'UNASSIGNED' });
      return NextResponse.json({ error: allocationResult.message }, { status: 400 });
    }

    // Update lead
    lead.assignedProviders = allocationResult.assigned;
    lead.status = 'ASSIGNED';
    await lead.save();

    return NextResponse.json({ message: 'Lead successfully reassigned', lead });
  } catch (error: any) {
    console.error('Error retrying lead assignment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
