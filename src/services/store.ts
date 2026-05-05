import type { Appointment, Hold } from '../types/domain';

interface Store {
  appointments: Appointment[];
  holds: Hold[];
}

const STORAGE_KEY = 'appt-scheduler';

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { appointments: [], holds: [] };
}

function save(store: Store): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ appointments: store.appointments }));
  } catch {}
}

const _store: Store = load();

export function getStore(): Readonly<Store> {
  return _store;
}

export function addAppointment(appt: Appointment): void {
  _store.appointments.push(appt);
  save(_store);
}

export function updateAppointmentStatus(id: string, status: Appointment['status']): void {
  const appt = _store.appointments.find(a => a.id === id);
  if (appt) {
    appt.status = status;
    save(_store);
  }
}

export function addHold(hold: Hold): void {
  cleanExpiredHolds();
  _store.holds.push(hold);
}

export function removeHold(id: string): void {
  const idx = _store.holds.findIndex(h => h.id === id);
  if (idx !== -1) _store.holds.splice(idx, 1);
}

export function getHold(id: string): Hold | undefined {
  return _store.holds.find(h => h.id === id);
}

export function cleanExpiredHolds(): void {
  const now = new Date().toISOString();
  _store.holds = _store.holds.filter(h => h.expiresAt > now);
}
