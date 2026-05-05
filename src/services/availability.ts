import { BAYS, TECHNICIANS, SERVICE_TYPES } from '../mocks/data';
import { simulateDelay } from './delay';
import { getStore } from './store';
import { addMinutes, windowsOverlap, isOnShift } from '../utils/time';
import type { AvailableSlot } from '../types/domain';

export async function check(params: {
  dealershipId: string;
  serviceTypeId: string;
  startsAt: string;
}): Promise<AvailableSlot[]> {
  await simulateDelay(200, 400);

  const { dealershipId, serviceTypeId, startsAt } = params;
  const store = getStore();

  const serviceType = SERVICE_TYPES.find(st => st.id === serviceTypeId);
  if (!serviceType) return [];

  const endsAt = addMinutes(startsAt, serviceType.estimatedDurationMin);

  const eligibleBays = BAYS.filter(
    b =>
      b.dealershipId === dealershipId &&
      b.bayType === serviceType.requiredBayType &&
      b.status === 'active'
  );

  const eligibleTechs = TECHNICIANS.filter(
    t =>
      t.dealershipId === dealershipId &&
      serviceType.requiredCertifications.every(cert => t.certifications.includes(cert)) &&
      isOnShift(t.shift, startsAt, endsAt)
  );

  const busyBayIds = new Set<string>();
  const busyTechIds = new Set<string>();

  for (const appt of store.appointments) {
    if (!['confirmed', 'in-progress'].includes(appt.status)) continue;
    if (appt.dealershipId !== dealershipId) continue;
    if (windowsOverlap(appt.scheduledStart, appt.scheduledEnd, startsAt, endsAt)) {
      busyBayIds.add(appt.serviceBayId);
      busyTechIds.add(appt.technicianId);
    }
  }

  const now = new Date().toISOString();
  for (const hold of store.holds) {
    if (hold.expiresAt <= now) continue;
    if (windowsOverlap(hold.startsAt, hold.endsAt, startsAt, endsAt)) {
      busyBayIds.add(hold.serviceBayId);
      busyTechIds.add(hold.technicianId);
    }
  }

  const availableBays = eligibleBays.filter(b => !busyBayIds.has(b.id));
  const availableTechs = eligibleTechs.filter(t => !busyTechIds.has(t.id));

  const slots: AvailableSlot[] = [];
  for (const technician of availableTechs) {
    for (const serviceBay of availableBays) {
      slots.push({ technician, serviceBay, startsAt, endsAt });
    }
  }

  return slots;
}
