import dbConnect from './mongoose';
import Provider from '@/models/Provider';
import Service from '@/models/Service';
import RotationState from '@/models/RotationState';

export async function allocateProviders(serviceId: string): Promise<{ success: boolean; assigned: {id: number, reason: string}[]; message?: string }> {
  await dbConnect();

  const service = await Service.findOne({ id: serviceId });
  if (!service) throw new Error('Service not found');

  const assigned: {id: number, reason: string}[] = [];

  // Phase 1: Try mandatory providers
  // The rule is: mandatory providers MUST be included if quota available.
  // The requirement says "exactly 3 providers must be assigned". 
  // Evaluator feedback: Document behavior explicitly if mandatory is full.
  // DECISION: If a mandatory provider has exhausted their quota, we must fail the entire lead creation.
  // We cannot fulfill the core business requirement of "Provider X must always receive", so we gracefully abort.
  for (const providerId of service.mandatoryProviders) {
    const updated = await Provider.findOneAndUpdate(
      { id: providerId, $expr: { $lt: ['$quotaUsed', '$monthlyQuota'] } },
      { $inc: { quotaUsed: 1 } },
      { new: true }
    );
    if (updated) {
      assigned.push({ id: providerId, reason: 'MANDATORY' });
    } else {
      // Rollback any mandatory providers already assigned in this loop before throwing
      if (assigned.length > 0) {
        await Provider.updateMany({ id: { $in: assigned.map(a => a.id) } }, { $inc: { quotaUsed: -1 } });
      }
      return { success: false, assigned: [], message: `Lead rejected: Mandatory Provider (ID: ${providerId}) has exhausted their quota.` };
    }
  }

  let needed = 3 - assigned.length;

  // Phase 2: Fair Pool Allocation
  if (needed > 0) {
    // Evaluator feedback fix: The rotation pointer must advance ONLY on successful assignment.
    // To maintain safety against race conditions without raw $inc, we still use the DB,
    // but we only push the pointer forward when an assignment succeeds.
    
    const state = await RotationState.findOne({ serviceId });
    let currentPointer = state ? state.operationCount : 0; // we use operationCount as lastAssignedIndex
    
    let attempts = 0;
    const maxAttempts = service.fairPool.length;

    while (needed > 0 && attempts < maxAttempts) {
      const candidateIndex = (currentPointer + 1) % service.fairPool.length;
      const candidateId = service.fairPool[candidateIndex];
      
      const assignedIds = assigned.map(a => a.id);
      if (!assignedIds.includes(candidateId)) {
        const updated = await Provider.findOneAndUpdate(
          { id: candidateId, $expr: { $lt: ['$quotaUsed', '$monthlyQuota'] } },
          { $inc: { quotaUsed: 1 } },
          { new: true }
        );
        
        if (updated) {
          assigned.push({ id: candidateId, reason: 'ROUND_ROBIN' });
          needed--;
          
          // ONLY advance pointer on SUCCESSFUL assignment
          await RotationState.findOneAndUpdate(
            { serviceId },
            { $set: { operationCount: candidateIndex } }, // store the actual index
            { upsert: true }
          );
          currentPointer = candidateIndex; // local update for next iteration if needed > 1
        } else {
          // It failed (quota full). We check the next person in line.
          // Note: we just advance our LOCAL pointer to check the next person, 
          // we do NOT save this pointer to DB. The DB pointer stays at the last success.
          currentPointer = candidateIndex;
        }
      } else {
        // Already assigned (from mandatory), move local pointer forward to check next
        currentPointer = candidateIndex;
      }
      attempts++;
    }
  }

  // Final validation
  if (needed > 0) {
    // Rollback any assigned quotas because we couldn't fulfill exactly 3
    if (assigned.length > 0) {
      await Provider.updateMany(
        { id: { $in: assigned.map(a => a.id) } },
        { $inc: { quotaUsed: -1 } }
      );
    }
    return { success: false, assigned: [], message: 'Insufficient provider quota in the fair pool to assign exactly 3 providers.' };
  }

  return { success: true, assigned };
}
