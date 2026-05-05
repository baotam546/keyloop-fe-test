import type { Dealership, ServiceBay, Technician, ServiceType, Customer, Vehicle } from '../types/domain';

export const DEALERSHIPS: Dealership[] = [
  {
    id: 'd-1',
    name: 'AutoPlus Downtown',
    address: '123 Main St',
    city: 'Chicago, IL',
    timezone: 'America/Chicago',
    openingHours: { daysOfWeek: [1, 2, 3, 4, 5, 6], startHour: 9, endHour: 18 },
  },
  {
    id: 'd-2',
    name: 'PremiumAuto North Shore',
    address: '456 Oak Ave',
    city: 'Evanston, IL',
    timezone: 'America/Chicago',
    openingHours: { daysOfWeek: [1, 2, 3, 4, 5, 6], startHour: 8, endHour: 19 },
  },
  {
    id: 'd-3',
    name: 'QuickService Midway',
    address: '789 Elm Rd',
    city: 'Chicago, IL',
    timezone: 'America/Chicago',
    openingHours: { daysOfWeek: [1, 2, 3, 4, 5], startHour: 7, endHour: 17 },
  },
];

export const BAYS: ServiceBay[] = [
  // AutoPlus Downtown (d-1)
  { id: 'b-1-1', dealershipId: 'd-1', bayNumber: 'A1', bayType: 'flat', status: 'active' },
  { id: 'b-1-2', dealershipId: 'd-1', bayNumber: 'A2', bayType: 'flat', status: 'active' },
  { id: 'b-1-3', dealershipId: 'd-1', bayNumber: 'B1', bayType: 'lift', status: 'active' },
  { id: 'b-1-4', dealershipId: 'd-1', bayNumber: 'B2', bayType: 'lift', status: 'active' },
  { id: 'b-1-5', dealershipId: 'd-1', bayNumber: 'B3', bayType: 'lift', status: 'active' },
  { id: 'b-1-6', dealershipId: 'd-1', bayNumber: 'P1', bayType: 'paint', status: 'active' },
  // PremiumAuto North Shore (d-2)
  { id: 'b-2-1', dealershipId: 'd-2', bayNumber: 'A1', bayType: 'flat', status: 'active' },
  { id: 'b-2-2', dealershipId: 'd-2', bayNumber: 'A2', bayType: 'flat', status: 'active' },
  { id: 'b-2-3', dealershipId: 'd-2', bayNumber: 'B1', bayType: 'lift', status: 'active' },
  { id: 'b-2-4', dealershipId: 'd-2', bayNumber: 'B2', bayType: 'lift', status: 'active' },
  { id: 'b-2-5', dealershipId: 'd-2', bayNumber: 'B3', bayType: 'lift', status: 'active' },
  { id: 'b-2-6', dealershipId: 'd-2', bayNumber: 'P1', bayType: 'paint', status: 'active' },
  // QuickService Midway (d-3)
  { id: 'b-3-1', dealershipId: 'd-3', bayNumber: 'A1', bayType: 'flat', status: 'active' },
  { id: 'b-3-2', dealershipId: 'd-3', bayNumber: 'A2', bayType: 'flat', status: 'active' },
  { id: 'b-3-3', dealershipId: 'd-3', bayNumber: 'B1', bayType: 'lift', status: 'active' },
  { id: 'b-3-4', dealershipId: 'd-3', bayNumber: 'B2', bayType: 'lift', status: 'active' },
  { id: 'b-3-5', dealershipId: 'd-3', bayNumber: 'B3', bayType: 'lift', status: 'active' },
  { id: 'b-3-6', dealershipId: 'd-3', bayNumber: 'P1', bayType: 'paint', status: 'active' },
];

export const TECHNICIANS: Technician[] = [
  // AutoPlus Downtown (d-1)
  { id: 't-1-1', dealershipId: 'd-1', name: 'Marcus Rivera', certifications: ['oil-change', 'diagnostic'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 8, endHour: 17 } },
  { id: 't-1-2', dealershipId: 'd-1', name: 'Priya Patel', certifications: ['brakes', 'safety', 'tires'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 9, endHour: 18 } },
  { id: 't-1-3', dealershipId: 'd-1', name: 'James O\'Brien', certifications: ['tires', 'oil-change'], shift: { daysOfWeek: [1,2,3,4,5,6], startHour: 7, endHour: 16 } },
  { id: 't-1-4', dealershipId: 'd-1', name: 'Sofia Chen', certifications: ['diagnostic', 'brakes', 'safety'], shift: { daysOfWeek: [2,3,4,5,6], startHour: 10, endHour: 19 } },
  { id: 't-1-5', dealershipId: 'd-1', name: 'Derek Washington', certifications: ['paint'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 8, endHour: 17 } },
  { id: 't-1-6', dealershipId: 'd-1', name: 'Lena Kowalski', certifications: ['brakes', 'safety', 'oil-change', 'tires'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 8, endHour: 17 } },
  // PremiumAuto North Shore (d-2)
  { id: 't-2-1', dealershipId: 'd-2', name: 'Carlos Nguyen', certifications: ['oil-change', 'diagnostic'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 8, endHour: 17 } },
  { id: 't-2-2', dealershipId: 'd-2', name: 'Aisha Johnson', certifications: ['brakes', 'safety', 'tires'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 9, endHour: 18 } },
  { id: 't-2-3', dealershipId: 'd-2', name: 'Tom Fischer', certifications: ['tires', 'oil-change'], shift: { daysOfWeek: [1,2,3,4,5,6], startHour: 7, endHour: 16 } },
  { id: 't-2-4', dealershipId: 'd-2', name: 'Mei Lin', certifications: ['diagnostic', 'brakes', 'safety'], shift: { daysOfWeek: [2,3,4,5,6], startHour: 10, endHour: 19 } },
  { id: 't-2-5', dealershipId: 'd-2', name: 'Ray Okonkwo', certifications: ['paint'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 8, endHour: 17 } },
  { id: 't-2-6', dealershipId: 'd-2', name: 'Nina Petrov', certifications: ['brakes', 'safety', 'oil-change', 'tires'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 8, endHour: 17 } },
  // QuickService Midway (d-3)
  { id: 't-3-1', dealershipId: 'd-3', name: 'Alex Torres', certifications: ['oil-change', 'diagnostic'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 7, endHour: 16 } },
  { id: 't-3-2', dealershipId: 'd-3', name: 'Brenda Lee', certifications: ['brakes', 'safety', 'tires'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 8, endHour: 17 } },
  { id: 't-3-3', dealershipId: 'd-3', name: 'Omar Hassan', certifications: ['tires', 'oil-change'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 7, endHour: 16 } },
  { id: 't-3-4', dealershipId: 'd-3', name: 'Yuki Tanaka', certifications: ['diagnostic', 'brakes', 'safety'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 8, endHour: 17 } },
  { id: 't-3-5', dealershipId: 'd-3', name: 'Sam Russo', certifications: ['paint'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 7, endHour: 16 } },
  { id: 't-3-6', dealershipId: 'd-3', name: 'Dana Kim', certifications: ['brakes', 'safety', 'oil-change', 'tires'], shift: { daysOfWeek: [1,2,3,4,5], startHour: 8, endHour: 17 } },
];

export const SERVICE_TYPES: ServiceType[] = [
  {
    id: 'st-1',
    name: 'Oil Change',
    description: 'Full synthetic oil change with filter replacement and multi-point inspection.',
    estimatedDurationMin: 45,
    requiredBayType: 'flat',
    requiredCertifications: ['oil-change'],
  },
  {
    id: 'st-2',
    name: 'Brake Service',
    description: 'Brake pad inspection and replacement, rotor check, brake fluid top-up.',
    estimatedDurationMin: 90,
    requiredBayType: 'lift',
    requiredCertifications: ['brakes', 'safety'],
  },
  {
    id: 'st-3',
    name: 'Tire Rotation',
    description: 'Rotate all four tires and balance. Includes TPMS check.',
    estimatedDurationMin: 60,
    requiredBayType: 'lift',
    requiredCertifications: ['tires'],
  },
  {
    id: 'st-4',
    name: 'Diagnostic Scan',
    description: 'Full OBD-II diagnostic scan to identify error codes and system issues.',
    estimatedDurationMin: 30,
    requiredBayType: 'flat',
    requiredCertifications: ['diagnostic'],
  },
  {
    id: 'st-5',
    name: 'Paint Touch-Up',
    description: 'Professional paint touch-up for minor scratches and chips.',
    estimatedDurationMin: 120,
    requiredBayType: 'paint',
    requiredCertifications: ['paint'],
  },
];

export const CURRENT_CUSTOMER: Customer = {
  id: 'cust-1',
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '(555) 123-4567',
};

export const VEHICLES: Vehicle[] = [
  {
    id: 'v-1',
    customerId: 'cust-1',
    vin: '1HGCM82633A123456',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
  },
  {
    id: 'v-2',
    customerId: 'cust-1',
    vin: '2T1BURHE0JC034567',
    make: 'Honda',
    model: 'Civic',
    year: 2019,
  },
];
