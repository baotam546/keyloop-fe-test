import { simulateDelay } from './delay';
import { getStore, addAppointment, updateAppointmentStatus, getHold, removeHold, addCustomVehicle } from './store';
import { BAYS, DEALERSHIPS, SERVICE_TYPES, TECHNICIANS, VEHICLES } from '../mocks/data';
import { uid } from '../utils/time';
import type { Appointment, Vehicle } from '../types/domain';

export async function confirm(
  holdId: string,
  params: { customerId: string; vehicleId: string }
): Promise<Appointment> {
  await simulateDelay(200, 400);

  const hold = getHold(holdId);
  if (!hold) throw new Error('HOLD_EXPIRED');
  if (new Date(hold.expiresAt) <= new Date()) {
    removeHold(holdId);
    throw new Error('HOLD_EXPIRED');
  }

  const bay = BAYS.find(b => b.id === hold.serviceBayId)!;

  const appt: Appointment = {
    id: 'APT-' + uid().toUpperCase().slice(0, 8),
    customerId: params.customerId,
    vehicleId: params.vehicleId,
    technicianId: hold.technicianId,
    serviceBayId: hold.serviceBayId,
    serviceTypeId: hold.serviceTypeId,
    dealershipId: bay.dealershipId,
    scheduledStart: hold.startsAt,
    scheduledEnd: hold.endsAt,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  addAppointment(appt);
  removeHold(holdId);
  return appt;
}

export async function listForCustomer(customerId: string): Promise<Appointment[]> {
  await simulateDelay();
  return getStore().appointments.filter(a => a.customerId === customerId);
}

export async function listAll(): Promise<Appointment[]> {
  await simulateDelay();
  return [...getStore().appointments];
}


export function storeCustomVehicle(vehicle: Vehicle): void {
  addCustomVehicle(vehicle);
}

export async function cancel(appointmentId: string): Promise<void> {
  await simulateDelay(100, 200);
  updateAppointmentStatus(appointmentId, 'cancelled');
}

export function enrichAppointment(appt: Appointment) {
  const allVehicles = [...VEHICLES, ...getStore().customVehicles];
  return {
    ...appt,
    dealership: DEALERSHIPS.find(d => d.id === appt.dealershipId),
    vehicle: allVehicles.find(v => v.id === appt.vehicleId),
    technician: TECHNICIANS.find(t => t.id === appt.technicianId),
    serviceBay: BAYS.find(b => b.id === appt.serviceBayId),
    serviceType: SERVICE_TYPES.find(st => st.id === appt.serviceTypeId),
  };
}
