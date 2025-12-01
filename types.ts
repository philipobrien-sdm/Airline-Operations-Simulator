// types.ts

export interface Point {
  lat: number;
  lng: number;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  position: Point;
  isCovered: boolean;
  hubStatus?: 'small' | 'large';
  aiHubAirline?: string;
}

// Represents one flight in a player aircraft's daily schedule
export interface FlightLeg {
  origin: string;
  destination: string;
  departureTime: number; // In-game hours from start of day
  arrivalTime: number; // In-game hours from start of day
  durationHours: number;
  fareMultiplier?: number;
  delayHours?: number; // For weather delays
}

export interface CostBreakdown {
    fuel: number;
    maintenance: number;
    staff: number;
    mealService: number;
    total: number;
}

export interface CompletedFlightLeg {
  origin: string;
  destination: string;
  miles: number;
  passengers: number;
  revenue: number;
  cost: number;
  profit: number;
  timestamp: number; // game time of arrival
  costBreakdown?: CostBreakdown;
}

export interface Aircraft {
  id: string;
  name?: string;
  type: string;
  airline: 'PLAYER' | string;
  origin: string;
  destination:string;
  position: Point;
  bearing: number;
  progress: number; // 0 to 1
  status: 'IN_FLIGHT' | 'LANDED' | 'GROUNDED' | 'REPOSITIONING';
  homeBase: string; // Airport code
  // Player-specific properties
  schedule?: FlightLeg[];
  history?: CompletedFlightLeg[];
  hasIFE?: boolean;
  hasWifi?: boolean;
  hasMealService?: boolean;
  groundedUntil?: number;
}

// New type for safe rendering, decoupling UI from the full simulation object.
export interface AircraftDisplayData {
  id: string;
  name?: string;
  type: string;
  airline: 'PLAYER' | string;
  origin: string;
  destination: string;
  position: Point;
  bearing: number;
  status: 'IN_FLIGHT' | 'LANDED' | 'GROUNDED' | 'REPOSITIONING';
}


export interface Radar {
  id: string;
  name: string;
  position: Point;
  range: number; // in nautical miles
  isActive: boolean;
}

export type GameSpeed = 1 | 5 | 20 | 50 | 500 | 3600;

export interface RouteDemand {
  origin: string;
  destination: string;
  demand: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  durationHours: number;
}

export interface AircraftType {
  name: string;
  range: number;
  speed: number;
  capacity: number;
  cost: number;
  fuelPerNm: number; // Fuel cost per nautical mile
  baseMaintenancePerNm: number; // Base maintenance cost
}

export interface CompetitionInfo {
    airline: string;
    type: string;
    departureTime: number;
}

export type AiSchedules = Record<string, FlightLeg[][]>;

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface GameEvent {
    type: 'fault' | 'strike' | 'weather' | 'concert' | 'sports' | 'conference' | 'fuel_price_change';
    target: string; // aircraft ID, airport code, or 'GLOBAL'
    value: number; // e.g., delay hours, passenger reduction/increase %, or fuel multiplier
    description: string;
    day: number; // Day of the 7-day cycle (1-7)
    probability?: number; // For uncertain events like weather forecast
}

export interface StaffMember {
    id: string;
    level: number;
    flightsCompleted: number;
    assignedTo: string | null; // aircraftId or airportCode
}

export interface StaffState {
    pilots: StaffMember[];
    cabinCrews: StaffMember[];
    dispatchers: StaffMember[];
    engineers: number; // Stays as a simple count for now
}


export interface MarketingCampaign {
    routeKey: string; // "LHR-CDG"
    expiryTime: number; // game time
}

export interface RouteStats {
    satisfaction: number; // 0-100
    flights: number;
}

export interface UnservedOpportunity {
    routeKey: string;
    passengersMissed: number;
    potentialRevenueIncrease: number;
    aircraftType: string;
}

export interface WeeklyReportData {
    topProfitableRoutes: { routeKey: string; profit: number }[];
    dailyPnl: { day: number; pnl: number }[];
    unservedOpportunities: UnservedOpportunity[];
    routeSatisfaction: { routeKey: string; satisfaction: number }[];
}