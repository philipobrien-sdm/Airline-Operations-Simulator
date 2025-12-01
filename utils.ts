import type { Point, Airport } from './types';
import { airportsWithPositions } from './data/airports';

// Linear interpolation for a single number
export const lerp = (a: number, b: number, t: number): number => {
  return a * (1 - t) + b * t;
};

// Linear interpolation for a Point
export const lerpPoint = (p1: Point, p2: Point, t: number): Point => {
  return {
    lat: lerp(p1.lat, p2.lat, t),
    lng: lerp(p1.lng, p2.lng, t),
  };
};

// Calculate bearing from point p1 to p2 in degrees
export const calculateBearing = (p1: Point, p2: Point): number => {
  if (p1.lat === p2.lat && p1.lng === p2.lng) {
    return 0;
  }
  
  const toRadians = (deg: number) => deg * Math.PI / 180;
  const toDegrees = (rad: number) => rad * 180 / Math.PI;

  const lat1 = toRadians(p1.lat);
  const lon1 = toRadians(p1.lng);
  const lat2 = toRadians(p2.lat);
  const lon2 = toRadians(p2.lng);

  const dLon = lon2 - lon1;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let brng = toDegrees(Math.atan2(y, x));
  return (brng + 360) % 360;
};


// Calculate distance between two points in nautical miles (Haversine formula)
export const calculateDistanceNM = (p1: Point, p2: Point): number => {
  const R = 3440.065; // Earth's radius in nautical miles
  const toRadians = (deg: number) => deg * Math.PI / 180;

  const lat1 = toRadians(p1.lat);
  const lon1 = toRadians(p1.lng);
  const lat2 = toRadians(p2.lat);
  const lon2 = toRadians(p2.lng);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

// Find the nearest airport to a given point
export const findNearestAirport = (point: Point): Airport => {
  let closestAirport = airportsWithPositions[0];
  let minDistance = Infinity;

  for (const airport of airportsWithPositions) {
    const distance = calculateDistanceNM(point, airport.position);
    if (distance < minDistance) {
      minDistance = distance;
      closestAirport = airport;
    }
  }
  // FIX: The function must return a full `Airport` object, but `airportsWithPositions`
  // items are missing `isCovered`. This adds the property with a default `false`
  // value to satisfy the function's return type.
  return { ...closestAirport, isCovered: false };
};