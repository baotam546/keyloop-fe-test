import { simulateDelay } from './delay';
import { addHold, removeHold } from './store';
import { uid } from '../utils/time';
import type { AvailableSlot, Hold } from '../types/domain';

const HOLD_TTL_MS = 30_000;

export async function create(slot: AvailableSlot, serviceTypeId: string): Promise<Hold> {
  await simulateDelay(100, 200);
  const hold: Hold = {
    id: uid(),
    technicianId: slot.technician.id,
    serviceBayId: slot.serviceBay.id,
    serviceTypeId,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    expiresAt: new Date(Date.now() + HOLD_TTL_MS).toISOString(),
  };
  addHold(hold);
  return hold;
}

export async function release(holdId: string): Promise<void> {
  removeHold(holdId);
}
