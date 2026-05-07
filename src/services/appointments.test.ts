import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Appointment, Hold } from '../types/domain';

// --- mocks ---

const mockAppts: Appointment[] = [];
const mockHolds: Map<string, Hold> = new Map();

vi.mock('./store', () => ({
  getStore: () => ({ appointments: mockAppts, holds: [], customVehicles: [] }),
  addAppointment:          (a: Appointment) => { mockAppts.push(a); },
  updateAppointmentStatus: (id: string, status: Appointment['status']) => {
    const a = mockAppts.find(x => x.id === id);
    if (a) a.status = status;
  },
  getHold:    (id: string) => mockHolds.get(id),
  removeHold: (id: string) => { mockHolds.delete(id); },
  addCustomVehicle: vi.fn(),
}));

vi.mock('./delay', () => ({
  simulateDelay: () => Promise.resolve(),
}));

beforeEach(() => {
  mockAppts.length = 0;
  mockHolds.clear();
});

// --- tests ---

describe('confirm', () => {
  it('creates an appointment from a valid hold and removes the hold', async () => {
    const { confirm } = await import('./appointments');
    const hold = makeHold(future(60));
    mockHolds.set(hold.id, hold);

    const appt = await confirm(hold.id, { customerId: 'c1', vehicleId: 'v1' });

    expect(appt.technicianId).toBe(hold.technicianId);
    expect(appt.serviceBayId).toBe(hold.serviceBayId);
    expect(appt.scheduledStart).toBe(hold.startsAt);
    expect(appt.status).toBe('confirmed');
    expect(mockHolds.has(hold.id)).toBe(false);
  });

  it('throws HOLD_EXPIRED when hold does not exist', async () => {
    const { confirm } = await import('./appointments');
    await expect(confirm('nonexistent', { customerId: 'c1', vehicleId: 'v1' }))
      .rejects.toThrow('HOLD_EXPIRED');
  });

  it('throws HOLD_EXPIRED when hold has already expired', async () => {
    const { confirm } = await import('./appointments');
    const hold = makeHold(past(60));
    mockHolds.set(hold.id, hold);
    await expect(confirm(hold.id, { customerId: 'c1', vehicleId: 'v1' }))
      .rejects.toThrow('HOLD_EXPIRED');
  });

  it('assigns the correct dealershipId from the bay', async () => {
    const { confirm } = await import('./appointments');
    const hold = makeHold(future(60));
    mockHolds.set(hold.id, hold);
    const appt = await confirm(hold.id, { customerId: 'c1', vehicleId: 'v1' });
    expect(appt.dealershipId).toBe('d-1');
  });
});

describe('cancel', () => {
  it('sets appointment status to cancelled', async () => {
    const { cancel } = await import('./appointments');
    mockAppts.push(makeAppt('apt-1', 'confirmed'));
    await cancel('apt-1');
    expect(mockAppts[0].status).toBe('cancelled');
  });
});

describe('setStatus', () => {
  it('transitions confirmed → in-progress', async () => {
    const { setStatus } = await import('./appointments');
    mockAppts.push(makeAppt('apt-1', 'confirmed'));
    await setStatus('apt-1', 'in-progress');
    expect(mockAppts[0].status).toBe('in-progress');
  });

  it('transitions in-progress → completed', async () => {
    const { setStatus } = await import('./appointments');
    mockAppts.push(makeAppt('apt-1', 'in-progress'));
    await setStatus('apt-1', 'completed');
    expect(mockAppts[0].status).toBe('completed');
  });
});

describe('enrichAppointment', () => {
  it('resolves all foreign keys for a known appointment', async () => {
    const { enrichAppointment } = await import('./appointments');
    const appt = makeAppt('apt-1', 'confirmed', 'd-1', 't-1-1', 'b-1-1', 'st-1', 'v-1');
    const enriched = enrichAppointment(appt);
    expect(enriched.dealership?.id).toBe('d-1');
    expect(enriched.technician?.id).toBe('t-1-1');
    expect(enriched.serviceBay?.id).toBe('b-1-1');
    expect(enriched.serviceType?.id).toBe('st-1');
  });

  it('returns undefined for unknown foreign keys', async () => {
    const { enrichAppointment } = await import('./appointments');
    const appt = makeAppt('apt-1', 'confirmed', 'unknown-d', 'unknown-t', 'unknown-b', 'unknown-st', 'unknown-v');
    const enriched = enrichAppointment(appt);
    expect(enriched.dealership).toBeUndefined();
    expect(enriched.technician).toBeUndefined();
    expect(enriched.serviceBay).toBeUndefined();
    expect(enriched.serviceType).toBeUndefined();
  });
});

// --- helpers ---

function makeHold(expiresAt: string): Hold {
  return {
    id: `hold-${Math.random().toString(36).slice(2)}`,
    technicianId: 't-1-1',
    serviceBayId: 'b-1-1',
    serviceTypeId: 'st-1',
    startsAt: '2025-05-05T14:00:00.000Z',
    endsAt:   '2025-05-05T14:45:00.000Z',
    expiresAt,
  };
}

function makeAppt(
  id: string,
  status: Appointment['status'],
  dealershipId = 'd-1',
  technicianId = 't-1-1',
  serviceBayId = 'b-1-1',
  serviceTypeId = 'st-1',
  vehicleId = 'v-1',
): Appointment {
  return {
    id,
    customerId: 'c1',
    vehicleId,
    technicianId,
    serviceBayId,
    serviceTypeId,
    dealershipId,
    scheduledStart: '2025-05-05T14:00:00.000Z',
    scheduledEnd:   '2025-05-05T14:45:00.000Z',
    status,
    createdAt: new Date().toISOString(),
  };
}

function future(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function past(seconds: number) {
  return new Date(Date.now() - seconds * 1000).toISOString();
}
