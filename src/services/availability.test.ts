import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Appointment, Hold } from '../types/domain';
import { toISO, addMinutes } from '../utils/time';

// Seed data subsets used across tests
const DEALERSHIP_ID = 'd-1';
const SERVICE_TYPE_ID = 'st-1'; // Oil Change — flat bay, requires oil-change cert, 45 min

// Build times in LOCAL timezone so isOnShift (which uses getHours()) works
// regardless of where the test runner is located.
// 2025-05-05 = Monday; 10:00 is safely within every technician's shift window.
const STARTS_AT = toISO('2025-05-05', '10:00');
const ENDS_AT   = addMinutes(STARTS_AT, 45);

// Control what the store returns per test
const mockStore = vi.hoisted(() => ({
  appointments: [] as Appointment[],
  holds: [] as Hold[],
  customVehicles: [] as never[],
}));

vi.mock('./store', () => ({
  getStore: () => mockStore,
}));

vi.mock('./delay', () => ({
  simulateDelay: () => Promise.resolve(),
}));

beforeEach(() => {
  mockStore.appointments = [];
  mockStore.holds = [];
});

describe('availability.check', () => {
  it('returns slots when a compatible tech and bay are free', async () => {
    const { check } = await import('./availability');
    const slots = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: SERVICE_TYPE_ID, startsAt: STARTS_AT });
    expect(slots.length).toBeGreaterThan(0);
  });

  it('returns empty array for an unknown service type', async () => {
    const { check } = await import('./availability');
    const slots = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: 'unknown', startsAt: STARTS_AT });
    expect(slots).toEqual([]);
  });

  it('excludes a technician who lacks the required certification', async () => {
    // st-2 = Brake Service, requires brakes + safety certs
    // t-1-1 (Marcus Rivera) only has oil-change + diagnostic — should NOT appear
    const { check } = await import('./availability');
    const slots = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: 'st-2', startsAt: STARTS_AT });
    const techIds = slots.map(s => s.technician.id);
    expect(techIds).not.toContain('t-1-1');
  });

  it('excludes bays of the wrong type (lift service gets no flat bays)', async () => {
    // st-2 = Brake Service, requires lift bay
    const { check } = await import('./availability');
    const slots = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: 'st-2', startsAt: STARTS_AT });
    const bayTypes = slots.map(s => s.serviceBay.bayType);
    expect(bayTypes.every(t => t === 'lift')).toBe(true);
  });

  it('excludes a technician not on shift at the requested time', async () => {
    // Sofia Chen (t-1-4) shift starts at 10:00 — request a slot at 09:00, she should not appear
    const earlyStart = toISO('2025-05-05', '09:00');
    const { check } = await import('./availability');
    const slots = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: 'st-2', startsAt: earlyStart });
    const techIds = slots.map(s => s.technician.id);
    expect(techIds).not.toContain('t-1-4');
  });

  it('excludes a tech blocked by a confirmed appointment that overlaps', async () => {
    mockStore.appointments = [makeAppt('t-1-1', 'b-1-1', 'confirmed')];
    const { check } = await import('./availability');
    const slots = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: SERVICE_TYPE_ID, startsAt: STARTS_AT });
    expect(slots.every(s => s.technician.id !== 't-1-1')).toBe(true);
  });

  it('excludes a bay blocked by an in-progress appointment that overlaps', async () => {
    mockStore.appointments = [makeAppt('t-1-3', 'b-1-1', 'in-progress')];
    const { check } = await import('./availability');
    const slots = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: SERVICE_TYPE_ID, startsAt: STARTS_AT });
    expect(slots.every(s => s.serviceBay.id !== 'b-1-1')).toBe(true);
  });

  it('does NOT exclude resources for cancelled appointments', async () => {
    const { check } = await import('./availability');
    mockStore.appointments = [];
    const baseline = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: SERVICE_TYPE_ID, startsAt: STARTS_AT });
    mockStore.appointments = [makeAppt('t-1-3', 'b-1-1', 'cancelled')];
    const withCancelled = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: SERVICE_TYPE_ID, startsAt: STARTS_AT });
    expect(withCancelled.length).toBe(baseline.length);
  });

  it('does NOT exclude resources for completed appointments', async () => {
    const { check } = await import('./availability');
    mockStore.appointments = [];
    const baseline = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: SERVICE_TYPE_ID, startsAt: STARTS_AT });
    mockStore.appointments = [makeAppt('t-1-3', 'b-1-1', 'completed')];
    const withCompleted = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: SERVICE_TYPE_ID, startsAt: STARTS_AT });
    expect(withCompleted.length).toBe(baseline.length);
  });

  it('excludes resources blocked by an active (unexpired) hold', async () => {
    mockStore.holds = [makeHold('t-1-1', 'b-1-1', future(120))];
    const { check } = await import('./availability');
    const slots = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: SERVICE_TYPE_ID, startsAt: STARTS_AT });
    expect(slots.every(s => s.technician.id !== 't-1-1')).toBe(true);
    expect(slots.every(s => s.serviceBay.id !== 'b-1-1')).toBe(true);
  });

  it('does NOT exclude resources for an expired hold', async () => {
    const { check } = await import('./availability');
    mockStore.holds = [];
    const baseline = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: SERVICE_TYPE_ID, startsAt: STARTS_AT });
    mockStore.holds = [makeHold('t-1-1', 'b-1-1', past(60))];
    const withExpired = await check({ dealershipId: DEALERSHIP_ID, serviceTypeId: SERVICE_TYPE_ID, startsAt: STARTS_AT });
    expect(withExpired.length).toBe(baseline.length);
  });
});

// --- helpers ---

function makeAppt(
  techId: string,
  bayId: string,
  status: Appointment['status'],
): Appointment {
  return {
    id: `appt-${Math.random()}`,
    customerId: 'c1',
    vehicleId: 'v1',
    technicianId: techId,
    serviceBayId: bayId,
    serviceTypeId: SERVICE_TYPE_ID,
    dealershipId: DEALERSHIP_ID,
    scheduledStart: STARTS_AT,
    scheduledEnd: ENDS_AT,
    status,
    createdAt: new Date().toISOString(),
  };
}

function makeHold(techId: string, bayId: string, expiresAt: string): Hold {
  return {
    id: `hold-${Math.random()}`,
    technicianId: techId,
    serviceBayId: bayId,
    serviceTypeId: SERVICE_TYPE_ID,
    startsAt: STARTS_AT,
    endsAt: ENDS_AT,
    expiresAt,
  };
}

function future(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function past(seconds: number) {
  return new Date(Date.now() - seconds * 1000).toISOString();
}
