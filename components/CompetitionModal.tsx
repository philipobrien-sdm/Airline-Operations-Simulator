

import React, { useState, useMemo } from 'react';
import type { AiSchedules, FlightLeg, Aircraft, AircraftType, RouteStats } from '../types';
import SmileyHappyIcon from './icons/SmileyHappyIcon';
import SmileyNeutralIcon from './icons/SmileyNeutralIcon';
import SmileySadIcon from './icons/SmileySadIcon';

interface CompetitionModalProps {
  schedules: AiSchedules;
  playerAircrafts: Aircraft[];
  aircraftTypes: Record<string, AircraftType>;
  playerCash: number;
  aiSatisfaction: Record<string, Record<string, number>>;
  playerSatisfaction: Record<string, RouteStats>;
  onClose: () => void;
  onAnalyzePlayerLeg?: (aircraftId: string, legIndex: number) => void; // Made optional for safety
  onLaunchMarketingCampaign: (origin: string, destination: string) => void;
  getPassengerPoolForRoute: (origin: string, destination: string, time: number) => number;
}

const CompetitionModal: React.FC<CompetitionModalProps> = ({ 
    schedules, playerAircrafts, aircraftTypes, playerCash, aiSatisfaction, playerSatisfaction,
    onClose, onAnalyzePlayerLeg, onLaunchMarketingCampaign, getPassengerPoolForRoute
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'at-risk'>('overview');
  const airlineCodes = useMemo(() => Object.keys(schedules).sort(), [schedules]);
  const [selectedAirline, setSelectedAirline] = useState<string | null>(airlineCodes[0] || null);
  const [selectedAircraftIndex, setSelectedAircraftIndex] = useState<number>(0);

  const { airlinesWithConflicts, aircraftWithConflicts, conflictingAiLegs, avgSatisfactionByAirline, atRiskRoutes } = useMemo(() => {
    try {
        const airlinesWithConflicts = new Set<string>();
        const aircraftWithConflicts = new Set<string>(); // "airlineCode-aircraftIndex"
        const conflictingAiLegs = new Set<string>(); // "airlineCode-aircraftIndex-legIndex"
        const avgSatisfactionByAirline: Record<string, number> = {};
        const atRiskRoutes: any[] = [];

        const allPlayerLegs = playerAircrafts.flatMap(ac => (ac.schedule || []).map((leg, index) => ({ ...leg, aircraft: ac, legIndex: index })));

        for (const airlineCode of airlineCodes) {
        const satisfactionScores = Object.values(aiSatisfaction[airlineCode] || {});
        // FIX: The type of `s` was inferred as `unknown`, causing a type error in the arithmetic operation. Explicitly casting `s` to a number ensures the operation is safe.
        const avgSatisfaction = satisfactionScores.reduce((sum: number, s) => sum + Number(s), 0) / (satisfactionScores.length || 1);
        avgSatisfactionByAirline[airlineCode] = avgSatisfaction;

        if (allPlayerLegs.length === 0) continue;

        const airlineSchedules = schedules[airlineCode] || [];
        airlineSchedules.forEach((aircraftSchedule, aircraftIndex) => {
            aircraftSchedule.forEach((aiLeg, aiLegIndex) => {
                allPlayerLegs.forEach(playerLeg => {
                    if (playerLeg.origin === aiLeg.origin && playerLeg.destination === aiLeg.destination && Math.abs(playerLeg.departureTime - aiLeg.departureTime) < 2) {
                        airlinesWithConflicts.add(airlineCode);
                        aircraftWithConflicts.add(`${airlineCode}-${aircraftIndex}`);
                        conflictingAiLegs.add(`${airlineCode}-${aircraftIndex}-${aiLegIndex}`);

                        const totalPassengerPool = getPassengerPoolForRoute(aiLeg.origin, aiLeg.destination, aiLeg.departureTime);
                        const aiAircraftType = aircraftTypes['A320'];
                        const playerAircraftType = aircraftTypes[playerLeg.aircraft.type];
                        const totalCapacity = (aiAircraftType?.capacity || 0) + (playerAircraftType?.capacity || 0);

                        if (totalCapacity > totalPassengerPool) {
                            const saturation = totalCapacity / totalPassengerPool;
                            let riskLevel = 'Low';
                            if (saturation > 1.5) riskLevel = 'High';
                            else if (saturation > 1.1) riskLevel = 'Medium';
                            
                            atRiskRoutes.push({
                                ...playerLeg,
                                riskLevel,
                                competitorAirline: airlineCode,
                                competitorDeparture: aiLeg.departureTime,
                                saturation,
                            });
                        }
                    }
                });
            });
        });
        }

        atRiskRoutes.sort((a,b) => b.saturation - a.saturation);

        return { airlinesWithConflicts, aircraftWithConflicts, conflictingAiLegs, avgSatisfactionByAirline, atRiskRoutes };
    } catch (error) {
        console.error("--- CUSTOM ERROR LOG: Competition Analysis Failure ---");
        console.error("A recoverable error occurred while calculating competitive conflicts. The display may be inaccurate but the UI will remain stable.");
        console.error("Full Error Object:", error);
        console.error("--- END CUSTOM ERROR LOG ---");
        return { airlinesWithConflicts: new Set(), aircraftWithConflicts: new Set(), conflictingAiLegs: new Set(), avgSatisfactionByAirline: {}, atRiskRoutes: [] };
    }
  }, [schedules, playerAircrafts, airlineCodes, aiSatisfaction, getPassengerPoolForRoute, aircraftTypes]);


  const selectedAirlineSchedules = selectedAirline ? schedules[selectedAirline] : [];
  const selectedSchedule = selectedAirlineSchedules ? selectedAirlineSchedules[selectedAircraftIndex] : [];
  
  const formatTime = (time: number | undefined) => (typeof time === 'number' ? time.toFixed(1).padStart(4, '0') : 'N/A');
  
  const handleSelectAirline = (code: string) => {
    setSelectedAirline(code);
    setSelectedAircraftIndex(0); // Reset to first aircraft when changing airline
  }
  
  const SatisfactionIcon = ({ score }: { score: number }) => {
    if (score > 65) return <SmileyHappyIcon className="w-4 h-4 text-green-400" title={`High Satisfaction (${score.toFixed(0)})`} />;
    if (score < 45) return <SmileySadIcon className="w-4 h-4 text-red-400" title={`Low Satisfaction (${score.toFixed(0)})`} />;
    return <SmileyNeutralIcon className="w-4 h-4 text-yellow-400" title={`Neutral Satisfaction (${score.toFixed(0)})`} />;
  };
  
  const renderOverviewTab = () => (
     <div className="flex-grow flex gap-4 overflow-hidden">
          {/* Airline List */}
          <div className="w-1/4 bg-gray-900/50 rounded-md p-2 overflow-y-auto">
            <h3 className="font-bold text-yellow-400 p-2 border-b border-gray-700 mb-2">Airlines</h3>
            <ul className="space-y-1">
              {airlineCodes.map(code => {
                const hasConflict = airlinesWithConflicts.has(code);
                return (
                    <li
                    key={code}
                    onClick={() => handleSelectAirline(code)}
                    className={`relative cursor-pointer p-2 rounded text-sm font-semibold transition-colors flex justify-between items-center ${
                        selectedAirline === code ? 'bg-yellow-600/50 text-white' : 'hover:bg-gray-700 text-gray-300'
                    } ${hasConflict && selectedAirline !== code ? 'text-red-300' : ''}`}
                    >
                    <span className="flex items-center space-x-2">
                        <SatisfactionIcon score={avgSatisfactionByAirline[code] || 50} />
                        <span>{code}</span>
                    </span>
                    {hasConflict && <div className="w-2 h-2 bg-red-500 rounded-full" title="Flights conflict with your schedule"></div>}
                    </li>
                );
              })}
            </ul>
          </div>

          {/* Schedule Display */}
          <div className="w-3/4 bg-gray-900/50 rounded-md p-4 flex flex-col">
            {selectedAirline ? (
              <>
                <h3 className="text-xl font-bold text-white mb-2">
                    Daily Schedule for {selectedAirline}
                </h3>
                <div className="flex space-x-2 mb-4 border-b border-gray-700 pb-2 flex-wrap gap-y-2">
                    {selectedAirlineSchedules.map((_, index) => {
                        const hasConflict = aircraftWithConflicts.has(`${selectedAirline}-${index}`);
                        return (
                            <button key={index} onClick={() => setSelectedAircraftIndex(index)}
                            className={`px-3 py-1 text-sm rounded transition-colors ${selectedAircraftIndex === index ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700'} ${hasConflict ? 'ring-2 ring-red-500' : ''}`}>
                                Aircraft {index + 1}
                            </button>
                        )
                    })}
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="space-y-2 text-sm">
                        {selectedSchedule && selectedSchedule.length > 0 ? selectedSchedule.map((leg, index) => {
                             const playerSatisfactionOnRoute = playerSatisfaction[`${leg.origin}-${leg.destination}`]?.satisfaction || 50;
                             const aiSatisfactionOnRoute = aiSatisfaction[selectedAirline]?.[`${leg.origin}-${leg.destination}`] || 50;
                             const playerFavored = playerSatisfactionOnRoute > aiSatisfactionOnRoute;
                             const isConflicting = selectedAirline ? conflictingAiLegs.has(`${selectedAirline}-${selectedAircraftIndex}-${index}`) : false;

                            return (
                                <div key={index} className={`p-2 rounded transition-colors ${ isConflicting ? 'bg-red-900/50 border border-red-500/50' : 'bg-gray-800/70'}`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-1 h-4 rounded-full ${playerFavored ? 'bg-cyan-400' : 'bg-red-400'}`} title={`Passenger Preference: ${playerFavored ? 'You' : selectedAirline}`}></div>
                                            <p className="font-semibold text-gray-300">{leg.origin} &rarr; {leg.destination}</p>
                                        </div>
                                        <div className="font-mono text-xs bg-gray-900 px-2 py-1 rounded">
                                            {formatTime(leg.departureTime)}h - {formatTime(leg.arrivalTime)}h
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-gray-500 text-center py-10">No schedule found for this aircraft.</p>
                        )}
                    </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Select an airline to view its schedule.</p>
              </div>
            )}
          </div>
        </div>
  );
  
  const renderAtRiskTab = () => (
     <div className="flex-grow overflow-y-auto pr-2">
        <p className="text-sm text-gray-400 mb-4">Showing your routes that are directly competing with AI flights on routes with more total seat capacity than passenger demand.</p>
        <div className="space-y-2">
          {atRiskRoutes.length > 0 ? atRiskRoutes.map((route, index) => {
            const riskColor = route.riskLevel === 'High' ? 'border-red-500' : route.riskLevel === 'Medium' ? 'border-yellow-500' : 'border-green-500';
            const riskTextColor = route.riskLevel === 'High' ? 'text-red-400' : route.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400';
            return (
              <div key={index} className={`p-3 bg-gray-900/50 rounded-md border-l-4 ${riskColor}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-white">{route.origin} &rarr; {route.destination}</p>
                        <p className="text-xs text-gray-400">Your flight: <span className="font-semibold text-gray-300">{route.aircraft.name}</span> at {formatTime(route.departureTime)}h</p>
                    </div>
                    <div className="text-right">
                        <p className={`font-bold ${riskTextColor}`}>{route.riskLevel} Risk</p>
                        <p className="text-xs text-gray-400">vs. {route.competitorAirline} at {formatTime(route.competitorDeparture)}h</p>
                    </div>
                </div>
                <div className="flex space-x-2 mt-3">
                    <button onClick={() => onAnalyzePlayerLeg && onAnalyzePlayerLeg(route.aircraft.id, route.legIndex)} className="flex-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-1 px-2 rounded">Analyze & Adjust Fare</button>
                    <button onClick={() => onLaunchMarketingCampaign(route.origin, route.destination)} disabled={playerCash < 50000} className="flex-1 text-xs bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-1 px-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed">Launch Marketing</button>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-10">
              <SmileyHappyIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-400">No highly contested routes found. Good work!</p>
            </div>
          )}
        </div>
     </div>
  );

  return (
    <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-full max-w-5xl h-[80vh] bg-gray-800 border-2 border-yellow-500/30 rounded-lg shadow-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Competition Analysis</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="flex border-b border-gray-700 mb-4 flex-shrink-0">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'overview' ? 'border-b-2 border-yellow-400 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                Schedules Overview
            </button>
            <button onClick={() => setActiveTab('at-risk')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'at-risk' ? 'border-b-2 border-yellow-400 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                At-Risk Routes ({atRiskRoutes.length})
            </button>
        </div>

        {activeTab === 'overview' ? renderOverviewTab() : renderAtRiskTab()}
      </div>
    </div>
  );
};

export default CompetitionModal;