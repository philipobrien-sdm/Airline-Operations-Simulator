import type { RouteDemand, Airport } from '../types';
import { calculateDistanceNM } from '../utils';
import { AIRCRAFT_TYPES } from './aircraft_types';

const AVG_CRUISE_SPEED_KNOTS = AIRCRAFT_TYPES['A320'].speed;

const generateDemand = (): { morning: number; afternoon: number; evening: number } => {
    // This new base ensures that even the lowest demand route can support at least one
    // profitable flight for a small aircraft like an ATR-72, and that average routes
    // can support multiple competing flights, fixing the auto-scheduler.
    const base = Math.random() * 2.5 + 1.5; // Generates a base demand multiplier of 1.5x to 4.0x
    return {
        morning: base * (Math.random() * 0.4 + 0.8), // 80-120% of base
        afternoon: base * (Math.random() * 0.4 + 0.9), // 90-130% of base
        evening: base * (Math.random() * 0.4 + 0.7), // 70-110% of base
    }
};

export const generateRoutes = (airports: Airport[]): RouteDemand[] => {
    const routes: RouteDemand[] = [];
    const majorHubs = airports.slice(0, 8);
    const largeHubs = airports.slice(8, 26);
    const mediumHubs = airports.slice(26, 41);
    const otherAirports = airports.slice(41);

    const connect = (groupA: Airport[], groupB: Airport[], count: number) => {
        for(let i=0; i < count; i++) {
            const airportA = groupA[Math.floor(Math.random() * groupA.length)];
            const airportB = groupB[Math.floor(Math.random() * groupB.length)];

            if (airportA.code === airportB.code) continue;
            if (routes.some(r => r.origin === airportA.code && r.destination === airportB.code)) continue;

            const distance = calculateDistanceNM(airportA.position, airportB.position);
            const duration = distance / AVG_CRUISE_SPEED_KNOTS;

            routes.push({
                origin: airportA.code,
                destination: airportB.code,
                demand: generateDemand(),
                durationHours: duration
            });
            routes.push({
                origin: airportB.code,
                destination: airportA.code,
                demand: generateDemand(),
                durationHours: duration
            });
        }
    }

    // Generate a dense, plausible network
    connect(majorHubs, majorHubs, 20);
    connect(majorHubs, largeHubs, 40);
    connect(majorHubs, mediumHubs, 30);
    connect(majorHubs, otherAirports, 20);
    
    connect(largeHubs, largeHubs, 30);
    connect(largeHubs, mediumHubs, 40);
    connect(largeHubs, otherAirports, 30);

    connect(mediumHubs, mediumHubs, 20);
    connect(mediumHubs, otherAirports, 30);

    connect(otherAirports, otherAirports, 20);

    return routes;
};
