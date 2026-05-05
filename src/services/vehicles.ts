import { VEHICLES } from '../mocks/data';
import { simulateDelay } from './delay';
import type { Vehicle } from '../types/domain';

export async function listForCustomer(customerId: string): Promise<Vehicle[]> {
  await simulateDelay();
  return VEHICLES.filter(v => v.customerId === customerId);
}
