import { describe, it, expect } from 'vitest';
import {
  windowsOverlap,
  isOnShift,
  isDealershipOpen,
  getTimeSlots,
  addMinutes,
  toISO,
} from './time';
import type { OpeningHours, Shift } from '../types/domain';

describe('windowsOverlap', () => {
  it('returns true when windows overlap in the middle', () => {
    expect(windowsOverlap('10:00', '12:00', '11:00', '13:00')).toBe(true);
  });

  it('returns true when one window is fully inside the other', () => {
    expect(windowsOverlap('09:00', '17:00', '10:00', '11:00')).toBe(true);
  });

  it('returns false when windows are adjacent (touching but not overlapping)', () => {
    expect(windowsOverlap('09:00', '10:00', '10:00', '11:00')).toBe(false);
  });

  it('returns false when windows do not overlap', () => {
    expect(windowsOverlap('09:00', '10:00', '11:00', '12:00')).toBe(false);
  });

  it('works with ISO date strings', () => {
    const s1 = '2025-01-01T09:00:00.000Z';
    const e1 = '2025-01-01T10:00:00.000Z';
    const s2 = '2025-01-01T09:30:00.000Z';
    const e2 = '2025-01-01T10:30:00.000Z';
    expect(windowsOverlap(s1, e1, s2, e2)).toBe(true);
  });
});

describe('isOnShift', () => {
  // Monday 2025-05-05, 09:00–09:45 local (using local date construction in toISO)
  const mondayStart = toISO('2025-05-05', '09:00');
  const mondayEnd   = toISO('2025-05-05', '09:45');

  const shift: Shift = { daysOfWeek: [1, 2, 3, 4, 5], startHour: 8, endHour: 17 };

  it('returns true when appointment falls within shift hours on a working day', () => {
    expect(isOnShift(shift, mondayStart, mondayEnd)).toBe(true);
  });

  it('returns false when the day is not in the shift', () => {
    // Sunday 2025-05-04
    const sunStart = toISO('2025-05-04', '09:00');
    const sunEnd   = toISO('2025-05-04', '09:45');
    expect(isOnShift(shift, sunStart, sunEnd)).toBe(false);
  });

  it('returns false when appointment starts before shift start', () => {
    const earlyStart = toISO('2025-05-05', '07:00');
    const earlyEnd   = toISO('2025-05-05', '07:45');
    expect(isOnShift(shift, earlyStart, earlyEnd)).toBe(false);
  });

  it('returns false when appointment ends after shift end', () => {
    const lateStart = toISO('2025-05-05', '16:30');
    const lateEnd   = toISO('2025-05-05', '17:30');
    expect(isOnShift(shift, lateStart, lateEnd)).toBe(false);
  });
});

describe('isDealershipOpen', () => {
  const hours: OpeningHours = { daysOfWeek: [1, 2, 3, 4, 5, 6], startHour: 9, endHour: 18 };

  it('returns true for a weekday the dealership is open', () => {
    expect(isDealershipOpen(hours, '2025-05-05')).toBe(true); // Monday
  });

  it('returns false for Sunday when closed', () => {
    expect(isDealershipOpen(hours, '2025-05-04')).toBe(false); // Sunday
  });
});

describe('getTimeSlots', () => {
  it('generates slots starting at opening hour stepping every 30 min', () => {
    const hours: OpeningHours = { daysOfWeek: [1], startHour: 9, endHour: 11 };
    const slots = getTimeSlots(hours, 60);
    expect(slots).toEqual(['09:00', '09:30', '10:00']);
  });

  it('does not include a slot that would end after closing hour', () => {
    const hours: OpeningHours = { daysOfWeek: [1], startHour: 9, endHour: 10 };
    const slots = getTimeSlots(hours, 60);
    expect(slots).toEqual(['09:00']);
  });

  it('returns empty array when duration exceeds the entire window', () => {
    const hours: OpeningHours = { daysOfWeek: [1], startHour: 9, endHour: 10 };
    const slots = getTimeSlots(hours, 120);
    expect(slots).toEqual([]);
  });
});

describe('addMinutes', () => {
  it('adds minutes within the same hour', () => {
    const result = addMinutes('2025-05-05T09:00:00.000Z', 30);
    expect(result).toBe(new Date('2025-05-05T09:30:00.000Z').toISOString());
  });

  it('rolls over into the next hour', () => {
    const result = addMinutes('2025-05-05T09:45:00.000Z', 30);
    expect(result).toBe(new Date('2025-05-05T10:15:00.000Z').toISOString());
  });
});
