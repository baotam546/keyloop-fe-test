import { describe, it, expect, beforeEach, vi } from 'vitest';

// Reset the module between tests so the singleton _store starts clean
let storeModule: typeof import('./store');

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() });
  storeModule = await import('./store');
});

describe('appointments', () => {
  it('addAppointment stores the appointment', () => {
    const appt = makeAppt('a1', 'confirmed');
    storeModule.addAppointment(appt);
    expect(storeModule.getStore().appointments).toContainEqual(appt);
  });

  it('updateAppointmentStatus changes only the target appointment', () => {
    const a1 = makeAppt('a1', 'confirmed');
    const a2 = makeAppt('a2', 'confirmed');
    storeModule.addAppointment(a1);
    storeModule.addAppointment(a2);
    storeModule.updateAppointmentStatus('a1', 'cancelled');
    const store = storeModule.getStore();
    expect(store.appointments.find(a => a.id === 'a1')!.status).toBe('cancelled');
    expect(store.appointments.find(a => a.id === 'a2')!.status).toBe('confirmed');
  });

  it('updateAppointmentStatus is a no-op for unknown id', () => {
    storeModule.addAppointment(makeAppt('a1', 'confirmed'));
    storeModule.updateAppointmentStatus('unknown', 'cancelled');
    expect(storeModule.getStore().appointments[0].status).toBe('confirmed');
  });
});

describe('holds', () => {
  it('addHold and getHold round-trip correctly', () => {
    const hold = makeHold('h1', future(60));
    storeModule.addHold(hold);
    expect(storeModule.getHold('h1')).toEqual(hold);
  });

  it('removeHold deletes the hold', () => {
    storeModule.addHold(makeHold('h1', future(60)));
    storeModule.removeHold('h1');
    expect(storeModule.getHold('h1')).toBeUndefined();
  });

  it('getHold returns undefined for unknown id', () => {
    expect(storeModule.getHold('nope')).toBeUndefined();
  });

  it('cleanExpiredHolds removes past-expiry holds and keeps active ones', () => {
    storeModule.addHold(makeHold('expired', past(60)));
    storeModule.addHold(makeHold('active', future(60)));
    storeModule.cleanExpiredHolds();
    expect(storeModule.getHold('expired')).toBeUndefined();
    expect(storeModule.getHold('active')).toBeDefined();
  });

  it('addHold calls cleanExpiredHolds before inserting', () => {
    storeModule.addHold(makeHold('old', past(60)));
    // adding a new hold should evict the expired one
    storeModule.addHold(makeHold('new', future(60)));
    expect(storeModule.getHold('old')).toBeUndefined();
    expect(storeModule.getHold('new')).toBeDefined();
  });
});

// --- helpers ---

function makeAppt(id: string, status: import('../types/domain').AppointmentStatus) {
  return {
    id,
    customerId: 'c1',
    vehicleId: 'v1',
    technicianId: 't1',
    serviceBayId: 'b1',
    serviceTypeId: 'st1',
    dealershipId: 'd1',
    scheduledStart: '2025-05-05T09:00:00.000Z',
    scheduledEnd:   '2025-05-05T09:45:00.000Z',
    status,
    createdAt: new Date().toISOString(),
  } as import('../types/domain').Appointment;
}

function makeHold(id: string, expiresAt: string): import('../types/domain').Hold {
  return {
    id,
    technicianId: 't1',
    serviceBayId: 'b1',
    serviceTypeId: 'st1',
    startsAt: '2025-05-05T09:00:00.000Z',
    endsAt:   '2025-05-05T09:45:00.000Z',
    expiresAt,
  };
}

function future(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function past(seconds: number) {
  return new Date(Date.now() - seconds * 1000).toISOString();
}
