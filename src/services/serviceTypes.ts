import { SERVICE_TYPES } from '../mocks/data';
import { simulateDelay } from './delay';
import type { ServiceType } from '../types/domain';

export async function list(): Promise<ServiceType[]> {
  await simulateDelay();
  return [...SERVICE_TYPES];
}
