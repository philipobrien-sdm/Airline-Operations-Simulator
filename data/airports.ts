

import type { Airport } from '../types';

// The `isCovered` and `hubStatus` properties will be calculated dynamically.
export const airportsWithPositions: Omit<Airport, 'isCovered' | 'hubStatus'>[] = [
    // Major Hubs (8)
    { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK', position: { lat: 51.4700, lng: -0.4543 } },
    { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', position: { lat: 49.0097, lng: 2.5479 } },
    { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands', position: { lat: 52.3105, lng: 4.7683 } },
    { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', position: { lat: 50.0379, lng: 8.5622 } },
    { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', position: { lat: 41.2753, lng: 28.7519 } },
    { code: 'MAD', name: 'Madrid-Barajas', city: 'Madrid', country: 'Spain', position: { lat: 40.4983, lng: -3.5676 } },
    { code: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'Italy', position: { lat: 41.8003, lng: 12.2388 } },
    { code: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany', position: { lat: 48.3537, lng: 11.7861 } },

    // Large Hubs (18)
    { code: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain', position: { lat: 41.2974, lng: 2.0833 } },
    { code: 'LGW', name: 'Gatwick', city: 'London', country: 'UK', position: { lat: 51.1537, lng: -0.1821 } },
    { code: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Ireland', position: { lat: 53.4264, lng: -6.2499 } },
    { code: 'ZRH', name: 'Zurich', city: 'Zurich', country: 'Switzerland', position: { lat: 47.4647, lng: 8.5492 } },
    { code: 'CPH', name: 'Copenhagen', city: 'Copenhagen', country: 'Denmark', position: { lat: 55.6180, lng: 12.6508 } },
    { code: 'OSL', name: 'Oslo', city: 'Oslo', country: 'Norway', position: { lat: 60.1976, lng: 11.1004 } },
    { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden', position: { lat: 59.6498, lng: 17.9238 } },
    { code: 'VIE', name: 'Vienna', city: 'Vienna', country: 'Austria', position: { lat: 48.1103, lng: 16.5697 } },
    { code: 'ATH', name: 'Athens', city: 'Athens', country: 'Greece', position: { lat: 37.9364, lng: 23.9444 } },
    { code: 'LIS', name: 'Lisbon', city: 'Lisbon', country: 'Portugal', position: { lat: 38.7742, lng: -9.1342 } },
    { code: 'BRU', name: 'Brussels', city: 'Brussels', country: 'Belgium', position: { lat: 50.9014, lng: 4.4844 } },
    { code: 'WAW', name: 'Warsaw Chopin', city: 'Warsaw', country: 'Poland', position: { lat: 52.1657, lng: 20.9671 } },
    { code: 'PRG', name: 'Prague', city: 'Prague', country: 'Czech Republic', position: { lat: 50.1008, lng: 14.2600 } },
    { code: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland', position: { lat: 60.3172, lng: 24.9633 } },
    { code: 'BUD', name: 'Budapest', city: 'Budapest', country: 'Hungary', position: { lat: 47.4399, lng: 19.2550 } },
    { code: 'OTP', name: 'Bucharest Otopeni', city: 'Bucharest', country: 'Romania', position: { lat: 44.5711, lng: 26.0850 } },
    { code: 'TXL', name: 'Berlin Tegel', city: 'Berlin', country: 'Germany', position: { lat: 52.5597, lng: 13.2877 } },
    { code: 'DUS', name: 'Düsseldorf', city: 'Düsseldorf', country: 'Germany', position: { lat: 51.2895, lng: 6.7668 } },

    // Medium Hubs (15)
    { code: 'MAN', name: 'Manchester', city: 'Manchester', country: 'UK', position: { lat: 53.3537, lng: -2.2749 } },
    { code: 'STN', name: 'Stansted', city: 'London', country: 'UK', position: { lat: 51.8850, lng: 0.2350 } },
    { code: 'PMI', name: 'Palma de Mallorca', city: 'Palma', country: 'Spain', position: { lat: 39.5517, lng: 2.7388 } },
    { code: 'AGP', name: 'Málaga', city: 'Málaga', country: 'Spain', position: { lat: 36.6749, lng: -4.4991 } },
    { code: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italy', position: { lat: 45.6306, lng: 8.7281 } },
    { code: 'GVA', name: 'Geneva', city: 'Geneva', country: 'Switzerland', position: { lat: 46.2382, lng: 6.1089 } },
    { code: 'NCE', name: 'Nice', city: 'Nice', country: 'France', position: { lat: 43.6653, lng: 7.2150 } },
    { code: 'LYS', name: 'Lyon', city: 'Lyon', country: 'France', position: { lat: 45.7256, lng: 5.0811 } },
    { code: 'HAM', name: 'Hamburg', city: 'Hamburg', country: 'Germany', position: { lat: 53.6304, lng: 9.9882 } },
    { code: 'KEF', name: 'Keflavík', city: 'Reykjavik', country: 'Iceland', position: { lat: 63.9850, lng: -22.6056 } },
    { code: 'RIX', name: 'Riga', city: 'Riga', country: 'Latvia', position: { lat: 56.9236, lng: 23.9711 } },
    { code: 'SOF', name: 'Sofia', city: 'Sofia', country: 'Bulgaria', position: { lat: 42.6950, lng: 23.4114 } },
    { code: 'BEG', name: 'Belgrade', city: 'Belgrade', country: 'Serbia', position: { lat: 44.8184, lng: 20.3091 } },
    { code: 'LJU', name: 'Ljubljana', city: 'Ljubljana', country: 'Slovenia', position: { lat: 46.2236, lng: 14.4575 } },
    { code: 'ZAG', name: 'Zagreb', city: 'Zagreb', country: 'Croatia', position: { lat: 45.7429, lng: 16.0688 } },

    // Other Airports (10)
    { code: 'EDI', name: 'Edinburgh', city: 'Edinburgh', country: 'UK', position: { lat: 55.9500, lng: -3.3725 } },
    { code: 'GLA', name: 'Glasgow', city: 'Glasgow', country: 'UK', position: { lat: 55.8719, lng: -4.4331 } },
    { code: 'BGO', name: 'Bergen', city: 'Bergen', country: 'Norway', position: { lat: 60.2934, lng: 5.2181 } },
    { code: 'SVG', name: 'Stavanger', city: 'Stavanger', country: 'Norway', position: { lat: 58.8767, lng: 5.6378 } },
    { code: 'KRK', name: 'Kraków', city: 'Kraków', country: 'Poland', position: { lat: 50.0777, lng: 19.7848 } },
    { code: 'VNO', name: 'Vilnius', city: 'Vilnius', country: 'Lithuania', position: { lat: 54.6341, lng: 25.2858 } },
    { code: 'TLL', name: 'Tallinn', city: 'Tallinn', country: 'Estonia', position: { lat: 59.4133, lng: 24.8328 } },
    { code: 'OPO', name: 'Porto', city: 'Porto', country: 'Portugal', position: { lat: 41.2481, lng: -8.6814 } },
    { code: 'NAP', name: 'Naples', city: 'Naples', country: 'Italy', position: { lat: 40.8844, lng: 14.2908 } },
    { code: 'MRS', name: 'Marseille', city: 'Marseille', country: 'France', position: { lat: 43.4367, lng: 5.2150 } },
];