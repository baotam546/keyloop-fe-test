import { DEALERSHIPS } from '../mocks/data';
import { simulateDelay } from './delay';
import type { Dealership } from '../types/domain';

export async function list(): Promise<Dealership[]> {
  await simulateDelay();
  return [...DEALERSHIPS];
}
