

import React, { useState, useMemo } from 'react';
import type { Aircraft, FlightLeg, RouteDemand, Airport, CompetitionInfo, AircraftType, StaffState } from '../types';
import { calculateDistanceNM } from '../utils';
import AircraftIcon from './icons/AircraftIcon';

const MAINTENANCE_MULTIPLIER = 1.2;
const MEAL_COST_PER_PAX = 15;

interface RouteAnalysisModalProps {
  data: {
    leg: FlightLeg;
    legIndex: number;
    aircraft: Aircraft;
    totalPassengerPool: number;
    competition: CompetitionInfo[];
    route: RouteDemand;
    originAirport: Airport;
    destinationAirport: Airport;
    fuelPriceMultiplier: number;
    staff: StaffState;
    staffCost: Record<string, number>;
  };
  aircraftTypes: Record<string, AircraftType>;
  onClose: () => void;
  onSetFareMultiplier: (aircraftId: string, legIndex: number, multiplier: number) => void;
  revenuePerMile: number;
}

const RouteAnalysisModal: React.FC<RouteAnalysisModalProps> = ({ data, aircraftTypes, onClose, onSetFareMultiplier, revenuePerMile }) => {
  const { leg, legIndex, aircraft, totalPassengerPool, competition, originAirport, destinationAirport, fuelPriceMultiplier, staff, staffCost } = data;
  const aircraftType = useMemo(() => aircraftTypes[aircraft.type], [aircraft.type, aircraftTypes]);
  
  const [currentFare, setCurrentFare] = useState(leg.fareMultiplier || 1.0);

  const competitionConsumption = useMemo(() => {
    return competition.reduce((acc, comp) => {
        const compAircraftType = aircraftTypes[comp.type];
        if (!compAircraftType) return acc;
        // Assume competitors fill 70% of their capacity
        return acc + Math.floor(compAircraftType.capacity * 0.7);
    }, 0);
  }, [competition, aircraftTypes]);
  
  const remainingPool = Math.max(0, totalPassengerPool - competitionConsumption);

  const { passengers, revenue, cost, profit, costBreakdown } = useMemo(() => {
    if (!aircraftType) return { passengers: 0, revenue: 0, cost: 0, profit: 0, costBreakdown: null };
    const fareEffect = 1 - ((currentFare - 1) * 1.5);
    const potentialPassengers = Math.floor(remainingPool * fareEffect);
    const passengers = Math.min(aircraftType.capacity, Math.max(0, potentialPassengers));

    const distance = calculateDistanceNM(originAirport.position, destinationAirport.position);
    
    const hubBonusCost = originAirport.hubStatus === 'large' ? 0.85 : originAirport.hubStatus === 'small' ? 0.95 : 1;
    
    const revenue = passengers * distance * revenuePerMile * currentFare;

    const pilotAssigned = staff.pilots.some(p => p.assignedTo === aircraft.id);
    const cabinCrewAssigned = staff.cabinCrews.some(cc => cc.assignedTo === aircraft.id);
    const calculatedStaffCost = (pilotAssigned ? staffCost.pilots : 0) * leg.durationHours / 8 +
                                (cabinCrewAssigned ? staffCost.cabinCrews : 0) * leg.durationHours / 8;

    const fuelCost = distance * aircraftType.fuelPerNm * hubBonusCost * fuelPriceMultiplier;
    const maintenanceCost = distance * aircraftType.baseMaintenancePerNm * MAINTENANCE_MULTIPLIER;
    const mealCost = aircraft.hasMealService ? passengers * MEAL_COST_PER_PAX : 0;
    const totalCost = fuelCost + maintenanceCost + calculatedStaffCost + mealCost;
    
    const profit = revenue - totalCost;
    
    const breakdown = {
        fuel: Math.round(fuelCost),
        maintenance: Math.round(maintenanceCost),
        staff: Math.round(calculatedStaffCost),
        mealService: Math.round(mealCost),
    };
    
    return { passengers, revenue, cost: totalCost, profit, costBreakdown: breakdown };
  }, [currentFare, remainingPool, aircraftType, originAirport, destinationAirport, revenuePerMile, leg, aircraft, staff, staffCost, fuelPriceMultiplier]);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFare = parseFloat(e.target.value);
    setCurrentFare(newFare);
    onSetFareMultiplier(aircraft.id, legIndex, newFare);
  };

  if (!aircraftType) {
    return (
        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-50" onClick={onClose}>
            <p>Error: Aircraft type data not found.</p>
        </div>
    );
  }
  
  const formatTime = (time: number | undefined) => (typeof time === 'number' ? time.toFixed(1) : 'N/A');

  const costTooltip = costBreakdown 
    ? `Fuel: $${costBreakdown.fuel.toLocaleString()}\nMaint: $${costBreakdown.maintenance.toLocaleString()}\nStaff: $${costBreakdown.staff.toLocaleString()}\nMeals: $${costBreakdown.mealService.toLocaleString()}`
    : '';

  return (
    <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-full max-w-3xl bg-gray-800 border-2 border-cyan-500/30 rounded-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Route Analysis</h2>
              <p className="text-cyan-400">{leg.origin} &rarr; {leg.destination} at {formatTime(leg.departureTime)}h</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel: Fare & Projections */}
          <div className="bg-gray-900/50 p-4 rounded-md space-y-4">
            <h3 className="text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-1">Fare & Profitability</h3>
            <div>
              <label className="text-sm text-gray-400">Fare Adjustment: <span className="font-bold text-white">{Math.round(currentFare * 100)}%</span></label>
              <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.01"
                  value={currentFare}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-1"
              />
            </div>

            <div className="space-y-2">
                <div className={`p-2 rounded text-center font-bold ${profit >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    Projected Profit: ${Math.round(profit).toLocaleString()}
                </div>
                 <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-800/50 p-2 rounded">
                        <p className="text-xs text-gray-400">Est. Revenue</p>
                        <p className="font-bold text-green-400">${Math.round(revenue).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-800/50 p-2 rounded cursor-help" title={costTooltip}>
                        <p className="text-xs text-gray-400">Est. Cost</p>
                        <p className="font-bold text-red-400">${Math.round(cost).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-md font-semibold text-gray-300 mb-2">Projected Passengers</h4>
                <div className="w-full bg-gray-700 rounded-full h-6">
                    <div 
                        className="bg-cyan-500 h-6 rounded-full text-center text-white text-sm font-bold flex items-center justify-center"
                        style={{ width: `${(passengers / aircraftType.capacity) * 100}%` }}
                    >
                       {passengers}
                    </div>
                </div>
                <p className="text-xs text-gray-400 text-right mt-1">Capacity: {aircraftType.capacity} | Load: {((passengers / aircraftType.capacity) * 100).toFixed(0)}%</p>
            </div>
          </div>
          
          {/* Right Panel: Market Info */}
          <div className="bg-gray-900/50 p-4 rounded-md">
             <h3 className="text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-1 mb-3">Market Overview</h3>
             <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                    <span className="text-gray-400">Total Available Passengers:</span>
                    <span className="font-bold text-white">{totalPassengerPool}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                    <span className="text-gray-400">Passengers on Competing Flights:</span>
                    <span className="font-bold text-red-400">-{competitionConsumption}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded border-t-2 border-gray-600">
                    <span className="text-gray-400">Remaining Passenger Pool:</span>
                    <span className="font-bold text-green-400">{remainingPool}</span>
                </div>
                <div className="flex justify-between items-center bg-cyan-900/50 p-2 rounded">
                    <span className="text-gray-400">Your Expected Market Share:</span>
                    <span className="font-bold text-cyan-300">{remainingPool > 0 ? ((passengers / remainingPool) * 100).toFixed(0) : '0'}%</span>
                </div>
             </div>

             <h4 className="text-md font-semibold text-gray-300 mt-4 mb-2">Competition (in 2h window)</h4>
             <div className="max-h-32 overflow-y-auto pr-2 text-sm space-y-2">
                {competition.length > 0 ? competition.map((comp, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded">
                        <AircraftIcon className="w-5 h-5 text-yellow-500" />
                        <div>
                           <p className="font-semibold text-gray-300">{comp.airline} ({comp.type})</p>
                           <p className="text-xs text-gray-400">Departs at {formatTime(comp.departureTime)}h</p>
                        </div>
                    </div>
                )) : <p className="text-gray-500 text-center py-4">No direct competition found.</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteAnalysisModal;
