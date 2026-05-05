import { useState } from 'react';
import type { Dealership, Vehicle, ServiceType, AvailableSlot, Hold, Appointment } from '../types/domain';
import * as dealershipsApi from '../services/dealerships';
import * as vehiclesApi from '../services/vehicles';
import * as serviceTypesApi from '../services/serviceTypes';
import * as availabilityApi from '../services/availability';
import * as holdsApi from '../services/holds';
import * as appointmentsApi from '../services/appointments';
import { toISO } from '../utils/time';
import { CURRENT_CUSTOMER } from '../mocks/data';

export type BookingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface BookingFlowState {
  step: BookingStep;
  dealership: Dealership | null;
  vehicle: Vehicle | null;
  serviceType: ServiceType | null;
  date: string;
  time: string;
  availableSlots: AvailableSlot[];
  selectedSlot: AvailableSlot | null;
  hold: Hold | null;
  appointment: Appointment | null;
  loading: boolean;
  error: string | null;
}

const initial: BookingFlowState = {
  step: 0,
  dealership: null,
  vehicle: null,
  serviceType: null,
  date: '',
  time: '',
  availableSlots: [],
  selectedSlot: null,
  hold: null,
  appointment: null,
  loading: false,
  error: null,
};

export function useBookingFlow() {
  const [state, setState] = useState<BookingFlowState>(initial);

  const patch = (updates: Partial<BookingFlowState>) =>
    setState(prev => ({ ...prev, ...updates }));

  const selectDealership = (dealership: Dealership) => {
    patch({ dealership, vehicle: null, serviceType: null, date: '', time: '', step: 1, error: null });
  };

  const selectVehicle = (vehicle: Vehicle) => {
    patch({ vehicle, step: 2, error: null });
  };

  const selectServiceType = (serviceType: ServiceType) => {
    patch({ serviceType, date: '', time: '', availableSlots: [], step: 3, error: null });
  };

  const setDate = (date: string) => patch({ date, time: '', availableSlots: [], error: null });
  const setTime = (time: string) => patch({ time, availableSlots: [], error: null });

  const checkAvailability = async () => {
    const { dealership, serviceType, date, time } = state;
    if (!dealership || !serviceType || !date || !time) return;
    patch({ loading: true, error: null, availableSlots: [] });
    try {
      const startsAt = toISO(date, time);
      const slots = await availabilityApi.check({
        dealershipId: dealership.id,
        serviceTypeId: serviceType.id,
        startsAt,
      });
      if (slots.length === 0) {
        patch({ loading: false, error: 'No slots available for this time. Please try a different time.' });
      } else {
        patch({ loading: false, availableSlots: slots, step: 4 });
      }
    } catch {
      patch({ loading: false, error: 'Failed to check availability. Please try again.' });
    }
  };

  const selectSlot = async (slot: AvailableSlot) => {
    patch({ loading: true, error: null });
    try {
      const hold = await holdsApi.create(slot, state.serviceType!.id);
      patch({ loading: false, selectedSlot: slot, hold, step: 5 });
    } catch {
      patch({ loading: false, error: 'Could not hold this slot. Please try another.' });
    }
  };

  const confirmBooking = async () => {
    const { hold } = state;
    if (!hold) return;
    patch({ loading: true, error: null });
    try {
      const appointment = await appointmentsApi.confirm(hold.id, {
        customerId: CURRENT_CUSTOMER.id,
        vehicleId: state.vehicle!.id,
      });
      patch({ loading: false, appointment, hold: null, step: 6 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'HOLD_EXPIRED') {
        patch({ loading: false, hold: null, selectedSlot: null, step: 4, error: 'Your slot hold expired. Please select a new slot.' });
      } else {
        patch({ loading: false, error: 'Booking failed. Please try again.' });
      }
    }
  };

  const onHoldExpired = () => {
    patch({ hold: null, error: 'Your slot hold expired. Please select a new slot.' });
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
    customer: CURRENT_CUSTOMER,
    selectDealership,
    selectVehicle,
    selectServiceType,
    setDate,
    setTime,
    checkAvailability,
    selectSlot,
    confirmBooking,
    onHoldExpired,
    goBack,
    reset,
    // preload helpers
    loadDealerships: dealershipsApi.list,
    loadVehicles: () => vehiclesApi.listForCustomer(CURRENT_CUSTOMER.id),
    loadServiceTypes: serviceTypesApi.list,
  };
}
