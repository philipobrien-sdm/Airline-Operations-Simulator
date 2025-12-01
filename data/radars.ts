import type { Point } from '../types';
import { airportsWithPositions } from './airports';

// FIX: Generate PREDEFINED_RADARS dynamically from the airport list.
// This ensures every airport has a radar station by default.
export const PREDEFINED_RADARS: Omit<{name: string; position: Point; isActive: boolean;}, 'id' | 'range'>[] = 
  airportsWithPositions.map(airport => ({
    name: `${airport.name} Radar`,
    position: airport.position,
    isActive: true,
  }));