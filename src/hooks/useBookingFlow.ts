import { useState } from 'react';
import type { Dealership, Vehicle, ServiceType, AvailableSlot, Hold, Appointment, GuestCustomer } from '../types/domain';
import * as dealershipsApi from '../services/dealerships';
import * as vehiclesApi from '../services/vehicles';
import * as serviceTypesApi from '../services/serviceTypes';
import * as availabilityApi from '../services/availability';
import * as holdsApi from '../services/holds';
import * as appointmentsApi from '../services/appointments';
import { toISO, uid, getTimeSlots, isDealershipOpen } from '../utils/time';
import { CURRENT_CUSTOMER } from '../mocks/data';

export type BookingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface BookingFlowState {
  step: BookingStep;
  customerInfo: GuestCustomer | null;
  dealership: Dealership | null;
  vehicle: Vehicle | null;
  serviceType: ServiceType | null;
  date: string;
  time: string;
  slotAvailability: Record<string, boolean>;
  selectedSlot: AvailableSlot | null;
  hold: Hold | null;
  appointment: Appointment | null;
  loading: boolean;
  error: string | null;
}

const initial: BookingFlowState = {
  step: 0,
  customerInfo: null,
  dealership: null,
  vehicle: null,
  serviceType: null,
  date: '',
  time: '',
  slotAvailability: {},
  selectedSlot: null,
  hold: null,
  appointment: null,
  loading: false,
  error: null,
};

export function useBookingFlow() {
  const [state, setState] = useState<BookingFlowState>(initial);
  const [guestCustomerId] = useState(() => `guest-${uid()}`);

  const patch = (updates: Partial<BookingFlowState>) =>
    setState(prev => ({ ...prev, ...updates }));

  const submitCustomerInfo = (customerInfo: GuestCustomer) => {
    patch({ customerInfo, step: 1, error: null });
  };

  const selectDealership = (dealership: Dealership) => {
    patch({ dealership, vehicle: null, serviceType: null, date: '', time: '', slotAvailability: {}, step: 2, error: null });
  };

  const selectVehicle = (vehicle: Vehicle) => {
    patch({ vehicle, step: 3, error: null });
  };

  const selectServiceType = (serviceType: ServiceType) => {
    patch({ serviceType, date: '', time: '', slotAvailability: {}, step: 4, error: null });
  };

  const setDate = async (date: string) => {
    const { dealership, serviceType } = state;

    if (!dealership || !serviceType || !date || !isDealershipOpen(dealership.openingHours, date)) {
      patch({ date, time: '', slotAvailability: {}, loading: false, error: null });
      return;
    }

    patch({ date, time: '', slotAvailability: {}, loading: true, error: null });

    try {
      const times = getTimeSlots(dealership.openingHours, serviceType.estimatedDurationMin);
      const results = await Promise.all(
        times.map(t =>
          availabilityApi.check({
            dealershipId: dealership.id,
            serviceTypeId: serviceType.id,
            startsAt: toISO(date, t),
          }).then(slots => [t, slots.length > 0] as [string, boolean])
        )
      );
      patch({ loading: false, slotAvailability: Object.fromEntries(results) });
    } catch {
      patch({ loading: false, error: 'Failed to load availability. Please try again.' });
    }
  };

  const selectTime = async (time: string) => {
    const { dealership, serviceType, date } = state;
    if (!dealership || !serviceType || !date) return;

    patch({ loading: true, time, error: null });

    try {
      const startsAt = toISO(date, time);
      const slots = await availabilityApi.check({
        dealershipId: dealership.id,
        serviceTypeId: serviceType.id,
        startsAt,
      });
      if (slots.length === 0) {
        patch({ loading: false, error: 'This time is no longer available. Please choose another.' });
        return;
      }
      const hold = await holdsApi.create(slots[0], serviceType.id);
      patch({ loading: false, selectedSlot: slots[0], hold, step: 5 });
    } catch {
      patch({ loading: false, error: 'Failed to reserve this slot. Please try again.' });
    }
  };

  const confirmBooking = async () => {
    const { hold, vehicle, customerInfo } = state;
    if (!hold || !vehicle || !customerInfo) return;

    patch({ loading: true, error: null });
    try {
      const appointment = await appointmentsApi.confirm(hold.id, {
        customerId: guestCustomerId,
        vehicleId: vehicle.id,
      });
      if (vehicle.customerId === '') {
        appointmentsApi.storeCustomVehicle(vehicle);
      }
      patch({ loading: false, appointment, hold: null, step: 6 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'HOLD_EXPIRED') {
        patch({ loading: false, hold: null, selectedSlot: null, step: 4, error: 'Your slot hold expired. Please select a new time.' });
      } else {
        patch({ loading: false, error: 'Booking failed. Please try again.' });
      }
    }
  };

  const onHoldExpired = () => {
    patch({ hold: null, error: 'Your slot hold expired. Please select a new time.' });
  };

  const goBack = () => {
    const { step, hold } = state;
    if (step === 5 && hold) {
      holdsApi.release(hold.id);
      patch({ hold: null, selectedSlot: null });
    }
    patch({ step: Math.max(0, step - 1) as BookingStep, error: null });
  };

  const reset = () => setState(initial);

  return {
    state,
    submitCustomerInfo,
    selectDealership,
    selectVehicle,
    selectServiceType,
    setDate,
    selectTime,
    confirmBooking,
    onHoldExpired,
    goBack,
    reset,
    loadDealerships: dealershipsApi.list,
    loadVehicles: () => vehiclesApi.listForCustomer(CURRENT_CUSTOMER.id),
    loadServiceTypes: serviceTypesApi.list,
  };
}
