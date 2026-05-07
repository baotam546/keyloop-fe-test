export type BayType = 'lift' | 'flat' | 'paint';

export interface GuestCustomer {
  name: string;
  email: string;
  phone: string;
}
export type AppointmentStatus = 'requested' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

export interface OpeningHours {
  daysOfWeek: number[]; // 0=Sun, 1=Mon...6=Sat
  startHour: number;
  endHour: number;
}

export interface Dealership {
  id: string;
  name: string;
  address: string;
  city: string;
  timezone: string;
  openingHours: OpeningHours;
}

export interface ServiceBay {
  id: string;
  dealershipId: string;
  bayNumber: string;
  bayType: BayType;
  status: 'active' | 'inactive';
}

export interface Shift {
  daysOfWeek: number[];
  startHour: number;
  endHour: number;
}

export interface Technician {
  id: string;
  dealershipId: string;
  name: string;
  certifications: string[];
  shift: Shift;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  estimatedDurationMin: number;
  requiredBayType: BayType;
  requiredCertifications: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  vin: string;
  make: string;
  model: string;
  year: number;
}

export interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  technicianId: string;
  serviceBayId: string;
  serviceTypeId: string;
  dealershipId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Hold {
  id: string;
  technicianId: string;
  serviceBayId: string;
  serviceTypeId: string;
  startsAt: string;
  endsAt: string;
  expiresAt: string;
}

export interface AvailableSlot {
  technician: Technician;
  serviceBay: ServiceBay;
  startsAt: string;
  endsAt: string;
}
