import type { AircraftType } from '../types';

export const AIRCRAFT_TYPES: Record<string, AircraftType> = {
  'ATR72': {
    name: 'ATR 72',
    range: 825,
    speed: 280,
    capacity: 70,
    cost: 1500000,
    fuelPerNm: 6,
    baseMaintenancePerNm: 3,
  },
  'A320': {
    name: 'Airbus A320',
    range: 3300,
    speed: 470,
    capacity: 150,
    cost: 10000000,
    fuelPerNm: 8,
    baseMaintenancePerNm: 4,
  },
  'B737': {
    name: 'Boeing 737',
    range: 3000,
    speed: 460,
    capacity: 140,
    cost: 9500000,
    fuelPerNm: 7.5,
    baseMaintenancePerNm: 3.5,
  },
  'A350': {
    name: 'Airbus A350',
    range: 8100,
    speed: 490,
    capacity: 325,
    cost: 30000000,
    fuelPerNm: 20,
    baseMaintenancePerNm: 8,
  }
};