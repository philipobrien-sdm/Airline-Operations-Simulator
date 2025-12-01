

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MapComponent from './components/Map';
import InfoPanel from './components/InfoPanel';
import RightPanel from './components/RightPanel';
import WelcomeModal from './components/WelcomeModal';
import FleetManagementModal from './components/FleetManagementModal';
import ApiKeyModal from './components/ApiKeyModal';
import RouteAnalysisModal from './components/RouteAnalysisModal';
import CompetitionModal from './components/CompetitionModal';
import StaffModal from './components/StaffModal';
import Ticker from './components/Ticker';
import AlertsModal from './components/AlertsModal';
import WeeklyReportModal from './components/WeeklyReportModal';
import TutorialOverlay, { TutorialStep } from './components/TutorialOverlay';

import { airportsWithPositions } from './data/airports';
import { PREDEFINED_RADARS } from './data/radars';
import { generateRoutes } from './data/routes';
import { AIRCRAFT_TYPES } from './data/aircraft_types';
import { AIRLINE_CODES } from './data/airlines';
import { calculateDistanceNM, lerpPoint, calculateBearing } from './utils';

import type { Airport, Aircraft, Radar, GameSpeed, RouteDemand, FlightLeg, CompletedFlightLeg, AircraftType, CompetitionInfo, AiSchedules, GameDifficulty, StaffState, GameEvent, MarketingCampaign, CostBreakdown, RouteStats, WeeklyReportData, UnservedOpportunity, StaffMember, AircraftDisplayData } from './types';

const INITIAL_CASH = 20000000;
const BIG_START_CASH = 80000000;
const RADAR_RANGE_NM = 250;
const AIRCRAFT_ID_COUNTER = { ai: 0, player: 0 };
const MAX_AI_AIRCRAFT = 80; // 20 airlines * 4 aircraft
const MAX_SCHEDULE_HOURS = 26; // up to 2AM next day
const SCHEDULE_START_HOUR = 6;
const REVENUE_PER_PASSENGER_MILE = 0.22;
const STAFF_COST = { pilots: 12000, engineers: 10000, dispatchers: 8000, cabinCrews: 6000 };
const MARKETING_CAMPAIGN_COST = 50000;
const MARKETING_CAMPAIGN_BOOST = 1.25; // 25% boost
const UPGRADE_COST = {
    IFE: 250000,
    WIFI: 150000,
    MEAL: 50000,
};
const MAINTENANCE_MULTIPLIER = 1.2;
const MEAL_COST_PER_PAX = 15;

// Define reusable types for staff management
type AssignableStaffType = 'pilots' | 'dispatchers' | 'cabinCrews';
type HireableStaff = 'pilots' | 'engineers' | 'dispatchers' | 'cabinCrews';


const App: React.FC = () => {
  // Game State
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [gameTime, setGameTime] = useState(6); // Start at 6:00 AM
  const [gameSpeed, setGameSpeed] = useState<GameSpeed>(5);
  const [playerCash, setPlayerCash] = useState(INITIAL_CASH);
  const [cashAtStartOfWeek, setCashAtStartOfWeek] = useState(INITIAL_CASH);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [staff, setStaff] = useState<StaffState>({ pilots: [], cabinCrews: [], dispatchers: [], engineers: 0 });
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<GameEvent[]>([]);
  const [fuelPriceMultiplier, setFuelPriceMultiplier] = useState(1.0);
  const [schedulesLocked, setSchedulesLocked] = useState(false);
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>([]);
  const [routeStats, setRouteStats] = useState<Record<string, RouteStats>>({});
  const [aiRouteSatisfaction, setAiRouteSatisfaction] = useState<Record<string, Record<string, number>>>({});
  const [dailyPnl, setDailyPnl] = useState<Record<number, number>>({});
  const [unservedOpportunities, setUnservedOpportunities] = useState<UnservedOpportunity[]>([]);

  // Simulation Entities
  const [airports, setAirports] = useState<Airport[]>([]);
  const [radars, setRadars] = useState<Radar[]>([]);
  const [routes] = useState<RouteDemand[]>(() => generateRoutes(airportsWithPositions.map(ap => ({...ap, isCovered: false, hubStatus: undefined}))));
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [aircraftDisplayData, setAircraftDisplayData] = useState<AircraftDisplayData[]>([]); // New state for safe rendering
  const [aiSchedules, setAiSchedules] = useState<AiSchedules>({});
  
  // UI State
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [selectedRadarId, setSelectedRadarId] = useState<string | null>(null);
  const [showFleetManagement, setShowFleetManagement] = useState(false);
  const [apiKeyErrorReason, setApiKeyErrorReason] = useState<'auth_failure' | 'missing_key' | null>(null);
  const [analyzingLegData, setAnalyzingLegData] = useState<any | null>(null);
  const [showCompetition, setShowCompetition] = useState(false);
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState(false);
  const [weeklyReportData, setWeeklyReportData] = useState<WeeklyReportData | null>(null);
  const [isTutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [isHelpModeActive, setHelpModeActive] = useState(false);
  
  // Refs for game loop
  const lastTimeRef = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const airportsRef = useRef<Record<string, Airport>>({});
  const dayRef = useRef<number>(1);
  const dayOfCycleRef = useRef(1);
  const hasStartedGame = useRef(false);

  // Initialization
  useEffect(() => {
    if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      setApiKeyErrorReason('missing_key');
    }

    const initialRadars: Radar[] = PREDEFINED_RADARS.map((r, i) => ({
      ...r,
      id: `radar-${i}`,
      range: RADAR_RANGE_NM,
    }));
    setRadars(initialRadars);

    const activeRadars = initialRadars.filter(r => r.isActive);
    
    const initialAirports = airportsWithPositions.map(ap => {
      const isCovered = activeRadars.some(r => calculateDistanceNM(ap.position, r.position) <= r.range);
      return { ...ap, isCovered, hubStatus: undefined };
    });
    setAirports(initialAirports);
    airportsRef.current = initialAirports.reduce((acc, ap) => ({...acc, [ap.code]: ap }), {});

  }, []);

  // Decoupling Effect: Create safe display data from simulation data
  useEffect(() => {
    const sanitizedData = aircrafts.filter(ac => 
        // This is the sanitization step. It ensures no malformed data reaches the rendering pipeline.
        ac && ac.id && ac.position && ac.type && AIRCRAFT_TYPES[ac.type] && ac.status
    ).map((ac): AircraftDisplayData => ({
        id: ac.id,
        name: ac.name,
        type: ac.type,
        airline: ac.airline,
        origin: ac.origin,
        destination: ac.destination,
        position: ac.position,
        bearing: ac.bearing,
        status: ac.status,
    }));
    setAircraftDisplayData(sanitizedData);
  }, [aircrafts]);
  
  const generateInitialAiState = useCallback((isBigStart: boolean) => {
    if (routes.length === 0 || Object.keys(aiSchedules).length > 0) return;

    const generatedSchedules: AiSchedules = {};
    const generatedSatisfaction: Record<string, Record<string, number>> = {};
    const aircraftPerAirline = isBigStart ? 10 : 4;
    const flightsPerAircraft = 8;
    
    const availableHubs = [...airportsWithPositions]; // AI can now be based anywhere

    AIRLINE_CODES.forEach(airlineCode => {
        generatedSchedules[airlineCode] = [];
        generatedSatisfaction[airlineCode] = {};

        // Assign a hub
        const hubIndex = Math.floor(Math.random() * availableHubs.length);
        const homeBase = availableHubs[hubIndex];
        availableHubs.splice(hubIndex, 1); // Remove to avoid duplicate hubs

        setAirports(prev => prev.map(ap => ap.code === homeBase.code ? {...ap, aiHubAirline: airlineCode} : ap));

        // Initialize satisfaction for all routes for this AI
        routes.forEach(route => {
            const key = `${route.origin}-${route.destination}`;
            const isHubRoute = route.origin === homeBase.code || route.destination === homeBase.code;
            generatedSatisfaction[airlineCode][key] = 40 + (Math.random() * 20) + (isHubRoute ? 10 : 0); // 40-60 base, +10 for hub routes
        });

        for (let i = 0; i < aircraftPerAirline; i++) {
            const aircraftSchedule: FlightLeg[] = [];
            let currentTime = SCHEDULE_START_HOUR + (Math.random() * 2); // Stagger starts
            let currentAirportCode = homeBase.code;
            
            for (let j = 0; j < flightsPerAircraft; j++) {
                const possibleRoutes = routes.filter(r => r.origin === currentAirportCode);
                if (possibleRoutes.length === 0) break;
                
                const route = possibleRoutes[Math.floor(Math.random() * possibleRoutes.length)];
                const originAp = airportsWithPositions.find(ap => ap.code === route.origin);
                const destAp = airportsWithPositions.find(ap => ap.code === route.destination);
                
                if(!originAp || !destAp) continue;

                const distance = calculateDistanceNM(originAp.position, destAp.position);
                const durationHours = distance / AIRCRAFT_TYPES['A320'].speed;
                
                const departureTime = currentTime;
                const arrivalTime = departureTime + durationHours;

                if (arrivalTime > MAX_SCHEDULE_HOURS) break;

                aircraftSchedule.push({
                    origin: route.origin,
                    destination: route.destination,
                    departureTime,
                    arrivalTime,
                    durationHours,
                    fareMultiplier: 1.0,
                });

                const turnaroundMinutes = route.durationHours > 2 ? 50 : 30;
                currentTime = arrivalTime + (turnaroundMinutes / 60);
                currentAirportCode = route.destination;
            }
            generatedSchedules[airlineCode].push(aircraftSchedule);
        }
    });

    setAiSchedules(generatedSchedules);
    setAiRouteSatisfaction(generatedSatisfaction);
  }, [routes, aiSchedules]);


  // Set up global error handler for Google Maps API key failure
  useEffect(() => {
    (window as any).handleGoogleMapsAuthFailure = () => {
        setApiKeyErrorReason('auth_failure');
    };
    return () => {
        delete (window as any).handleGoogleMapsAuthFailure;
    }
  }, []);

  // Update Hub Statuses
  useEffect(() => {
    const playerAircraft = aircrafts.filter(ac => ac.airline === 'PLAYER');
    const baseCounts: Record<string, number> = {};
    playerAircraft.forEach(ac => {
        baseCounts[ac.homeBase] = (baseCounts[ac.homeBase] || 0) + 1;
    });

    setAirports(prevAirports => {
        const newAirports = prevAirports.map(ap => {
            const count = baseCounts[ap.code] || 0;
            let hubStatus: 'small' | 'large' | undefined = undefined;
            if (count >= 5) hubStatus = 'large';
            else if (count >= 2) hubStatus = 'small';
            
            return { ...ap, hubStatus };
        });
        airportsRef.current = newAirports.reduce((acc, ap) => ({...acc, [ap.code]: ap }), {});
        return newAirports;
    });
  }, [aircrafts]);
  
  // FIX: Moved getAirportByCode before its usage in other hooks to fix declaration order issues.
  const getAirportByCode = useCallback((code: string) => airportsRef.current[code], []);

  const getPassengerPools = useCallback((aircraftTypeForSizing: AircraftType, day?: number) => {
    const pools = new Map<string, { morning: number, afternoon: number, evening: number }>();
    const activeDay = day || dayOfCycleRef.current;
    
    routes.forEach(route => {
        const key = `${route.origin}-${route.destination}`;
        const originHub = getAirportByCode(route.origin)?.hubStatus;
        const destHub = getAirportByCode(route.destination)?.hubStatus;
        let demandBonus = 0;
        if (originHub === 'large' || destHub === 'large') demandBonus = 0.25;
        else if (originHub === 'small' || destHub === 'small') demandBonus = 0.10;

        const positiveEvent = weeklyForecast.find(e => ['concert', 'sports', 'conference'].includes(e.type) && (e.target === route.origin || e.target === route.destination) && e.day === activeDay);
        
        const activeCampaign = marketingCampaigns.find(c => c.routeKey === key);
        const marketingMultiplier = activeCampaign ? MARKETING_CAMPAIGN_BOOST : 1.0;
        
        const eventMultiplier = (positiveEvent ? positiveEvent.value : 1.0) * marketingMultiplier;

        pools.set(key, {
            morning: Math.floor(aircraftTypeForSizing.capacity * route.demand.morning * (1 + demandBonus) * eventMultiplier),
            afternoon: Math.floor(aircraftTypeForSizing.capacity * route.demand.afternoon * (1 + demandBonus) * eventMultiplier),
            evening: Math.floor(aircraftTypeForSizing.capacity * route.demand.evening * (1 + demandBonus) * eventMultiplier)
        });
    });
    return pools;
  }, [routes, getAirportByCode, weeklyForecast, marketingCampaigns]);

  const generateWeeklyForecast = useCallback(() => {
        const forecast: GameEvent[] = [];
        const difficultyMultiplier = difficulty === 'easy' ? 0.9 : difficulty === 'hard' ? 1.1 : 1.0;

        for (let day = 1; day <= 7; day++) {
            // Positive Events
            const eventAirport = airports[Math.floor(Math.random() * airports.length)];
            if (Math.random() < 0.15) { // 15% chance for a positive event per day
                const eventType = ['concert', 'sports', 'conference'][Math.floor(Math.random() * 3)] as 'concert' | 'sports' | 'conference';
                const bonus = 1 + (Math.random() * 0.5 + 0.5); // 50-100% passenger bonus
                forecast.push({ type: eventType, target: eventAirport.code, value: bonus, description: `EVENT (Day ${day}): A major ${eventType} at ${eventAirport.code} is boosting travel demand!`, day });
            }
            
            // Weather Forecast
            airports.forEach(ap => {
                 if (Math.random() < 0.1 * difficultyMultiplier) { // 10% chance for a weather warning
                    const probability = Math.random() * 0.5 + 0.3; // 30-80% chance of happening
                    const delay = (Math.random() * 1.5 + 0.5);
                    forecast.push({ type: 'weather', target: ap.code, value: delay, probability, description: `WEATHER WARNING (Day ${day}): Bad weather forecast for ${ap.code}.`, day });
                 }
            });
        }
        setWeeklyForecast(forecast);
  }, [airports, difficulty]);

    const generateWeeklyReport = useCallback(() => {
        // 1. Top Profitable Routes
        const profitsByRoute: Record<string, number> = {};
        aircrafts.filter(ac => ac.airline === 'PLAYER').forEach(ac => {
            (ac.history || []).forEach(leg => {
                const key = `${leg.origin}-${leg.destination}`;
                profitsByRoute[key] = (profitsByRoute[key] || 0) + leg.profit;
            });
        });
        const topProfitableRoutes = Object.entries(profitsByRoute)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([routeKey, profit]) => ({ routeKey, profit }));

        // 2. Daily PNL
        const pnlData = Object.entries(dailyPnl).map(([day, pnl]) => ({ day: parseInt(day), pnl }));

        // 3. Unserved Opportunities (aggregated)
        const aggregatedOpportunities: Record<string, { passengersMissed: number, potentialRevenueIncrease: number, count: number, aircraftType: string }> = {};
        unservedOpportunities.forEach(opp => {
            if (!aggregatedOpportunities[opp.routeKey]) {
                aggregatedOpportunities[opp.routeKey] = { passengersMissed: 0, potentialRevenueIncrease: 0, count: 0, aircraftType: opp.aircraftType };
            }
            aggregatedOpportunities[opp.routeKey].passengersMissed += opp.passengersMissed;
            aggregatedOpportunities[opp.routeKey].potentialRevenueIncrease += opp.potentialRevenueIncrease;
            aggregatedOpportunities[opp.routeKey].count++;
        });
        const finalOpportunities: UnservedOpportunity[] = Object.entries(aggregatedOpportunities).map(([routeKey, data]) => ({
            routeKey, ...data
        }));


        // 4. Route Satisfaction
        const routeSatisfaction = Object.entries(routeStats)
            // FIX: Explicitly typed the `stats` variable from Object.entries to resolve 'unknown' type error.
            .map(([routeKey, stats]: [string, RouteStats]) => ({ routeKey, satisfaction: stats.satisfaction }))
            .sort((a,b) => b.satisfaction - a.satisfaction);

        setWeeklyReportData({ topProfitableRoutes, dailyPnl: pnlData, unservedOpportunities: finalOpportunities, routeSatisfaction });
    }, [aircrafts, dailyPnl, unservedOpportunities, routeStats]);

    // Handle weekly schedule reset
    useEffect(() => {
        const dayInCycle = (Math.floor(gameTime / 24)) % 7 + 1;
        if (dayInCycle !== dayOfCycleRef.current) {
            if (dayInCycle === 1) {
                // New week, planning phase starts
                setIsPaused(true); // Pause the game
                generateWeeklyReport(); // Generate the report data
                setShowWeeklyReportModal(true); // Show the report

                setSchedulesLocked(false);
                // Schedules now persist week-over-week, so we no longer clear them here.
                generateWeeklyForecast();
                setCashAtStartOfWeek(playerCash);
                setDailyPnl({});
                setUnservedOpportunities([]);
            }
            dayOfCycleRef.current = dayInCycle;
        }
    }, [gameTime, generateWeeklyForecast, playerCash, generateWeeklyReport]);

  // Functions to update coverage
  const updateAirportCoverage = useCallback((currentRadars: Radar[]) => {
    setAirports(prevAirports => {
        const newAirports = prevAirports.map(ap => {
            const isCovered = currentRadars.filter(r => r.isActive).some(r => calculateDistanceNM(ap.position, r.position) <= r.range);
            return { ...ap, isCovered };
        });
        airportsRef.current = newAirports.reduce((acc, ap) => ({...acc, [ap.code]: ap }), {});
        return newAirports;
    });
  }, []);

    // Daily Event Generation & Cost Deduction
    const handleNewDay = useCallback((currentAircrafts: Aircraft[]) => {
        const dayInCycle = dayOfCycleRef.current;
        // 1. Deduct Staff Costs
        const totalStaffCost = (staff.pilots.length * STAFF_COST.pilots) +
                               (staff.engineers * STAFF_COST.engineers) +
                               (staff.cabinCrews.length * STAFF_COST.cabinCrews) +
                               (staff.dispatchers.length * STAFF_COST.dispatchers);
        setPlayerCash(c => c - totalStaffCost);
        setDailyPnl(pnl => ({ ...pnl, [dayInCycle]: (pnl[dayInCycle] || 0) - totalStaffCost }));

        // 2. Generate Events
        const newDailyEvents: GameEvent[] = [];
        const difficultyMultiplier = difficulty === 'easy' ? 0.9 : difficulty === 'hard' ? 1.1 : 1.0;
        
        // Process today's forecast
        weeklyForecast.forEach(event => {
            if (event.day === dayInCycle) {
                if (event.type === 'weather') {
                    if (Math.random() < (event.probability || 1.0)) {
                         const dispatcher = staff.dispatchers.find(d => d.assignedTo === event.target);
                         let dispatcherBonus = 1.0;
                         if (dispatcher) {
                             const baseReduction = 0.4; // 40%
                             const levelMultiplier = 1 + (dispatcher.level - 1) * 0.2;
                             dispatcherBonus = 1 - (baseReduction * levelMultiplier);
                         }
                         newDailyEvents.push({ ...event, value: event.value * dispatcherBonus, description: `WEATHER: Bad weather at ${event.target} is causing departure delays.` });
                    }
                } else {
                    newDailyEvents.push(event);
                }
            }
        });
        
        // Unforeseen Events
        // Fuel Price Event
        let newFuelMultiplier = 1.0;
        if (Math.random() < 0.25 * difficultyMultiplier) { // 25% chance
            const isIncrease = Math.random() > 0.5;
            newFuelMultiplier = isIncrease ? 1.20 : 0.80;
            newDailyEvents.push({
                type: 'fuel_price_change', target: 'GLOBAL', value: newFuelMultiplier, day: dayInCycle,
                description: `FUEL PRICE: OPEC has ${isIncrease ? 'cut' : 'increased'} output. Fuel prices are ${isIncrease ? 'up' : 'down'} 20% today.`
            });
        }
        setFuelPriceMultiplier(newFuelMultiplier);

        // Faults
        const engineerBonus = 1 - (staff.engineers * 0.05); // Each team reduces chance by 5%
        currentAircrafts.filter(ac => ac.airline === 'PLAYER').forEach(ac => {
            try {
                const pilot = staff.pilots.find(p => p.assignedTo === ac.id);
                let pilotBonus = 1.0;
                if (pilot) {
                    const baseReduction = 0.5; // 50%
                    const levelMultiplier = 1 + (pilot.level - 1) * 0.2;
                    pilotBonus = 1 - (baseReduction * levelMultiplier);
                }
                const faultChance = 0.05 * difficultyMultiplier * engineerBonus * pilotBonus;
                if (Math.random() < faultChance) {
                    newDailyEvents.push({ type: 'fault', target: ac.id, value: 0, day: dayInCycle, description: `AIRCRAFT FAULT: ${ac.name || ac.id} is grounded for maintenance.`});
                }
            } catch (error) {
                console.error(`Error processing fault check for aircraft ${ac?.id}:`, error);
            }
        });

        // Strikes
        airports.forEach(ap => {
            try {
                const dispatcher = staff.dispatchers.find(d => d.assignedTo === ap.code);
                let dispatcherBonus = 1.0;
                if (dispatcher) {
                    const baseReduction = 0.5; // 50%
                    const levelMultiplier = 1 + (dispatcher.level - 1) * 0.2;
                    dispatcherBonus = 1 - (baseReduction * levelMultiplier);
                }
                if (Math.random() < 0.03 * difficultyMultiplier * dispatcherBonus) {
                    const impact = (Math.random() * 0.4 + 0.3);
                    newDailyEvents.push({ type: 'strike', target: ap.code, value: impact, day: dayInCycle, description: `STRIKE: Industrial action at ${ap.code} is reducing passenger numbers.`});
                }
            } catch (error) {
                console.error(`Error processing strike check for airport ${ap?.code}:`, error);
            }
        });
        
        setGameEvents(newDailyEvents);

    }, [staff, difficulty, airports, weeklyForecast]);

  // Game Loop
  const gameLoop = useCallback((timestamp: number) => {
    try {
        if (lastTimeRef.current === null) {
          lastTimeRef.current = timestamp;
          animationFrameId.current = requestAnimationFrame(gameLoop);
          return;
        }

        const deltaTime = (timestamp - lastTimeRef.current) / 1000;
        lastTimeRef.current = timestamp;

        // FIX: Sanitize the aircraft list at the very beginning of the loop.
        // This prevents any corrupted data from causing a crash in subsequent logic.
        const invalidEntries = aircrafts.filter(ac => !ac);
        if (invalidEntries.length > 0) {
            console.warn("Defensive filter: Found and removed the following invalid aircraft entries from simulation state:", invalidEntries);
        }
        const cleanAircrafts = aircrafts.filter(Boolean);
        
        let aircraftsForTick = cleanAircrafts;
        const timePassedHours = (deltaTime * gameSpeed) / 3600;
        const newGameTime = gameTime + timePassedHours;
        const currentDay = Math.floor(newGameTime / 24) + 1;

        if (currentDay > dayRef.current) {
            dayRef.current = currentDay;
            handleNewDay(cleanAircrafts); // Generate events using the clean list
            // Create a new list for this tick's processing with delays reset
            aircraftsForTick = cleanAircrafts.map(ac => {
                if (ac.schedule) {
                    const newSchedule = ac.schedule.map(leg => ({...leg, delayHours: 0}));
                    return {...ac, schedule: newSchedule};
                }
                return ac;
            });
        }
        setGameTime(newGameTime);
        setMarketingCampaigns(campaigns => campaigns.filter(c => c.expiryTime > newGameTime));

        let staffToUpdate = { pilots: [...staff.pilots], cabinCrews: [...staff.cabinCrews], dispatchers: [...staff.dispatchers], engineers: staff.engineers };
        let profitThisTick = 0;
        let routeStatsUpdates: Record<string, { satisfactionChange: number; flights: number }> = {};
        let newUnservedOpportunities: UnservedOpportunity[] = [];
        
        const timeOfDay = newGameTime % 24;
        const prevTimeOfDay = gameTime % 24;
        const shouldTriggerReposition = prevTimeOfDay < 2 && timeOfDay >= 2;

        const updatedAircrafts = aircraftsForTick.map(ac => {
            // Un-ground aircraft if maintenance is complete
            if (ac.status === 'GROUNDED' && ac.groundedUntil && newGameTime > ac.groundedUntil) {
                return { ...ac, status: 'LANDED' as const, groundedUntil: undefined };
            }
            
            // Ground aircraft if a new fault event occurs
            const faultEvent = gameEvents.find(d => d.type === 'fault' && d.target === ac.id);
            if (faultEvent && ac.status === 'LANDED') {
                return { ...ac, status: 'GROUNDED' as const, groundedUntil: newGameTime + 24 };
            }
            
            // Handle overnight repositioning
            if (shouldTriggerReposition && ac.airline === 'PLAYER' && ac.status === 'LANDED' && ac.destination !== ac.homeBase) {
                 const homeBase = getAirportByCode(ac.homeBase);
                 const currentPos = getAirportByCode(ac.destination)?.position;
                 if (homeBase && currentPos) {
                     return {
                        ...ac,
                        status: 'REPOSITIONING' as const,
                        origin: ac.destination,
                        destination: ac.homeBase,
                        progress: 0,
                        position: currentPos,
                        bearing: calculateBearing(currentPos, homeBase.position) || ac.bearing,
                     };
                 }
            }

            if (ac.airline === 'PLAYER' && ac.status === 'LANDED' && ac.schedule && ac.schedule.length > 0) {
                const activeLegIndex = ac.schedule.findIndex(leg => timeOfDay >= (leg.departureTime + (leg.delayHours || 0)) && timeOfDay < (leg.arrivalTime + (leg.delayHours || 0)));
                const activeLeg = activeLegIndex !== -1 ? ac.schedule[activeLegIndex] : null;
                
                if (activeLeg && ac.destination === activeLeg.origin) {
                    const pilot = staffToUpdate.pilots.find(p => p.assignedTo === ac.id);
                    let weatherDelayMultiplier = 1.0;
                    if(pilot) {
                        const baseReduction = 0.4; // 40%
                        const levelMultiplier = 1 + (pilot.level - 1) * 0.2;
                        weatherDelayMultiplier = 1 - (baseReduction * levelMultiplier);
                    }

                    const weatherEvent = gameEvents.find(d => d.type === 'weather' && d.target === activeLeg.origin);
                    if (weatherEvent && !activeLeg.delayHours) {
                        let newSchedule = [...ac.schedule];
                        for (let i = activeLegIndex; i < newSchedule.length; i++) {
                            if (i === activeLegIndex) {
                                newSchedule[i].delayHours = (newSchedule[i].delayHours || 0) + (weatherEvent.value * weatherDelayMultiplier);
                            } else {
                                const prevLeg = newSchedule[i-1];
                                const turnaround = (prevLeg.durationHours > 2 ? 50 : 30) / 60;
                                const newDeparture = prevLeg.arrivalTime + (prevLeg.delayHours || 0) + turnaround;
                                const originalDeparture = newSchedule[i].departureTime;
                                newSchedule[i].delayHours = Math.max(newSchedule[i].delayHours || 0, newDeparture - originalDeparture);
                            }
                            if ((newSchedule[i].arrivalTime + (newSchedule[i].delayHours || 0)) > MAX_SCHEDULE_HOURS) {
                                newSchedule = newSchedule.slice(0, i);
                                break;
                            }
                        }
                        return { ...ac, schedule: newSchedule };
                    }

                    const originAirport = getAirportByCode(activeLeg.origin);
                    const destAirport = getAirportByCode(activeLeg.destination);

                    if (originAirport && destAirport) {
                        // Dispatcher XP on takeoff
                        const dispatcher = staffToUpdate.dispatchers.find(d => d.assignedTo === activeLeg.origin);
                        if (dispatcher) {
                            const newFlights = dispatcher.flightsCompleted + 1;
                            let newLevel = dispatcher.level;
                            if (newLevel < 5 && (newFlights % 250 === 0 || Math.random() < 1/500)) {
                                newLevel++;
                            }
                            staffToUpdate.dispatchers = staffToUpdate.dispatchers.map(d => d.id === dispatcher.id ? {...d, flightsCompleted: newFlights, level: newLevel} : d);
                        }
                        
                        const departureTime = activeLeg.departureTime + (activeLeg.delayHours || 0);
                        const timeIntoFlight = timeOfDay - departureTime;
                        const progress = Math.min(1, timeIntoFlight / activeLeg.durationHours);
                        const newPosition = lerpPoint(originAirport.position, destAirport.position, progress);
                        
                        return {
                            ...ac, status: 'IN_FLIGHT' as const, origin: activeLeg.origin, destination: activeLeg.destination, progress: progress, position: newPosition, bearing: calculateBearing(ac.position, newPosition) || ac.bearing,
                        };
                    }
                }
            }
            return ac;
        });

        const aircraftWithUpdatedPositions = updatedAircrafts.map(ac => {
            // This entire block is now wrapped to prevent any single aircraft update from crashing the game.
            try {
                if (ac.status === 'IN_FLIGHT' || ac.status === 'REPOSITIONING') {
                    const originAirport = getAirportByCode(ac.origin);
                    const destAirport = getAirportByCode(ac.destination);
                    if (!originAirport || !destAirport) return ac;

                    const routeDistance = calculateDistanceNM(originAirport.position, destAirport.position);
                    const aircraftType = AIRCRAFT_TYPES[ac.type];
                    if (!aircraftType) return ac; 
                    const speedNMPerHour = aircraftType.speed;
                    
                    const progressIncrement = (speedNMPerHour * timePassedHours) / routeDistance;
                    let newProgress = ac.progress + progressIncrement;

                    if (newProgress >= 1) {
                        newProgress = 1;
                        let updatedHistory = ac.history || [];

                        if (ac.airline === 'PLAYER') {
                             if (ac.status === 'REPOSITIONING') {
                                const distance = calculateDistanceNM(originAirport.position, destAirport.position);
                                const hubCostBonus = originAirport?.hubStatus === 'large' ? 0.85 : originAirport?.hubStatus === 'small' ? 0.95 : 1;
                                const fuelCost = distance * aircraftType.fuelPerNm * hubCostBonus * fuelPriceMultiplier;
                                const maintenanceCost = distance * aircraftType.baseMaintenancePerNm * MAINTENANCE_MULTIPLIER;
                                const totalCost = fuelCost + maintenanceCost;
                                profitThisTick -= totalCost;

                                const costBreakdown: CostBreakdown = { fuel: Math.round(fuelCost), maintenance: Math.round(maintenanceCost), staff: 0, mealService: 0, total: Math.round(totalCost) };
                                const newHistoryEntry: CompletedFlightLeg = {
                                    origin: ac.origin, destination: ac.destination, miles: distance, passengers: 0, revenue: 0, cost: totalCost, profit: -totalCost, timestamp: newGameTime, costBreakdown
                                };
                                updatedHistory = [...updatedHistory, newHistoryEntry];
                            } else if (ac.schedule) {
                                 const legInSchedule = ac.schedule.find(l => l.origin === ac.origin && l.destination === ac.destination && Math.abs(timeOfDay - (l.arrivalTime + (l.delayHours || 0))) < timePassedHours * 2);
                                 if (legInSchedule) {
                                    const { passengers, revenue, cost, profit, costBreakdown, satisfactionChange, unservedOpportunity } = calculateProfitForLeg(legInSchedule, ac, aircraftsForTick);
                                    profitThisTick += profit;

                                    const routeKey = `${ac.origin}-${ac.destination}`;
                                    const currentUpdate = routeStatsUpdates[routeKey] || { satisfactionChange: 0, flights: 0 };
                                    routeStatsUpdates[routeKey] = {
                                        satisfactionChange: currentUpdate.satisfactionChange + satisfactionChange,
                                        flights: currentUpdate.flights + 1,
                                    };

                                    if (unservedOpportunity) {
                                        newUnservedOpportunities.push(unservedOpportunity);
                                    }
                                    
                                    const newHistoryEntry: CompletedFlightLeg = {
                                        origin: ac.origin, destination: ac.destination, miles: routeDistance, passengers, revenue, cost, profit, timestamp: newGameTime, costBreakdown
                                    };
                                    updatedHistory = [...updatedHistory, newHistoryEntry];
                                    
                                    const staffLevelUp = (member: StaffMember): StaffMember => {
                                        const newFlights = member.flightsCompleted + 1;
                                        let newLevel = member.level;
                                        if (newLevel < 5 && (newFlights % 250 === 0 || Math.random() < 1/500)) {
                                            newLevel++;
                                        }
                                        return { ...member, flightsCompleted: newFlights, level: newLevel };
                                    };
                                    const pilot = staffToUpdate.pilots.find(p => p.assignedTo === ac.id);
                                    if (pilot) staffToUpdate.pilots = staffToUpdate.pilots.map(p => p.id === pilot.id ? staffLevelUp(p) : p);
                                    const cabinCrew = staffToUpdate.cabinCrews.find(cc => cc.assignedTo === ac.id);
                                    if (cabinCrew) staffToUpdate.cabinCrews = staffToUpdate.cabinCrews.map(cc => cc.id === cabinCrew.id ? staffLevelUp(cc) : p);
                                 }
                            }
                        }
                        
                        return { ...ac, progress: 1, status: 'LANDED' as const, position: destAirport.position, destination: destAirport.code, history: updatedHistory };
                    }

                    const newPosition = lerpPoint(originAirport.position, destAirport.position, newProgress);
                    const bearing = calculateBearing(ac.position, newPosition);

                    return { ...ac, progress: newProgress, position: newPosition, bearing: bearing === 0 ? ac.bearing : bearing };
                }
                return ac;
            } catch (error) {
                console.error("--- CUSTOM ERROR LOG: In-Flight/Landing Update Failure ---");
                console.error(`A recoverable error occurred while updating aircraft ${ac.id}. The aircraft's state will not be updated this frame. The simulation will continue.`);
                console.error(`Aircraft State at Error:`, JSON.parse(JSON.stringify(ac)));
                console.error(`Full Error Object:`, error);
                console.error("--- END CUSTOM ERROR LOG ---");
                return ac; // Return the original aircraft object to prevent state corruption
            }
        });

        if (profitThisTick !== 0) {
            setPlayerCash(c => c + profitThisTick);
            setDailyPnl(pnl => ({ ...pnl, [dayOfCycleRef.current]: (pnl[dayOfCycleRef.current] || 0) + profitThisTick }));
        }

        if (Object.keys(routeStatsUpdates).length > 0) {
            setRouteStats(prevStats => {
                const newStats = { ...prevStats };
                for (const routeKey in routeStatsUpdates) {
                    const update = routeStatsUpdates[routeKey];
                    if (!update) continue;
                    const current = newStats[routeKey] || { satisfaction: 50, flights: 0 };
                    // The change is a delta, so we add it to the existing satisfaction
                    const newSatisfaction = Math.max(0, Math.min(100, current.satisfaction + update.satisfactionChange));
                    newStats[routeKey] = {
                        satisfaction: newSatisfaction,
                        flights: current.flights + update.flights
                    };
                }
                return newStats;
            });
        }
        
        if (newUnservedOpportunities.length > 0) {
            setUnservedOpportunities(prev => [...prev, ...newUnservedOpportunities]);
        }
        
        setStaff(staffToUpdate);

        let finalAircraftList = aircraftWithUpdatedPositions.filter(ac => ac.airline === 'PLAYER' || ac.status !== 'LANDED');

        const aiAircraftCount = finalAircraftList.filter(ac => ac.airline !== 'PLAYER').length;
        if (aiAircraftCount < MAX_AI_AIRCRAFT && Math.random() < 0.1 * (gameSpeed / 5)) {
            const randomRoute = routes[Math.floor(Math.random() * routes.length)];
            const originAirport = getAirportByCode(randomRoute.origin);
            if (originAirport) {
                AIRCRAFT_ID_COUNTER.ai++;
                const airlineCode = AIRLINE_CODES[Math.floor(Math.random() * AIRLINE_CODES.length)];
                const flightNumber = Math.floor(Math.random() * 900) + 100;
                finalAircraftList.push({
                    id: `AI-${AIRCRAFT_ID_COUNTER.ai}`,
                    name: `${airlineCode}${flightNumber}`,
                    type: 'A320', 
                    airline: airlineCode, 
                    origin: randomRoute.origin, 
                    destination: randomRoute.destination, 
                    position: originAirport.position, 
                    bearing: 0, 
                    progress: 0, 
                    status: 'IN_FLIGHT', 
                    homeBase: randomRoute.origin
                });
            }
        }
      
        setAircrafts(finalAircraftList);

        animationFrameId.current = requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error("--- A CRITICAL SIMULATION ERROR OCCURRED ---");
        console.error("The game loop has been paused to prevent a crash.");
        console.error("Error details:", error);
        
        // Log the state at the time of the error for debugging
        console.log("Aircrafts state:", JSON.parse(JSON.stringify(aircrafts)));
        console.log("Game time:", gameTime);
        console.log("Staff state:", JSON.parse(JSON.stringify(staff)));

        setIsPaused(true); // Pause the game
        
        let errorMessage = 'An unexpected simulation error occurred. The game has been paused.';
        if (error instanceof Error) {
            errorMessage += ` Details: ${error.message}`;
        }
        setSimulationError(errorMessage); // Set the error for the banner
    }
  }, [gameSpeed, getAirportByCode, routes, gameTime, aiSchedules, gameEvents, handleNewDay, staff, aircrafts]);

  useEffect(() => {
    if (!isPaused && isStarted) {
      lastTimeRef.current = null;
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPaused, isStarted, gameLoop]);
  
  const calculateProfitForLeg = (legInSchedule: FlightLeg, ac: Aircraft, allAircraft: Aircraft[]): { 
    passengers: number, revenue: number, cost: number, profit: number, costBreakdown: CostBreakdown, satisfactionChange: number, unservedOpportunity: UnservedOpportunity | null
  } => {
    const defaultReturn = { passengers: 0, revenue: 0, cost: 0, profit: 0, costBreakdown: { fuel: 0, maintenance: 0, staff: 0, mealService: 0, total: 0 }, satisfactionChange: 0, unservedOpportunity: null };
    
    try {
        const routeKey = `${ac.origin}-${ac.destination}`;
        const route = routes.find(r => r.origin === ac.origin && r.destination === ac.destination);
        const aircraftType = AIRCRAFT_TYPES[ac.type];
        const originAirport = getAirportByCode(ac.origin);
        const destAirport = getAirportByCode(ac.destination);
        
        if (!route || !aircraftType || !originAirport || !destAirport) {
            console.warn(`[calculateProfitForLeg] Missing critical data for leg ${ac.origin}-${ac.destination}. Skipping profit calculation.`, { route, aircraftType, originAirport, destAirport });
            return defaultReturn;
        }

        // --- 1. Calculate Passenger Pool ---
        const strikeEvent = gameEvents.find(d => d.type === 'strike' && (d.target === ac.origin || d.target === ac.destination));
        const positiveEvent = gameEvents.find(d => ['concert', 'sports', 'conference'].includes(d.type) && (d.target === ac.origin || d.target === ac.destination));
        const activeCampaign = marketingCampaigns.find(c => c.routeKey === routeKey);
        const marketingMultiplier = activeCampaign ? MARKETING_CAMPAIGN_BOOST : 1.0;
        const eventMultiplier = (strikeEvent ? 1 - strikeEvent.value : 1.0) * (positiveEvent ? positiveEvent.value : 1.0) * marketingMultiplier;
        const hubDemandBonus = Math.max(
            originAirport?.hubStatus === 'large' || destAirport?.hubStatus === 'large' ? 0.25 : 0,
            originAirport?.hubStatus === 'small' || destAirport?.hubStatus === 'small' ? 0.10 : 0
        );
        const timeOfDayAtDeparture = legInSchedule.departureTime % 24;
        const initialDemand = (timeOfDayAtDeparture < 12) ? route.demand.morning : (timeOfDayAtDeparture < 18) ? route.demand.afternoon : route.demand.evening;
        const basePassengerPool = Math.floor(aircraftType.capacity * initialDemand * (1 + hubDemandBonus) * eventMultiplier);

        // --- 2. Tally Competition & Capacity ---
        const competingFlights: { id: string; airline: string; type: string; capacity: number }[] = [];
        (Object.entries(aiSchedules) as [string, FlightLeg[][]][]).forEach(([airline, schedulesByAc]) => {
            schedulesByAc.flat().forEach((leg, i) => {
                if (leg.origin === ac.origin && leg.destination === ac.destination && Math.abs(leg.departureTime - legInSchedule.departureTime) < 2) {
                    competingFlights.push({ id: `${airline}-AI-${i}`, airline, type: 'A320', capacity: AIRCRAFT_TYPES['A320'].capacity });
                }
            });
        });
        
        for (const playerAc of allAircraft) {
            // More robust check
            if (!playerAc || typeof playerAc !== 'object' || playerAc.airline !== 'PLAYER' || playerAc.id === ac.id) {
                continue;
            }

            if (!playerAc.type || typeof playerAc.type !== 'string' || !playerAc.schedule || !Array.isArray(playerAc.schedule)) {
                console.warn(`[calculateProfitForLeg] Skipping malformed player aircraft in competition check:`, playerAc);
                continue;
            }

            const competitorAircraftType = AIRCRAFT_TYPES[playerAc.type];
            if (!competitorAircraftType) {
                console.warn(`[calculateProfitForLeg] Skipping aircraft with unknown type '${playerAc.type}' in competition check.`);
                continue;
            }

            playerAc.schedule.forEach(leg => {
                if (leg.origin === ac.origin && leg.destination === ac.destination && Math.abs(leg.departureTime - legInSchedule.departureTime) < 2) {
                    competingFlights.push({ id: playerAc.id, airline: 'PLAYER', type: playerAc.type, capacity: competitorAircraftType.capacity });
                }
            });
        }
        
        // --- 3. Determine Passengers ---
        let passengers = 0;
        const totalCapacityOnRoute = aircraftType.capacity + competingFlights.reduce((sum, f) => sum + f.capacity, 0);

        if (totalCapacityOnRoute <= basePassengerPool) { // Not over-saturated
            const cabinCrew = staff.cabinCrews.find(cc => cc.assignedTo === ac.id);
            const baseBonus = 0.15; // 15%
            const levelMultiplier = cabinCrew ? 1 + (cabinCrew.level - 1) * 0.2 : 1;
            const cabinCrewBonus = cabinCrew ? 1 + (baseBonus * levelMultiplier) : 1.0;
            
            const fareEffect = 1 - ((legInSchedule.fareMultiplier - 1) * 1.5); 
            const potentialPassengers = Math.floor(basePassengerPool * fareEffect * cabinCrewBonus);
            passengers = Math.min(aircraftType.capacity, Math.max(0, potentialPassengers));
        } else { // Over-saturated, use choice model
            const fare = legInSchedule.fareMultiplier || 1.0;
            const playerSatisfaction = routeStats[routeKey]?.satisfaction || 50;
            const upgradeBonus = (ac.hasIFE ? 5 : 0) + (ac.hasWifi ? 5 : 0) + (ac.hasMealService ? 5 : 0);
            const priceBonus = (1.1 - fare) * 20; // Bonus for cheaper fares
            const playerScore = playerSatisfaction + upgradeBonus + priceBonus;
            
            let totalScore = playerScore;

            competingFlights.forEach(flight => {
                if (flight.airline !== 'PLAYER') {
                     totalScore += aiRouteSatisfaction[flight.airline]?.[routeKey] || 50;
                } else {
                     const competitorSatisfaction = routeStats[routeKey]?.satisfaction || 50; // Use player's own avg for other player AC
                     totalScore += competitorSatisfaction;
                }
            });
            
            const playerShare = (playerScore / totalScore) * basePassengerPool;
            passengers = Math.min(aircraftType.capacity, Math.round(playerShare));
        }

        // --- 4. Final Profit Calculation ---
        const distance = calculateDistanceNM(originAirport.position, destAirport.position);
        const aiHubPenalty = (destAirport?.aiHubAirline && destAirport.aiHubAirline !== ac.airline) ? 0.9 : 1.0;
        const revenue = passengers * distance * REVENUE_PER_PASSENGER_MILE * (legInSchedule.fareMultiplier || 1.0);
        
        // Detailed Cost
        const hubCostBonus = originAirport?.hubStatus === 'large' ? 0.85 : originAirport?.hubStatus === 'small' ? 0.95 : 1;
        const pilot = staff.pilots.find(p => p.assignedTo === ac.id);
        const cabinCrew = staff.cabinCrews.find(cc => cc.assignedTo === ac.id);

        const staffCost = (pilot ? STAFF_COST.pilots : 0) * legInSchedule.durationHours / 8 +
                          (cabinCrew ? STAFF_COST.cabinCrews : 0) * legInSchedule.durationHours / 8;
        const fuelCost = distance * aircraftType.fuelPerNm * hubCostBonus * fuelPriceMultiplier;
        const maintenanceCost = distance * aircraftType.baseMaintenancePerNm * MAINTENANCE_MULTIPLIER;
        const mealCost = ac.hasMealService ? passengers * MEAL_COST_PER_PAX : 0;
        const totalCost = fuelCost + maintenanceCost + staffCost + mealCost;
        const profit = (revenue - totalCost) * aiHubPenalty;
        
        const costBreakdown: CostBreakdown = { fuel: Math.round(fuelCost), maintenance: Math.round(maintenanceCost), staff: Math.round(staffCost), mealService: Math.round(mealCost), total: Math.round(totalCost) };
        
        // --- 5. Calculate State Changes to Return ---
        const difficultyMod = difficulty === 'easy' ? 1.2 : difficulty === 'hard' ? 0.8 : 1.0;
        const fareMod = (1.0 - (legInSchedule.fareMultiplier || 1.0)) * 5; // e.g. 0.8 fare gives +1 satisfaction
        const upgradeMod = (ac.hasIFE ? 0.5 : 0) + (ac.hasWifi ? 0.5 : 0) + (ac.hasMealService ? 0.5 : 0);
        const satisfactionChange = (1 + fareMod + upgradeMod) * difficultyMod;
        
        let unservedOpportunity: UnservedOpportunity | null = null;
        if (passengers >= aircraftType.capacity) {
            const passengersMissed = Math.max(0, basePassengerPool - totalCapacityOnRoute);
            if (passengersMissed > 0) {
                unservedOpportunity = {
                    routeKey,
                    passengersMissed,
                    potentialRevenueIncrease: passengersMissed * distance * REVENUE_PER_PASSENGER_MILE,
                    aircraftType: ac.type,
                };
            }
        }

        return { passengers, revenue, cost: totalCost, profit, costBreakdown, satisfactionChange, unservedOpportunity };
    } catch (error) {
        console.error("--- CUSTOM ERROR LOG: Profit Calculation Failure ---");
        console.error(`A recoverable error occurred during profit calculation for aircraft ${ac?.id} on leg ${legInSchedule?.origin}-${legInSchedule?.destination}. The transaction will be skipped.`);
        console.error(`Aircraft State at Error:`, ac ? JSON.parse(JSON.stringify(ac)) : 'undefined');
        console.error(`Leg State at Error:`, legInSchedule ? JSON.parse(JSON.stringify(legInSchedule)) : 'undefined');
        console.error(`Full Error Object:`, error);
        console.error("--- END CUSTOM ERROR LOG ---");
        return defaultReturn;
    }
  };

  // --- Fare and Route Analysis Logic ---
  const calculateOptimalFare = useCallback((
    leg: Omit<FlightLeg, 'fareMultiplier'>,
    aircraft: Aircraft,
    remainingPassengerPool: number,
    originAirport: Airport,
    destinationAirport: Airport
  ): { bestMultiplier: number, bestProfit: number } => {
    let bestProfit = -Infinity;
    let bestMultiplier = 1.0;
    const aircraftType = AIRCRAFT_TYPES[aircraft.type];
    if (!aircraftType) return { bestMultiplier, bestProfit };

    const cabinCrew = staff.cabinCrews.find(cc => cc.assignedTo === aircraft.id);
    const baseBonus = 0.15; // 15%
    const levelMultiplier = cabinCrew ? 1 + (cabinCrew.level - 1) * 0.2 : 1;
    const cabinCrewBonus = cabinCrew ? 1 + (baseBonus * levelMultiplier) : 1.0;

    const distance = calculateDistanceNM(originAirport.position, destinationAirport.position);
    
    const hubCostBonus = originAirport?.hubStatus === 'large' ? 0.85 : originAirport?.hubStatus === 'small' ? 0.95 : 1;
    const aiHubPenalty = (destinationAirport?.aiHubAirline && destinationAirport.aiHubAirline !== aircraft.airline) ? 0.9 : 1.0;

    for (let multiplier = 0.8; multiplier <= 1.2; multiplier += 0.01) {
        const fareEffect = 1 - ((multiplier - 1) * 1.5);
        const potentialPassengers = Math.floor(remainingPassengerPool * fareEffect * cabinCrewBonus);
        const passengers = Math.min(aircraftType.capacity, Math.max(0, potentialPassengers));
        
        const revenue = passengers * distance * REVENUE_PER_PASSENGER_MILE * multiplier;
        const fuelCost = distance * aircraftType.fuelPerNm * hubCostBonus * fuelPriceMultiplier;
        const maintenanceCost = distance * aircraftType.baseMaintenancePerNm * MAINTENANCE_MULTIPLIER;
        const cost = fuelCost + maintenanceCost;
        const profit = (revenue - cost) * aiHubPenalty;

        if (profit > bestProfit) {
            bestProfit = profit;
            bestMultiplier = multiplier;
        }
    }
    return { bestMultiplier: parseFloat(bestMultiplier.toFixed(2)), bestProfit };
  }, [gameEvents, fuelPriceMultiplier, staff.cabinCrews]);

  const handleAssignFlightLeg = (aircraftId: string, route: RouteDemand) => {
    if (schedulesLocked) return;
    setAircrafts(prevAircrafts => prevAircrafts.map(ac => {
      if (ac.id !== aircraftId) return ac;
      
      const aircraftType = AIRCRAFT_TYPES[ac.type];
      const originAirport = getAirportByCode(route.origin);
      const destAirport = getAirportByCode(route.destination);
      if (!aircraftType || !originAirport || !destAirport) return ac;

      const lastLeg = ac.schedule && ac.schedule.length > 0 ? ac.schedule[ac.schedule.length - 1] : null;
      if (route.origin !== (lastLeg ? lastLeg.destination : ac.homeBase)) {
        alert("New flight must depart from the aircraft's last destination."); return ac;
      }
      
      const lastLegDelay = lastLeg?.delayHours || 0;
      const lastLegArrival = lastLeg?.arrivalTime || 0;
      const turnaroundHours = (route.durationHours > 2 ? 50 : 30) / 60;
      const distance = calculateDistanceNM(originAirport.position, destAirport.position);
      const durationHours = distance / aircraftType.speed;
      const departureTime = lastLeg ? lastLegArrival + lastLegDelay + turnaroundHours : SCHEDULE_START_HOUR;
      const arrivalTime = departureTime + durationHours;

      if (arrivalTime > MAX_SCHEDULE_HOURS) {
        alert(`Exceeds schedule limit.`); return ac;
      }

      const passengerPools = getPassengerPools(aircraftType);
      const key = `${route.origin}-${route.destination}`;
      const poolForTime = passengerPools.get(key);
      const timeOfDay = departureTime % 24;
      let totalPassengerPool = 0;
      if(poolForTime) {
        if (timeOfDay < 12) totalPassengerPool = poolForTime.morning;
        else if (timeOfDay < 18) totalPassengerPool = poolForTime.afternoon;
        else totalPassengerPool = poolForTime.evening;
      }
      
      const competitionSchedule: FlightLeg[] = [...(Object.values(aiSchedules) as FlightLeg[][][]).flat(2), ...prevAircrafts.filter(a => a.id !== ac.id && a.airline === 'PLAYER').flatMap(a => a.schedule || [])];
      const competition = competitionSchedule
          .filter((leg: FlightLeg) => leg.origin === route.origin && leg.destination === route.destination && Math.abs(leg.departureTime - departureTime) < 2).length;
      const passengersConsumedByAI = competition * Math.floor(AIRCRAFT_TYPES['A320'].capacity * 0.7);
      const remainingPool = Math.max(0, totalPassengerPool - passengersConsumedByAI);
      const { bestMultiplier } = calculateOptimalFare({ origin: route.origin, destination: route.destination, departureTime, arrivalTime, durationHours }, ac, remainingPool, originAirport, destAirport);

      const newLeg: FlightLeg = {
        origin: route.origin, destination: route.destination, durationHours: durationHours, departureTime, arrivalTime, fareMultiplier: bestMultiplier,
      };

      return { ...ac, schedule: [...(ac.schedule || []), newLeg] };
    }));
  };

  const handleRemoveLastFlightLeg = (aircraftId: string) => {
    if (schedulesLocked) return;
    setAircrafts(prev => prev.map(ac => (ac.id === aircraftId && ac.schedule) ? { ...ac, schedule: ac.schedule.slice(0, -1) } : ac));
  };

  const handleClearSchedule = (aircraftId: string) => {
      if (schedulesLocked) return;
      setAircrafts(prev => prev.map(ac => ac.id === aircraftId ? { ...ac, schedule: [] } : ac));
  };
  
  const handleScheduleReturnToBase = (aircraftId: string) => {
    if (schedulesLocked) return;
    const aircraft = aircrafts.find(ac => ac.id === aircraftId);
    if (!aircraft || !aircraft.schedule || aircraft.schedule.length === 0) return;
    
    const lastLeg = aircraft.schedule[aircraft.schedule.length - 1];
    const returnRoute = routes.find(r => r.origin === lastLeg.destination && r.destination === aircraft.homeBase);

    if (lastLeg.destination === aircraft.homeBase) return alert("Already scheduled to return home.");
    if (!returnRoute) return alert(`No direct route found from ${lastLeg.destination} to ${aircraft.homeBase}.`);
    
    handleAssignFlightLeg(aircraftId, returnRoute);
  };

  const handleSetFareMultiplier = (aircraftId: string, legIndex: number, multiplier: number) => {
    if (schedulesLocked) return;
    setAircrafts(prev => prev.map(ac => {
        if (ac.id === aircraftId && ac.schedule && ac.schedule[legIndex]) {
            const newSchedule = [...ac.schedule];
            newSchedule[legIndex] = { ...newSchedule[legIndex], fareMultiplier: multiplier };
            return { ...ac, schedule: newSchedule };
        }
        return ac;
    }));
  };

  const getAnalysisDataForLeg = useCallback((aircraftId: string, legIndex: number) => {
    const aircraft = aircrafts.find(ac => ac.id === aircraftId);
    if (!aircraft || !aircraft.schedule || !aircraft.schedule[legIndex]) return null;
    
    const leg = aircraft.schedule[legIndex];
    const aircraftType = AIRCRAFT_TYPES[aircraft.type];
    const route = routes.find(r => r.origin === leg.origin && r.destination === leg.destination);
    const originAirport = getAirportByCode(leg.origin);
    const destinationAirport = getAirportByCode(leg.destination);
    if (!aircraftType || !route || !originAirport || !destinationAirport) return null;

    const passengerPools = getPassengerPools(aircraftType);
    const allOtherPlayerSchedules = aircrafts.filter(ac => ac.id !== aircraftId && ac.airline === 'PLAYER').flatMap(ac => ac.schedule || []);
    const allCompetitionSchedules: FlightLeg[] = [...(Object.values(aiSchedules) as FlightLeg[][][]).flat(2), ...allOtherPlayerSchedules];

    const competition = allCompetitionSchedules.filter((competingLeg: FlightLeg) => 
        competingLeg.origin === leg.origin &&
        competingLeg.destination === leg.destination &&
        Math.abs(competingLeg.departureTime - leg.departureTime) < 2
    );

    const key = `${leg.origin}-${leg.destination}`;
    const poolForTime = passengerPools.get(key);
    if (!poolForTime) return null;

    const timeOfDay = leg.departureTime % 24;
    let totalPassengerPool = 0;
    if (timeOfDay < 12) totalPassengerPool = poolForTime.morning;
    else if (timeOfDay < 18) totalPassengerPool = poolForTime.afternoon;
    else totalPassengerPool = poolForTime.evening;
    
    const competitionInfo: CompetitionInfo[] = competition.map(cleg => {
        const competingAircraft = aircrafts.find(ac => ac.schedule?.includes(cleg));
        const competingAiAirline = Object.keys(aiSchedules).find(airline => aiSchedules[airline].flat().includes(cleg));
        return {
            airline: competingAircraft?.airline || competingAiAirline || "AI",
            type: competingAircraft?.type || "A320",
            departureTime: cleg.departureTime,
        }
    });

    setAnalyzingLegData({
        leg, legIndex, aircraft, totalPassengerPool, competition: competitionInfo, route, originAirport, destinationAirport, fuelPriceMultiplier, staff, staffCost: STAFF_COST
    });
  }, [aircrafts, routes, getAirportByCode, aiSchedules, getPassengerPools, fuelPriceMultiplier, staff]);


  // UI Handlers
  const handleStart = (selectedDifficulty: GameDifficulty) => {
    if (hasStartedGame.current) return;
    hasStartedGame.current = true;
    
    setDifficulty(selectedDifficulty);
    
    // Create initial player aircraft
    AIRCRAFT_ID_COUNTER.player++;
    const firstAircraftId = `PL-${AIRCRAFT_ID_COUNTER.player}`;
    const firstAircraftType = AIRCRAFT_TYPES['A320'];
    
    setPlayerCash(c => c - firstAircraftType.cost);
    setAircrafts([{
        id: firstAircraftId, name: `PL-${AIRCRAFT_ID_COUNTER.player}`, type: 'A320', airline: 'PLAYER', origin: 'LHR', destination: 'LHR',
        position: airportsWithPositions.find(ap => ap.code === 'LHR')?.position || { lat: 0, lng: 0 },
        bearing: 0, progress: 1, status: 'LANDED', homeBase: 'LHR', schedule: [], history: [],
      }]);
    
    generateInitialAiState(false);
    setIsStarted(true);
    generateWeeklyForecast();
    handleNewDay(aircrafts);
  };
  
  const handleQuickStart = (selectedDifficulty: GameDifficulty) => {
    if (hasStartedGame.current) return;
    hasStartedGame.current = true;

    setDifficulty(selectedDifficulty);
    
    const lhr = airportsWithPositions.find(ap => ap.code === 'LHR');
    if (!lhr) return;

    const fleetToBuy = [
        { type: 'A320', name: 'Alpha Jet' },
        { type: 'ATR72', name: 'Bravo Prop' },
        { type: 'ATR72', name: 'Charlie Prop' },
        { type: 'ATR72', name: 'Delta Prop' },
    ];

    let cost = 0;
    const newFleet: Aircraft[] = [];

    fleetToBuy.forEach(f => {
        const acType = AIRCRAFT_TYPES[f.type];
        cost += acType.cost;
        AIRCRAFT_ID_COUNTER.player++;
        const id = `PL-${AIRCRAFT_ID_COUNTER.player}`;
        newFleet.push({
            id: id, name: f.name, type: f.type, airline: 'PLAYER', origin: 'LHR', destination: 'LHR', position: lhr.position, bearing: 0, progress: 1, status: 'LANDED', homeBase: 'LHR', schedule: [], history: [],
        });
    });

    setPlayerCash(c => c - cost);
    setAircrafts(newFleet);

    generateInitialAiState(false);
    setIsStarted(true);
    generateWeeklyForecast();
    handleNewDay(newFleet);
  };

  const handleBigStart = (selectedDifficulty: GameDifficulty) => {
    if (hasStartedGame.current) return;
    hasStartedGame.current = true;

    setDifficulty(selectedDifficulty);
    
    const majorHubs = ['CDG', 'FRA', 'AMS', 'MAD', 'FCO'];
    const scatteredBases: (typeof airportsWithPositions[0])[] = [];
    majorHubs.forEach(code => {
        const airport = airportsWithPositions.find(ap => ap.code === code);
        if (airport) scatteredBases.push(airport);
    });
    
    const fleetToBuy = [
        // 5 at LHR
        ...Array(2).fill({ type: 'A320', base: 'LHR' }),
        ...Array(3).fill({ type: 'ATR72', base: 'LHR' }),
        // 5 scattered
        ...scatteredBases.slice(0, 2).map(base => ({ type: 'A320', base: base.code })),
        ...scatteredBases.slice(2, 5).map(base => ({ type: 'ATR72', base: base.code })),
    ];

    let cost = 0;
    const newFleet: Aircraft[] = [];
    let nameCounter = 1;

    fleetToBuy.forEach(f => {
        const acType = AIRCRAFT_TYPES[f.type];
        const baseAirport = airportsWithPositions.find(ap => ap.code === f.base);
        if (!baseAirport) return;

        cost += acType.cost;
        AIRCRAFT_ID_COUNTER.player++;
        const id = `PL-${AIRCRAFT_ID_COUNTER.player}`;
        newFleet.push({
            id,
            name: `Aero-${nameCounter++}`,
            type: f.type,
            airline: 'PLAYER',
            origin: f.base,
            destination: f.base,
            position: baseAirport.position,
            bearing: 0,
            progress: 1,
            status: 'LANDED',
            homeBase: f.base,
            schedule: [],
            history: [],
        });
    });
    
    const startingCash = BIG_START_CASH - cost;
    setPlayerCash(startingCash);
    setCashAtStartOfWeek(startingCash);
    setAircrafts(newFleet);
    
    generateInitialAiState(true);

    setIsStarted(true);
    generateWeeklyForecast();
    handleNewDay(newFleet);
  };


  const handleTogglePause = () => {
    if (isHelpModeActive) setHelpModeActive(false); // Turn off help mode when playing
    setIsPaused(p => !p)
  };
  const handleChangeSpeed = (speed: GameSpeed) => setGameSpeed(speed);
  const handleMapClick = () => {
    setSelectedAirport(null);
    setSelectedAircraftId(null);
    setSelectedRadarId(null);
  };

  const handleSelectAirport = (code: string) => {
    setSelectedAirport(getAirportByCode(code));
    setSelectedAircraftId(null);
    setSelectedRadarId(null);
  };

  const handleSelectAircraft = (id: string) => {
    setSelectedAircraftId(id);
    setSelectedAirport(null);
    setSelectedRadarId(null);
  };
  
  const handleSelectRadar = (id: string) => {
    setSelectedRadarId(id);
    setSelectedAirport(null);
    setSelectedAircraftId(null);
  };
  
  const handleToggleRadarStatus = (id: string) => {
      setRadars(prevRadars => {
          const newRadars = prevRadars.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
          updateAirportCoverage(newRadars);
          return newRadars;
      });
  };

  const handleBuyAircraft = (type: string, homeBaseCode: string, name: string) => {
    const aircraftType = AIRCRAFT_TYPES[type];
    const homeBase = getAirportByCode(homeBaseCode);

    if (playerCash >= aircraftType.cost && homeBase) {
      setPlayerCash(c => c - aircraftType.cost);
      AIRCRAFT_ID_COUNTER.player++;
      const id = `PL-${AIRCRAFT_ID_COUNTER.player}`;
      const newAircraft: Aircraft = {
        id: id, name: name.trim() !== '' ? name.trim() : id, type: type, airline: 'PLAYER', origin: homeBase.code, destination: homeBase.code, position: homeBase.position, bearing: 0, progress: 1, status: 'LANDED', homeBase: homeBase.code, schedule: [], history: [],
      };
      setAircrafts(acs => [...acs, newAircraft]);
      setShowFleetManagement(false);
    } else {
      alert("Not enough cash or no home base selected!");
    }
  };

  const handleAutoScheduleAircraft = (aircraftId: string) => {
    if (schedulesLocked) {
        return;
    }
    const aircraftToSchedule = aircrafts.find(ac => ac.id === aircraftId);
    if (!aircraftToSchedule) {
        return;
    }
    
    const aircraftType = AIRCRAFT_TYPES[aircraftToSchedule.type];
    
    // Create a 7-day demand simulation
    const weeklyPassengerPools: Map<string, number>[] = [];
    for (let day = 1; day <= 7; day++) {
        const dailyPools = getPassengerPools(aircraftType, day);
        const poolsForScheduler = new Map<string, number>();
        dailyPools.forEach((demand, key) => {
            poolsForScheduler.set(key, Math.floor((demand.morning + demand.afternoon + demand.evening) / 3));
        });
        weeklyPassengerPools.push(poolsForScheduler);
    }

    const avgPassengerPools = new Map<string, number>();
    routes.forEach(route => {
        let totalDemand = 0;
        for (const dailyPool of weeklyPassengerPools) {
            totalDemand += dailyPool.get(`${route.origin}-${route.destination}`) || 0;
        }
        avgPassengerPools.set(`${route.origin}-${route.destination}`, totalDemand / weeklyPassengerPools.length);
    });

    const avgCompetitionPools = new Map(avgPassengerPools);
    
    const aiCompetitionSchedule = (Object.values(aiSchedules) as FlightLeg[][][]).flat(2);
    aiCompetitionSchedule.forEach(leg => {
        const key = `${leg.origin}-${leg.destination}`;
        const pool = avgCompetitionPools.get(key);
        if (pool) {
            const passengersConsumed = Math.floor(AIRCRAFT_TYPES['A320'].capacity * 0.7);
            avgCompetitionPools.set(key, Math.max(0, pool - passengersConsumed));
        }
    });

    const otherPlayerAircraft = aircrafts.filter(a => a.id !== aircraftId && a.airline === 'PLAYER');
    otherPlayerAircraft.forEach(ac => {
        if (ac.schedule && ac.schedule.length > 0) {
            const competitorAircraftType = AIRCRAFT_TYPES[ac.type];
            if (!competitorAircraftType) return; 

            ac.schedule.forEach(leg => {
                const key = `${leg.origin}-${leg.destination}`;
                const pool = avgCompetitionPools.get(key);
                if (pool) {
                    const passengersConsumed = Math.floor(competitorAircraftType.capacity * 0.7);
                    avgCompetitionPools.set(key, Math.max(0, pool - passengersConsumed));
                }
            });
        }
    });

    let bestCompleteSchedule: FlightLeg[] = [];
    
    for (let attempt = 0; attempt < 25; attempt++) {
        let currentSchedule: FlightLeg[] = [];
        let currentTime = SCHEDULE_START_HOUR;
        let currentAirportCode = aircraftToSchedule.homeBase;
        let previousAirportCode: string | null = null;
        
        const tempPools = new Map(avgCompetitionPools);

        const getRemainingPassengers = (route: RouteDemand): number => {
          return tempPools.get(`${route.origin}-${route.destination}`) || 0;
        };

        while (true) {
            const availableRoutes = routes
                .filter(r => r.origin === currentAirportCode && r.destination !== previousAirportCode)
                .map(route => {
                    const originAp = getAirportByCode(route.origin);
                    const destAp = getAirportByCode(route.destination);
                    const remainingPool = getRemainingPassengers(route);
                    if (!originAp || !destAp || remainingPool <= aircraftType.capacity * 0.1) {
                      return { ...route, potentialProfit: -Infinity };
                    }
                    const distance = calculateDistanceNM(originAp.position, destAp.position);
                    const durationHours = distance / aircraftType.speed;
                    
                    const weatherPenalty = weeklyForecast.find(e => e.type === 'weather' && e.target === destAp.code) ? 0.8 : 1.0;
                    const { bestProfit, bestMultiplier } = calculateOptimalFare(
                      { origin: route.origin, destination: route.destination, departureTime: currentTime, arrivalTime: currentTime + durationHours, durationHours },
                      aircraftToSchedule, remainingPool, originAp, destAp
                    );
                    return { ...route, potentialProfit: bestProfit * weatherPenalty, optimalMultiplier: bestMultiplier, durationHours };
                })
                .filter(r => r.potentialProfit > -1000) // Allow for small losses on repositioning legs
                .sort((a, b) => b.potentialProfit - a.potentialProfit);
            
            if (availableRoutes.length === 0) break;
            
            const choiceIndex = attempt > 1 ? Math.floor(Math.random() * Math.min(availableRoutes.length, 3)) : 0;
            const chosenRoute = availableRoutes[choiceIndex];
            const departureTime = currentTime;
            const arrivalTime = departureTime + chosenRoute.durationHours;

            if (arrivalTime > MAX_SCHEDULE_HOURS) break;

            const newLeg: FlightLeg = {
                origin: chosenRoute.origin, destination: chosenRoute.destination, durationHours: chosenRoute.durationHours, departureTime, arrivalTime, fareMultiplier: chosenRoute.optimalMultiplier,
            };
            currentSchedule.push(newLeg);

            const key = `${newLeg.origin}-${newLeg.destination}`;
            const passengers = Math.min(aircraftType.capacity, Math.floor(getRemainingPassengers(chosenRoute) * (1 - ((chosenRoute.optimalMultiplier - 1) * 1.5))));
            tempPools.set(key, Math.max(0, (tempPools.get(key) || 0) - passengers));

            currentTime = arrivalTime + ((chosenRoute.durationHours > 2 ? 50 : 30) / 60);
            previousAirportCode = currentAirportCode;
            currentAirportCode = chosenRoute.destination;
        }

        const lastLeg = currentSchedule.length > 0 ? currentSchedule[currentSchedule.length - 1] : null;
        if (lastLeg && lastLeg.destination !== aircraftToSchedule.homeBase) {
            const returnRoute = routes.find(r => r.origin === lastLeg.destination && r.destination === aircraftToSchedule.homeBase);
            const originAp = getAirportByCode(lastLeg.destination);
            const destAp = getAirportByCode(aircraftToSchedule.homeBase);
            if (returnRoute && originAp && destAp) {
                const turnaroundHours = (returnRoute.durationHours > 2 ? 50 : 30) / 60;
                const departureTime = lastLeg.arrivalTime + turnaroundHours;
                const distance = calculateDistanceNM(originAp.position, destAp.position);
                const durationHours = distance / aircraftType.speed;
                const arrivalTime = departureTime + durationHours;
                if (arrivalTime <= MAX_SCHEDULE_HOURS) {
                    const remainingPool = getRemainingPassengers(returnRoute);
                    const { bestMultiplier } = calculateOptimalFare({ origin: returnRoute.origin, destination: returnRoute.destination, departureTime, arrivalTime, durationHours }, aircraftToSchedule, remainingPool, originAp, destAp);
                    currentSchedule.push({ origin: returnRoute.origin, destination: returnRoute.destination, departureTime, arrivalTime, durationHours, fareMultiplier: bestMultiplier });
                }
            }
        }
        if (currentSchedule.length > 0 && currentSchedule[currentSchedule.length - 1].destination === aircraftToSchedule.homeBase) {
            if (currentSchedule.length > bestCompleteSchedule.length) {
                bestCompleteSchedule = currentSchedule;
            }
        }
    }
      if (bestCompleteSchedule.length > 0) {
          setAircrafts(prev => prev.map(ac => ac.id === aircraftId ? { ...ac, schedule: bestCompleteSchedule } : ac));
      } else {
          alert(`Auto-scheduler could not find a profitable round-trip for ${aircraftToSchedule.name || aircraftId} using the weekly forecast.`);
      }
  };

    const handleHireStaff = (type: HireableStaff) => {
        const cost = STAFF_COST[type];
        if (playerCash < cost) return;

        setPlayerCash(c => c - cost);

        setStaff(prev => {
            if (type === 'engineers') {
                return { ...prev, engineers: prev.engineers + 1 };
            }
            const newStaffMember: StaffMember = { id: `${type.slice(0, 3)}-${uuidv4()}`, level: 1, flightsCompleted: 0, assignedTo: null };
            return { ...prev, [type]: [...prev[type], newStaffMember] };
        });
    };

    const handleAssignStaff = (staffMemberId: string, targetId: string) => {
        setStaff(prev => {
            const findAndAssign = (members: StaffMember[]): StaffMember[] => 
                members.map(m => m.id === staffMemberId ? { ...m, assignedTo: targetId } : m);
            
            return {
                ...prev,
                pilots: findAndAssign(prev.pilots),
                cabinCrews: findAndAssign(prev.cabinCrews),
                dispatchers: findAndAssign(prev.dispatchers),
            };
        });
    };

    const handleUnassignStaff = (staffMemberId: string) => {
        setStaff(prev => {
            const findAndUnassign = (members: StaffMember[]): StaffMember[] => 
                members.map(m => m.id === staffMemberId ? { ...m, assignedTo: null } : m);
            
            return {
                ...prev,
                pilots: findAndUnassign(prev.pilots),
                cabinCrews: findAndUnassign(prev.cabinCrews),
                dispatchers: findAndUnassign(prev.dispatchers),
            };
        });
    };
  
    const handleLockSchedules = () => {
        const dayInCycle = (Math.floor(gameTime / 24)) % 7 + 1;
        if (dayInCycle === 1) {
            const unscheduledPlayerAircraft = aircrafts.filter(ac => ac.airline === 'PLAYER' && (!ac.schedule || ac.schedule.length === 0));
            if (unscheduledPlayerAircraft.length > 0) {
                if (!window.confirm(`You have ${unscheduledPlayerAircraft.length} aircraft with no schedule. Are you sure you want to lock-in for the week? They will remain idle.`)) {
                    return; // User cancelled
                }
            }
            setSchedulesLocked(true);
        }
    };
    
    const handleLaunchMarketingCampaign = (origin: string, destination: string) => {
        const routeKey = `${origin}-${destination}`;
        const cost = MARKETING_CAMPAIGN_COST;

        if (playerCash < cost) {
            alert("Not enough cash for a marketing campaign.");
            return;
        }

        if (marketingCampaigns.some(c => c.routeKey === routeKey)) {
            alert("A marketing campaign is already active for this route.");
            return;
        }

        setPlayerCash(c => c - cost);
        setMarketingCampaigns(campaigns => [...campaigns, { routeKey, expiryTime: gameTime + 24 }]);
        alert(`Marketing campaign for ${routeKey} launched! Passenger demand will be boosted for 24 hours.`);
    };

    const getPassengerPoolForRoute = useCallback((origin: string, destination: string, time: number): number => {
        // Use a standard size for pool calculation to get a baseline
        const aircraftTypeForSizing = AIRCRAFT_TYPES['A320']; 
        const dayInCycle = (Math.floor(gameTime / 24)) % 7 + 1;
        const pools = getPassengerPools(aircraftTypeForSizing, dayInCycle);
        const key = `${origin}-${destination}`;
        const poolForRoute = pools.get(key);
        
        if (!poolForRoute) return 0;

        const timeOfDay = time % 24;
        if (timeOfDay < 12) return poolForRoute.morning;
        if (timeOfDay < 18) return poolForRoute.afternoon;
        return poolForRoute.evening;

    }, [getPassengerPools, gameTime]);

    const handleUpgradeAircraft = (aircraftId: string, upgradeType: 'IFE' | 'WIFI' | 'MEAL') => {
        const aircraft = aircrafts.find(ac => ac.id === aircraftId);
        if (!aircraft) return;

        const cost = UPGRADE_COST[upgradeType];
        if (playerCash < cost) {
            alert(`Not enough cash for ${upgradeType} upgrade.`);
            return;
        }

        setPlayerCash(c => c - cost);
        setAircrafts(acs => acs.map(ac => {
            if (ac.id !== aircraftId) return ac;
            if (upgradeType === 'IFE') return { ...ac, hasIFE: true };
            if (upgradeType === 'WIFI') return { ...ac, hasWifi: true };
            if (upgradeType === 'MEAL') return { ...ac, hasMealService: true };
            return ac;
        }));
    };

    const handleRunWeeklyReport = () => {
        setIsPaused(true);
        generateWeeklyReport();
        setShowWeeklyReportModal(true);
    };
    
    const handleRebaseAircraft = (aircraftId: string, newBaseCode: string) => {
        const aircraft = aircrafts.find(ac => ac.id === aircraftId);
        const newBase = airports.find(ap => ap.code === newBaseCode);

        if (!aircraft || !newBase) {
            console.error("Cannot rebase: aircraft or new base not found.");
            return;
        }

        if (aircraft.status !== 'LANDED') {
            alert("Aircraft must be landed to rebase.");
            return;
        }

        setAircrafts(acs => acs.map(ac => {
            if (ac.id === aircraftId) {
                return {
                    ...ac,
                    homeBase: newBaseCode,
                    position: newBase.position,
                    origin: newBaseCode,
                    destination: newBaseCode,
                    schedule: [],
                    status: 'GROUNDED' as const,
                    groundedUntil: gameTime + 24,
                };
            }
            return ac;
        }));
    };

    // --- Tutorial Logic ---
    const TUTORIAL_STEPS: TutorialStep[] = [
        { targetSelector: '#right-panel', title: "Welcome to AeroDynasty!", content: "This is your command center. Here you can control time, check your finances, and manage your fleet and airports.", position: 'left' },
        { targetSelector: '#manage-fleet-button', title: "Purchase Aircraft", content: "To start an airline, you first need a plane. Let's go to the fleet management screen.", position: 'left', preAction: () => handleMapClick() },
        { targetSelector: '#fleet-management-modal', title: "The Dealership", content: "From here you can buy different types of aircraft. For this tutorial, we'll get you a starter fleet.", position: 'left', preAction: () => setShowFleetManagement(true), postAction: () => setShowFleetManagement(false) },
        { targetSelector: '#fleet-panel', title: "Your Fleet", content: "Your new aircraft appear here. Notice they are marked red because they don't have a schedule yet. Let's select one.", position: 'left', preAction: () => { handleQuickStart('easy'); setIsStarted(false); } },
        { targetSelector: '#info-panel', title: "Aircraft Details", content: "This panel shows details for your selected aircraft. The most important tab is 'Schedule'.", position: 'right', preAction: () => { const firstAircraft = aircrafts.find(ac => ac.airline === 'PLAYER'); if(firstAircraft) handleSelectAircraft(firstAircraft.id); } },
        { targetSelector: '#auto-schedule-button', title: "Auto-Scheduler", content: "You can build schedules flight-by-flight, but the Auto-Scheduler is a great way to start. It will try to create a profitable route for the day.", position: 'right' },
        { targetSelector: '#info-panel-schedule-list', title: "Your First Schedule", content: "The AI has created a schedule for your plane. You can click on any flight to analyze its profitability and adjust fares.", position: 'right', preAction: () => { const firstAircraft = aircrafts.find(ac => ac.airline === 'PLAYER'); if(firstAircraft) handleAutoScheduleAircraft(firstAircraft.id); } },
        { targetSelector: '#lock-schedules-button', title: "Lock-in for the Week", content: "Once you're happy with your schedules, lock them in to start the week's operations.", position: 'left' },
        { targetSelector: '#play-pause-button', title: "Start the Simulation", content: "Press play to start time and watch your airline take to the skies!", position: 'left', preAction: () => { handleLockSchedules(); setIsPaused(true); } },
        { targetSelector: '#map-container', title: "You're Flying!", content: "Congratulations! Your airline is operational. Explore the map, manage your fleet, and grow your empire. Good luck!", position: 'bottom' },
    ];

    return (
        <div className="font-sans bg-gray-900 text-white h-screen w-screen overflow-hidden relative">
            {apiKeyErrorReason && <ApiKeyModal reason={apiKeyErrorReason} onClose={() => setApiKeyErrorReason(null)} />}
            
            {!isStarted && !isTutorialActive && (
                <WelcomeModal 
                    onStart={handleStart} 
                    onQuickStart={handleQuickStart} 
                    onBigStart={handleBigStart} 
                    onStartTutorial={() => { 
                        setTutorialActive(true); 
                        setTutorialStep(0); 
                        const firstStep = TUTORIAL_STEPS[0];
                        if(firstStep.preAction) firstStep.preAction();
                    }} 
                />
            )}
            
            <MapComponent
                airports={airports}
                aircrafts={aircraftDisplayData}
                radars={radars}
                gameEvents={gameEvents}
                selectedAirport={selectedAirport}
                selectedAircraftId={selectedAircraftId}
                selectedRadarId={selectedRadarId}
                onSelectAirport={handleSelectAirport}
                onSelectAircraft={handleSelectAircraft}
                onSelectRadar={handleSelectRadar}
                onToggleRadarStatus={handleToggleRadarStatus}
                onMapClick={handleMapClick}
            />

            {simulationError && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-800/90 text-white p-3 rounded-lg shadow-lg z-50">
                    <p>{simulationError}</p>
                    <button onClick={() => setSimulationError(null)} className="absolute top-0 right-1 text-xl">&times;</button>
                </div>
            )}

            {(selectedAircraftId || selectedAirport || selectedRadarId) && (
                <div className="absolute top-4 left-4 w-96 max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <InfoPanel
                        selectedAirport={selectedAirport}
                        selectedAircraftId={selectedAircraftId}
                        selectedRadarId={selectedRadarId}
                        aircrafts={aircrafts}
                        radars={radars}
                        routes={routes}
                        staff={staff}
                        gameEvents={gameEvents}
                        weeklyForecast={weeklyForecast}
                        schedulesLocked={schedulesLocked}
                        playerCash={playerCash}
                        gameTime={gameTime}
                        airports={airports}
                        isHelpModeActive={isHelpModeActive}
                        onAssignFlightLeg={handleAssignFlightLeg}
                        onRemoveLastFlightLeg={handleRemoveLastFlightLeg}
                        onClearSchedule={handleClearSchedule}
                        onScheduleReturnToBase={handleScheduleReturnToBase}
                        onAutoSchedule={handleAutoScheduleAircraft}
                        onSetFareMultiplier={handleSetFareMultiplier}
                        onAnalyzeLeg={getAnalysisDataForLeg}
                        onAssignStaff={handleAssignStaff}
                        onUnassignStaff={handleUnassignStaff}
                        onUpgradeAircraft={handleUpgradeAircraft}
                        onRebaseAircraft={handleRebaseAircraft}
                        onClose={handleMapClick}
                        onShowStaffManagement={() => setShowStaffManagement(true)}
                    />
                </div>
            )}
            
            <RightPanel
                gameTime={gameTime}
                playerCash={playerCash}
                cashAtStartOfWeek={cashAtStartOfWeek}
                isPaused={isPaused}
                gameSpeed={gameSpeed}
                schedulesLocked={schedulesLocked}
                isHelpModeActive={isHelpModeActive}
                onTogglePause={handleTogglePause}
                onChangeSpeed={handleChangeSpeed}
                onShowFleetManagement={() => setShowFleetManagement(true)}
                onShowCompetition={() => setShowCompetition(true)}
                onShowStaffManagement={() => setShowStaffManagement(true)}
                onLockSchedules={handleLockSchedules}
                onRunWeeklyReport={handleRunWeeklyReport}
                onToggleHelpMode={() => setHelpModeActive(p => !p)}
                aircrafts={aircrafts.filter(ac => ac.airline === 'PLAYER')}
                selectedAircraftId={selectedAircraftId}
                onSelectAircraft={handleSelectAircraft}
                getAirportByCode={getAirportByCode}
                airports={airports}
                onSelectAirport={handleSelectAirport}
                selectedAirport={selectedAirport}
            />

            {showFleetManagement && (
                <FleetManagementModal
                    playerCash={playerCash}
                    aircraftTypes={AIRCRAFT_TYPES}
                    airports={airports.filter(ap => ap.isCovered)}
                    routes={routes}
                    revenuePerMile={REVENUE_PER_PASSENGER_MILE}
                    onBuyAircraft={handleBuyAircraft}
                    onClose={() => setShowFleetManagement(false)}
                />
            )}
            
            {analyzingLegData && (
                 <RouteAnalysisModal
                      data={analyzingLegData}
                      aircraftTypes={AIRCRAFT_TYPES}
                      revenuePerMile={REVENUE_PER_PASSENGER_MILE}
                      onClose={() => setAnalyzingLegData(null)}
                      onSetFareMultiplier={handleSetFareMultiplier}
                  />
            )}
            
            {showCompetition && (
                <CompetitionModal
                    schedules={aiSchedules}
                    playerAircrafts={aircrafts.filter(ac => ac.airline === 'PLAYER')}
                    aircraftTypes={AIRCRAFT_TYPES}
                    playerCash={playerCash}
                    aiSatisfaction={aiRouteSatisfaction}
                    playerSatisfaction={routeStats}
                    onClose={() => setShowCompetition(false)}
                    onAnalyzePlayerLeg={getAnalysisDataForLeg}
                    onLaunchMarketingCampaign={handleLaunchMarketingCampaign}
                    getPassengerPoolForRoute={getPassengerPoolForRoute}
                />
            )}
            
            {showStaffManagement && (
                <StaffModal
                    staff={staff}
                    playerCash={playerCash}
                    aircrafts={aircrafts.filter(ac => ac.airline === 'PLAYER')}
                    airports={airports.filter(ap => !!ap.hubStatus)}
                    staffCost={STAFF_COST}
                    onHireStaff={handleHireStaff}
                    onUnassignStaff={handleUnassignStaff}
                    onClose={() => setShowStaffManagement(false)}
                />
            )}
            
            {isStarted && <Ticker events={gameEvents.filter(e => e.type !== 'weather' || e.probability === undefined)} onClick={() => setShowAlertsModal(true)} />}
            
            {showAlertsModal && <AlertsModal events={gameEvents} onClose={() => setShowAlertsModal(false)} />}
            
            {showWeeklyReportModal && weeklyReportData && <WeeklyReportModal data={weeklyReportData} onClose={() => { setShowWeeklyReportModal(false); if(isPaused && !schedulesLocked) setIsPaused(false); }} />}
            
            {isTutorialActive && (
                 <TutorialOverlay
                     steps={TUTORIAL_STEPS}
                     stepIndex={tutorialStep}
                     onNext={() => {
                         const nextStepIndex = tutorialStep + 1;
                         if (nextStepIndex < TUTORIAL_STEPS.length) {
                             const nextStep = TUTORIAL_STEPS[nextStepIndex];
                             if (nextStep.preAction) nextStep.preAction();
                             setTutorialStep(nextStepIndex);
                         } else {
                             setTutorialActive(false);
                         }
                     }}
                     onEnd={() => setTutorialActive(false)}
                 />
            )}
        </div>
    );
};

export default App;