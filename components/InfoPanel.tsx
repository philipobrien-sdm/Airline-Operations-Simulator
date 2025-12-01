
import React, { useState, useEffect } from 'react';
// FIX: Import `GameEvent` type to resolve TypeScript error.
import type { Airport, Aircraft, Radar, RouteDemand, FlightLeg, StaffState, StaffMember, GameEvent } from '../types';
import HubIcon from './icons/HubIcon';
import PilotIcon from './icons/PilotIcon';
import CabinCrewIcon from './icons/CabinCrewIcon';
import DispatcherIcon from './icons/DispatcherIcon';
import IFEIcon from './icons/IFEIcon';
import WifiIcon from './icons/WifiIcon';
import MealIcon from './icons/MealIcon';
import Tooltip from './Tooltip';

const UPGRADE_COST = {
    IFE: 250000,
    WIFI: 150000,
    MEAL: 50000,
};

interface InfoPanelProps {
  selectedAirport: Airport | null;
  selectedAircraftId: string | null;
  selectedRadarId: string | null;
  aircrafts: Aircraft[];
  radars: Radar[];
  routes: RouteDemand[];
  staff: StaffState;
  gameEvents: GameEvent[];
  weeklyForecast: GameEvent[];
  schedulesLocked: boolean;
  playerCash: number;
  gameTime: number;
  airports: Airport[];
  isHelpModeActive: boolean;
  onAssignFlightLeg: (aircraftId: string, route: RouteDemand) => void;
  onRemoveLastFlightLeg: (aircraftId: string) => void;
  onClearSchedule: (aircraftId: string) => void;
  onScheduleReturnToBase: (aircraftId: string) => void;
  onAutoSchedule: (aircraftId: string) => void;
  onSetFareMultiplier: (aircraftId: string, legIndex: number, multiplier: number) => void;
  onAnalyzeLeg: (aircraftId: string, legIndex: number) => void;
  onAssignStaff: (staffMemberId: string, targetId: string) => void;
  onUnassignStaff: (staffMemberId: string) => void;
  onUpgradeAircraft: (aircraftId: string, upgradeType: 'IFE' | 'WIFI' | 'MEAL') => void;
  onRebaseAircraft: (aircraftId: string, newBaseCode: string) => void;
  onClose: () => void;
  onShowStaffManagement: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  selectedAirport, 
  selectedAircraftId, 
  radars, 
  selectedRadarId,
  aircrafts, 
  routes,
  staff,
  gameEvents,
  weeklyForecast,
  schedulesLocked,
  playerCash,
  gameTime,
  airports,
  isHelpModeActive,
  onAssignFlightLeg,
  onRemoveLastFlightLeg,
  onClearSchedule,
  onScheduleReturnToBase,
  onAutoSchedule,
  onSetFareMultiplier,
  onAnalyzeLeg,
  onAssignStaff,
  onUnassignStaff,
  onUpgradeAircraft,
  onRebaseAircraft,
  onClose,
  onShowStaffManagement
}) => {
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [hour, setHour] = useState<number>(8);
  const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'upgrades'>('schedule');
  const [isRebasing, setIsRebasing] = useState(false);
  const [newBaseSelection, setNewBaseSelection] = useState("");

  const selectedAircraft = aircrafts.find(ac => ac.id === selectedAircraftId);
  const selectedRadar = radars.find(r => r.id === selectedRadarId);

  useEffect(() => {
    if (selectedAircraftId) {
        setActiveTab('schedule');
        setIsRebasing(false); // Reset rebase UI on aircraft change
    }
  }, [selectedAircraftId]);


  // Helper functions
  const formatTimeValue = (time: number | undefined) => {
    if (typeof time === 'number') {
        return time.toFixed(1);
    }
    return 'N/A';
  }
  const getDemandForDepartureTime = (route: RouteDemand, departureTime: number): number => {
    if (departureTime < 12) return route.demand.morning;
    if (departureTime < 18) return route.demand.afternoon;
    return route.demand.evening;
  };
  const getDemandForHour = (route: RouteDemand, specificHour: number): number => {
    if (specificHour < 12) return route.demand.morning;
    if (specificHour < 18) return route.demand.afternoon;
    return route.demand.evening;
  };
  const getDemandColor = (demand: number): string => {
    if (demand > 0.6) return '#4ade80'; if (demand > 0.4) return '#facc15';
    if (demand > 0.2) return '#fb923c'; return '#f87171';
  };
  const getDemandText = (demand: number): string => {
    if (demand > 0.6) return 'High'; if (demand > 0.4) return 'Medium';
    if (demand > 0.2) return 'Low'; return 'Very Low';
  };
  const handleAddFlight = () => {
    if (!selectedAircraft || !selectedRoute) return;
    const routeData = routes.find(r => r.origin === selectedRoute.split('-')[0].trim() && r.destination === selectedRoute.split('-')[1].trim());
    if (routeData) {
      onAssignFlightLeg(selectedAircraft.id, routeData);
      setSelectedRoute("");
    }
  };
  const handleAnalyzeClick = (legIndex: number) => {
    if (selectedAircraft) onAnalyzeLeg(selectedAircraft.id, legIndex);
  };


  const renderContent = () => {
    try {
        if (selectedAircraft && selectedAircraft.airline === 'PLAYER') {
        const schedule = selectedAircraft.schedule || [];
        const totalTime = schedule.length > 0 ? (schedule[schedule.length - 1].arrivalTime || 0) + (schedule[schedule.length - 1].delayHours || 0) : 0;
        const scheduledBlockDuration = totalTime > 0 ? totalTime - 6 : 0; // Schedule starts at 6 AM
        const lastLeg = schedule.length > 0 ? schedule[schedule.length - 1] : null;
        const nextDepartureAirport = lastLeg ? lastLeg.destination : selectedAircraft.homeBase;
        
        const isScheduleComplete = lastLeg ? lastLeg.destination === selectedAircraft.homeBase : false;
        const canReturnHome = schedule.length > 0 && !isScheduleComplete;

        const availableRoutes = routes
            .filter(r => r.origin === nextDepartureAirport)
            .map(route => {
                const turnaroundMinutes = route.durationHours > 2 ? 50 : 30;
                const turnaroundHours = turnaroundMinutes / 60;
                const departureTime = lastLeg ? (lastLeg.arrivalTime || 0) + (lastLeg.delayHours || 0) + turnaroundHours : 6;
                return { ...route, currentDemand: getDemandForDepartureTime(route, departureTime) }
            })
            .sort((a, b) => b.currentDemand - a.currentDemand);

        const isGrounded = selectedAircraft.status === 'GROUNDED';
        const groundedHoursLeft = selectedAircraft.groundedUntil ? Math.ceil(selectedAircraft.groundedUntil - gameTime) : 0;
        
        const assignedPilot = staff.pilots.find(p => p.assignedTo === selectedAircraft.id);
        const assignedCabinCrew = staff.cabinCrews.find(cc => cc.assignedTo === selectedAircraft.id);
        const availablePilots = staff.pilots.filter(p => p.assignedTo === null);
        const availableCabinCrew = staff.cabinCrews.filter(cc => cc.assignedTo === null);

        return (
            <div>
                <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-cyan-400">{selectedAircraft.name || selectedAircraft.id} ({selectedAircraft.type})</h3>
                    {assignedPilot && <Tooltip text={`Level ${assignedPilot.level} Pilot`} isHelpModeActive={isHelpModeActive}><PilotIcon className="w-5 h-5 text-yellow-400" /></Tooltip>}
                    {assignedCabinCrew && <Tooltip text={`Level ${assignedCabinCrew.level} Cabin Crew`} isHelpModeActive={isHelpModeActive}><CabinCrewIcon className="w-5 h-5 text-blue-400" /></Tooltip>}
                    {selectedAircraft.hasIFE && <IFEIcon className="w-5 h-5 text-purple-400" title="IFE Installed" />}
                    {selectedAircraft.hasWifi && <WifiIcon className="w-5 h-5 text-green-400" title="Wi-Fi Installed" />}
                    {selectedAircraft.hasMealService && <MealIcon className="w-5 h-5 text-orange-400" title="Meal Service Active" />}
                </div>
                <p className="text-sm text-gray-400">Home Base: {selectedAircraft.homeBase}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {/* Pilot Assignment */}
                    {assignedPilot ? (
                        <div className="bg-gray-800 p-2 rounded text-center">
                            <p className="text-xs text-yellow-300 font-semibold">Pilot Lvl {assignedPilot.level}</p>
                            <button onClick={() => onUnassignStaff(assignedPilot.id)} className="text-xs hover:text-white text-gray-400">Unassign</button>
                        </div>
                    ) : (
                        <select onChange={(e) => onAssignStaff(e.target.value, selectedAircraft.id)} value="" className="text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-2 rounded">
                            <option value="" disabled>Assign Pilot ({availablePilots.length})</option>
                            {availablePilots.map(p => <option key={p.id} value={p.id}>Pilot {p.id.slice(0, 4)} (Lvl {p.level})</option>)}
                        </select>
                    )}
                    {/* Cabin Crew Assignment */}
                    {assignedCabinCrew ? (
                        <div className="bg-gray-800 p-2 rounded text-center">
                            <p className="text-xs text-blue-300 font-semibold">Crew Lvl {assignedCabinCrew.level}</p>
                            <button onClick={() => onUnassignStaff(assignedCabinCrew.id)} className="text-xs hover:text-white text-gray-400">Unassign</button>
                        </div>
                    ) : (
                        <select onChange={(e) => onAssignStaff(e.target.value, selectedAircraft.id)} value="" className="text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-2 rounded">
                            <option value="" disabled>Assign Crew ({availableCabinCrew.length})</option>
                            {availableCabinCrew.map(cc => <option key={cc.id} value={cc.id}>Crew {cc.id.slice(0, 4)} (Lvl {cc.level})</option>)}
                        </select>
                    )}
                </div>
            <div className="flex border-b border-gray-700 mt-4">
                    <button className={`px-4 py-2 text-sm font-semibold ${activeTab === 'schedule' ? 'border-b-2 border-cyan-400 text-white' : 'text-gray-400 hover:text-gray-200'}`} onClick={() => setActiveTab('schedule')}>Schedule</button>
                    <button className={`px-4 py-2 text-sm font-semibold ${activeTab === 'history' ? 'border-b-2 border-cyan-400 text-white' : 'text-gray-400 hover:text-gray-200'}`} onClick={() => setActiveTab('history')}>History</button>
                    <button className={`px-4 py-2 text-sm font-semibold ${activeTab === 'upgrades' ? 'border-b-2 border-cyan-400 text-white' : 'text-gray-400 hover:text-gray-200'}`} onClick={() => setActiveTab('upgrades')}>Upgrades</button>
                </div>
                {activeTab === 'schedule' && (
                    <>
                        {isGrounded && (
                            <div className="mt-4 p-2 bg-red-900/50 border border-red-700 rounded text-center text-red-300 font-semibold">
                                GROUNDED ({groundedHoursLeft > 0 ? `${groundedHoursLeft}h remaining` : 'Resuming soon'})
                            </div>
                        )}
                        <div className="mt-4">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-1 mb-2">
                                <Tooltip text="The weekly flight plan for this aircraft. Schedules carry over week-to-week." isHelpModeActive={isHelpModeActive}>
                                    <h4 className="font-bold text-gray-200">Weekly Schedule</h4>
                                </Tooltip>
                                {!schedulesLocked && (
                                    <div className="flex items-center space-x-3">
                                        <button id="auto-schedule-button" onClick={() => onAutoSchedule(selectedAircraft.id)} className="text-xs text-yellow-400 hover:text-yellow-300 font-semibold">
                                            {schedule.length > 0 ? 'Auto-Reschedule' : 'Auto-Schedule'}
                                        </button>
                                        {canReturnHome && <button onClick={() => onScheduleReturnToBase(selectedAircraft.id)} className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">Return to Base</button>}
                                        {schedule.length > 0 && <button onClick={() => onClearSchedule(selectedAircraft.id)} className="text-xs text-red-500 hover:text-red-400 font-semibold">Clear All</button>}
                                    </div>
                                )}
                            </div>
                            <div id="info-panel-schedule-list" className="max-h-48 overflow-y-auto text-sm pr-2 space-y-1">
                            {schedule.length > 0 ? schedule.map((leg, index) => {
                                const delay = leg.delayHours || 0;
                                return (
                                    <div key={index} className={`p-2 bg-gray-800/50 rounded ${!schedulesLocked ? 'cursor-pointer hover:bg-gray-800' : ''}`} onClick={() => !schedulesLocked && handleAnalyzeClick(index)}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-300">{leg.origin} &rarr; {leg.destination}</p>
                                                <p className="text-xs text-gray-400">
                                                    Depart: {formatTimeValue(leg.departureTime)}h | Arrive: {formatTimeValue(leg.arrivalTime)}h
                                                    {delay > 0 && <span className="text-yellow-400 font-bold ml-2">Delayed +{delay.toFixed(1)}h</span>}
                                                </p>
                                            </div>
                                            {index === schedule.length - 1 && !schedulesLocked && (<button onClick={(e) => { e.stopPropagation(); onRemoveLastFlightLeg(selectedAircraft.id); }} className="text-red-500 hover:text-red-400 font-bold text-xl px-2 rounded-full">&times;</button>)}
                                        </div>
                                        <div className="mt-2">
                                            <Tooltip text="Adjust ticket prices for this flight. Lower fares attract more passengers on competitive routes but reduce revenue per passenger." isHelpModeActive={isHelpModeActive}>
                                                <label className="text-xs text-gray-400">Fare: <span className="font-bold text-white">{Math.round((leg.fareMultiplier || 1.0) * 100)}%</span></label>
                                                <input type="range" min="0.8" max="1.2" step="0.01" value={leg.fareMultiplier || 1.0} onChange={(e) => { e.stopPropagation(); onSetFareMultiplier(selectedAircraft.id, index, parseFloat(e.target.value)); }} onClick={e => e.stopPropagation()} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50" disabled={schedulesLocked} />
                                            </Tooltip>
                                        </div>
                                    </div>
                                );
                            }) : <p className="text-gray-500">{schedulesLocked ? "No schedule was locked-in for this aircraft." : "No flights scheduled."}</p>}
                            </div>
                            <p className="text-xs text-right mt-1 text-cyan-300">Total Scheduled Time: {scheduledBlockDuration.toFixed(1)} / 20 hours</p>
                        </div>
                        {!schedulesLocked && !isGrounded && (
                            <div className="mt-4">
                                <h4 className="font-bold border-b border-gray-700 pb-1 mb-2 text-gray-200">{isScheduleComplete ? 'Schedule Complete' : 'Add Next Flight'}</h4>
                                {isScheduleComplete ? (<p className="text-sm text-center text-gray-400 p-4 bg-gray-800/50 rounded-md">This aircraft's daily schedule is complete and ends at its home base.</p>) : (
                                    <div className="flex space-x-2">
                                        <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} className="flex-grow bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm">
                                            <option value="" disabled>Select a destination...</option>
                                            {availableRoutes.map(route => {
                                                const color = getDemandColor(route.currentDemand);
                                                const demandText = getDemandText(route.currentDemand);
                                                return (<option key={`${route.origin}-${route.destination}`} value={`${route.origin} - ${route.destination}`} style={{ color: color, backgroundColor: '#1f2937' }}>{route.destination} ({formatTimeValue(route.durationHours)}) - {demandText}</option>);
                                            })}
                                        </select>
                                        <button onClick={handleAddFlight} disabled={!selectedRoute} className="px-4 py-2 bg-cyan-600 rounded text-white font-bold hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed">Add</button>
                                    </div>
                                )}
                            </div>
                        )}
                        {!schedulesLocked && selectedAircraft.status === 'LANDED' && !isRebasing && (
                                <div className="mt-4">
                                    <button 
                                        onClick={() => {
                                            setIsRebasing(true);
                                            setNewBaseSelection(selectedAircraft.homeBase);
                                        }}
                                        className="w-full text-xs bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-2 rounded"
                                    >
                                        Rebase Aircraft...
                                    </button>
                                </div>
                            )}
                            {isRebasing && (
                                <div className="mt-4 p-3 bg-gray-800 rounded-md border border-gray-600">
                                    <h4 className="font-bold text-gray-200 mb-2">Select New Home Base</h4>
                                    <div className="flex space-x-2">
                                        <select 
                                            value={newBaseSelection} 
                                            onChange={(e) => setNewBaseSelection(e.target.value)} 
                                            className="flex-grow bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm"
                                        >
                                            {airports.map(ap => <option key={ap.code} value={ap.code}>{ap.name} ({ap.code})</option>)}
                                        </select>
                                    </div>
                                    <div className="flex space-x-2 mt-2">
                                        <button
                                            onClick={() => {
                                                onRebaseAircraft(selectedAircraft.id, newBaseSelection);
                                                setIsRebasing(false);
                                            }}
                                            className="flex-1 px-4 py-2 bg-cyan-600 rounded text-white font-bold hover:bg-cyan-500 disabled:bg-gray-600 text-sm"
                                            disabled={!newBaseSelection || newBaseSelection === selectedAircraft.homeBase}
                                        >
                                            Confirm (Ground for 24h)
                                        </button>
                                        <button 
                                            onClick={() => setIsRebasing(false)}
                                            className="flex-1 px-4 py-2 bg-gray-600 rounded text-white font-bold hover:bg-gray-500 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                    </>
                )}
                {activeTab === 'history' && (() => {
                    const history = selectedAircraft.history || [];
                    const stats = history.reduce((acc, leg) => {
                        acc.miles += leg.miles; acc.passengers += leg.passengers; acc.revenue += leg.revenue; acc.cost += leg.cost; acc.profit += leg.profit; return acc;
                    }, { miles: 0, passengers: 0, revenue: 0, cost: 0, profit: 0 });

                    return (
                        <div className="mt-4">
                            <h4 className="font-bold text-gray-200 mb-2">Performance Summary</h4>
                            <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                                <div className="bg-gray-800/50 p-2 rounded"><p className="text-xs text-gray-400">Total Miles</p><p className="font-bold text-white">{Math.round(stats.miles).toLocaleString()} NM</p></div>
                                <div className="bg-gray-800/50 p-2 rounded"><p className="text-xs text-gray-400">Total Flights</p><p className="font-bold text-white">{history.length}</p></div>
                                <div className="bg-gray-800/50 p-2 rounded"><p className="text-xs text-gray-400">Total Passengers</p><p className="font-bold text-white">{stats.passengers.toLocaleString()}</p></div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                                <div className="bg-gray-800/50 p-2 rounded"><p className="text-xs text-gray-400">Total Revenue</p><p className="font-bold text-green-400">${Math.round(stats.revenue).toLocaleString()}</p></div>
                                <div className="bg-gray-800/50 p-2 rounded"><p className="text-xs text-gray-400">Total Costs</p><p className="font-bold text-red-400">${Math.round(stats.cost).toLocaleString()}</p></div>
                                <div className={`bg-gray-800/50 p-2 rounded`}><p className="text-xs text-gray-400">Net Profit</p><p className={`font-bold ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>${Math.round(stats.profit).toLocaleString()}</p></div>
                            </div>
                            <h4 className="font-bold text-gray-200 mb-2 mt-4 border-t border-gray-700 pt-3">Completed Flights Log</h4>
                            <div className="max-h-64 overflow-y-auto pr-2 text-sm space-y-2">
                            {[...history].reverse().map((leg, index) => {
                                const breakdown = leg.costBreakdown;
                                const tooltip = breakdown
                                    ? `Fuel: $${breakdown.fuel.toLocaleString()}\nMaint: $${breakdown.maintenance.toLocaleString()}\nStaff: $${breakdown.staff.toLocaleString()}\nMeals: $${breakdown.mealService.toLocaleString()}`
                                    : 'No cost breakdown available.';
                                return (
                                    <div key={index} className="p-2 bg-gray-800/50 rounded">
                                        <div className="flex justify-between items-center font-semibold"><p className="text-gray-300">{leg.origin} &rarr; {leg.destination}</p><p className={`font-bold ${leg.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{leg.profit >= 0 ? '+' : ''}${Math.round(leg.profit).toLocaleString()}</p></div>
                                        <div className="text-xs text-gray-400 mt-1 grid grid-cols-4 gap-x-2">
                                            <span>PAX: {leg.passengers}</span>
                                            <span>Rev: ${Math.round(leg.revenue).toLocaleString()}</span>
                                            <span className="cursor-help" title={tooltip}>Cost: ${Math.round(leg.cost).toLocaleString()}</span>
                                            <span>Dist: {Math.round(leg.miles)} NM</span>
                                        </div>
                                    </div>
                                );
                            })}
                            {history.length === 0 && <p className="text-gray-500 text-center py-4">No completed flights.</p>}
                            </div>
                        </div>
                    );
                })()}
                {activeTab === 'upgrades' && (
                    <div className="mt-4 space-y-3">
                        <h4 className="font-bold text-gray-200">Aircraft Upgrades</h4>
                        
                        {/* IFE Upgrade */}
                        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-md">
                            <div className="flex items-center space-x-3">
                                <IFEIcon className="w-6 h-6 text-purple-400" />
                                <div>
                                    <p className="font-semibold text-white">In-Flight Entertainment</p>
                                    <p className="text-xs text-gray-400">Boosts passenger satisfaction on long flights.</p>
                                </div>
                            </div>
                            {selectedAircraft.hasIFE ? (
                                <span className="font-bold text-green-400">Installed</span>
                            ) : (
                                <button
                                    onClick={() => onUpgradeAircraft(selectedAircraft.id, 'IFE')}
                                    disabled={playerCash < UPGRADE_COST.IFE}
                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                                >
                                    Install (${UPGRADE_COST.IFE.toLocaleString()})
                                </button>
                            )}
                        </div>

                        {/* WiFi Upgrade */}
                        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-md">
                            <div className="flex items-center space-x-3">
                                <WifiIcon className="w-6 h-6 text-green-400" />
                                <div>
                                    <p className="font-semibold text-white">On-board Wi-Fi</p>
                                    <p className="text-xs text-gray-400">Attracts business travelers.</p>
                                </div>
                            </div>
                            {selectedAircraft.hasWifi ? (
                                <span className="font-bold text-green-400">Installed</span>
                            ) : (
                                <button
                                    onClick={() => onUpgradeAircraft(selectedAircraft.id, 'WIFI')}
                                    disabled={playerCash < UPGRADE_COST.WIFI}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white font-bold rounded disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                                >
                                    Install (${UPGRADE_COST.WIFI.toLocaleString()})
                                </button>
                            )}
                        </div>

                        {/* Meal Service Upgrade */}
                        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-md">
                            <div className="flex items-center space-x-3">
                                <MealIcon className="w-6 h-6 text-orange-400" />
                                <div>
                                    <p className="font-semibold text-white">Meal Service</p>
                                    <p className="text-xs text-gray-400">Improves overall passenger experience.</p>
                                </div>
                            </div>
                            {selectedAircraft.hasMealService ? (
                                <span className="font-bold text-green-400">Installed</span>
                            ) : (
                                <button
                                    onClick={() => onUpgradeAircraft(selectedAircraft.id, 'MEAL')}
                                    disabled={playerCash < UPGRADE_COST.MEAL}
                                    className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                                >
                                    Install (${UPGRADE_COST.MEAL.toLocaleString()})
                                </button>
                            )}
                        </div>

                    </div>
                )}
            </div>
        );
        }

        if (selectedAirport) {
            const routesWithDemand = routes.filter(r => r.origin === selectedAirport.code).map(route => ({...route, currentDemand: getDemandForHour(route, hour)})).sort((a, b) => b.currentDemand - a.currentDemand);
            const dailyNegativeEvent = gameEvents.find(d => ['strike', 'weather'].includes(d.type) && d.target === selectedAirport.code);
            const dailyPositiveEvent = gameEvents.find(d => ['concert', 'sports', 'conference'].includes(d.type) && d.target === selectedAirport.code);
            const forecastForAirport = weeklyForecast.filter(e => e.target === selectedAirport.code);
            const assignedDispatcher = staff.dispatchers.find(d => d.assignedTo === selectedAirport.code);
            const availableDispatchers = staff.dispatchers.filter(d => d.assignedTo === null);
            
            return (
                <div>
                    <h3 className="text-xl font-bold text-white">{selectedAirport.name} ({selectedAirport.code})</h3>
                    <p className="text-sm text-gray-400">{selectedAirport.city}, {selectedAirport.country}</p>
                    {selectedAirport.hubStatus && (<div className="mt-3 p-3 bg-cyan-900/50 border border-cyan-700 rounded-md">
                        <h4 className="font-bold text-cyan-400 flex items-center"><HubIcon type={selectedAirport.hubStatus} className="w-5 h-5 mr-2" />{selectedAirport.hubStatus === 'large' ? 'Large Hub' : 'Small Hub'}</h4>
                        <ul className="text-sm text-gray-300 list-disc list-inside mt-2">
                            <li>+{selectedAirport.hubStatus === 'large' ? '25%' : '10%'} Passenger Demand</li>
                            <li>-{selectedAirport.hubStatus === 'large' ? '15%' : '5%'} Operating Costs</li>
                        </ul>
                        {assignedDispatcher ? (
                            <div className="mt-3 text-center bg-gray-800 p-2 rounded">
                                <p className="text-sm text-green-300 font-semibold flex items-center justify-center space-x-2"><DispatcherIcon className="w-4 h-4" /><span>Dispatcher Lvl {assignedDispatcher.level}</span></p>
                                <button onClick={() => onUnassignStaff(assignedDispatcher.id)} className="text-xs hover:text-white text-gray-400">Unassign</button>
                            </div>
                        ) : (
                            <select onChange={(e) => onAssignStaff(e.target.value, selectedAirport.code)} value="" className="mt-3 w-full text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-2 rounded">
                                <option value="" disabled>Assign Dispatcher ({availableDispatchers.length})</option>
                                {availableDispatchers.map(d => <option key={d.id} value={d.id}>Disp {d.id.slice(0, 4)} (Lvl {d.level})</option>)}
                            </select>
                        )}
                    </div>)}
                    {selectedAirport.aiHubAirline && (<div className="mt-3 p-2 bg-red-900/50 border border-red-700 rounded text-center text-red-300 text-sm font-semibold">Hub for competitor airline {selectedAirport.aiHubAirline}</div>)}
                    {dailyNegativeEvent && <div className="mt-3 p-2 bg-yellow-900/50 border border-yellow-700 rounded text-center text-yellow-300 text-sm font-semibold">{dailyNegativeEvent.description}</div>}
                    {dailyPositiveEvent && <div className="mt-3 p-2 bg-cyan-900/50 border border-cyan-700 rounded text-center text-cyan-300 text-sm font-semibold">{dailyPositiveEvent.description}</div>}
                    
                    {!schedulesLocked && forecastForAirport.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-bold border-b border-gray-700 pb-1 mb-2 text-gray-200">Weekly Forecast</h4>
                            <div className="max-h-40 overflow-y-auto pr-2 space-y-1 text-sm">
                                {Array.from({ length: 7 }, (_, i) => i + 1).map(day => {
                                    const eventsOnDay = forecastForAirport.filter(e => e.day === day);
                                    if (eventsOnDay.length === 0) return null;
                                    return (
                                        <div key={day}>
                                            <p className="font-bold text-gray-400">Day {day}:</p>
                                            <ul className="list-disc list-inside ml-2">
                                                {eventsOnDay.map((event, idx) => (
                                                    <li key={idx} className={event.type === 'weather' ? 'text-yellow-400' : 'text-cyan-400'}>
                                                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                                        {event.probability && ` (${Math.round(event.probability * 100)}% chance)`}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-4"><h4 className="font-bold border-b border-gray-700 pb-1 mb-2 text-gray-200">Daily Demand Viewer</h4><label htmlFor="time-slider" className="block text-sm text-gray-400 mb-1">Time of Day: <span className="font-bold text-cyan-400">{String(hour).padStart(2, '0')}:00</span></label><input id="time-slider" type="range" min="0" max="23" value={hour} onChange={(e) => setHour(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" /></div>
                    <div className="mt-3"><h4 className="font-bold text-gray-200 mb-2">Outgoing Routes</h4><div className="max-h-80 overflow-y-auto pr-2 space-y-1 text-sm">
                        {routesWithDemand.map(route => {
                            const demandColor = getDemandColor(route.currentDemand);
                            const demandText = getDemandText(route.currentDemand);
                            return (<div key={route.destination} className="p-2 bg-gray-800/50 rounded flex justify-between items-center"><div><p className="font-semibold text-gray-300">&rarr; {route.destination}</p><p className="text-xs text-gray-400">Duration: {formatTimeValue(route.durationHours)}</p></div><span className="font-bold" style={{ color: demandColor }}>{demandText}</span></div>);
                        })}
                        {routesWithDemand.length === 0 && <p className="text-gray-500 text-center py-4">No outgoing routes.</p>}
                    </div></div>
                </div>
            );
        }

        if (selectedRadar) return (<div><h3 className="text-xl font-bold text-white">{selectedRadar.name}</h3><p className="text-sm text-gray-400">Range: {selectedRadar.range} NM</p><p className={`mt-2 text-sm font-semibold ${selectedRadar.isActive ? 'text-green-400' : 'text-red-400'}`}>Status: {selectedRadar.isActive ? 'Active' : 'Inactive'}</p></div>);
        
        return null;
    } catch (error) {
        console.error("--- CUSTOM ERROR LOG: Info Panel Render Failure ---");
        console.error("A recoverable error occurred while rendering the info panel. This is likely due to inconsistent state. The panel will show an error message, but the rest of the app should be stable.");
        console.error("Selected Aircraft ID:", selectedAircraftId);
        console.error("Selected Airport:", selectedAirport);
        console.error("Full Error Object:", error);
        console.error("--- END CUSTOM ERROR LOG ---");
        return <div className="p-4 text-red-400">Error rendering details. Please deselect and try again.</div>
    }
  };
  
  if (!selectedAirport && !selectedAircraftId && !selectedRadarId) return null;
  
  return (
    <div id="info-panel" className="relative w-full bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-gray-300">
       <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold leading-none">&times;</button>
      {renderContent()}
    </div>
  );
};

export default InfoPanel;
