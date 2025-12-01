import React, { useState, useEffect } from 'react';
import type { AircraftType, Airport, RouteDemand } from '../types';
import { calculateDistanceNM } from '../utils';

interface FleetManagementModalProps {
  playerCash: number;
  aircraftTypes: Record<string, AircraftType>;
  airports: Airport[];
  routes: RouteDemand[];
  revenuePerMile: number;
  onBuyAircraft: (type: string, homeBaseCode: string, name: string) => void;
  onClose: () => void;
}

type ProfitLevel = 'high' | 'medium' | 'low' | 'none';

const ProfitIndicator: React.FC<{ level: ProfitLevel }> = ({ level }) => {
    const config = {
        high: { color: '#4ade80', text: 'High' },
        medium: { color: '#facc15', text: 'Medium' },
        low: { color: '#f87171', text: 'Low' },
        none: { color: '#6b7280', text: 'N/A' },
    };

    const { color, text } = config[level];

    return (
        <div className="flex items-center space-x-2" title={`Profit Potential: ${text}`}>
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
            <span className="text-xs text-gray-400">{text}</span>
        </div>
    );
};

const FleetManagementModal: React.FC<FleetManagementModalProps> = ({ 
    playerCash, 
    aircraftTypes, 
    airports,
    routes,
    revenuePerMile,
    onBuyAircraft, 
    onClose 
}) => {
  const [selectedHomeBase, setSelectedHomeBase] = useState<string>(airports[0]?.code || "");
  const [aircraftName, setAircraftName] = useState('');
  const [profitability, setProfitability] = useState<Record<string, ProfitLevel>>({});

  useEffect(() => {
    if (!selectedHomeBase || !routes || routes.length === 0) return;

    const homeBaseAirport = airports.find(ap => ap.code === selectedHomeBase);
    if (!homeBaseAirport) return;

    const newProfitability: Record<string, ProfitLevel> = {};

    Object.keys(aircraftTypes).forEach(type => {
        const aircraftType = aircraftTypes[type];

        const validRoutes = routes.filter(route => {
            if (route.origin !== selectedHomeBase) return false;
            const destAirport = airports.find(ap => ap.code === route.destination);
            if (!destAirport) return false;
            const distance = calculateDistanceNM(homeBaseAirport.position, destAirport.position);
            return distance <= aircraftType.range;
        });

        if (validRoutes.length === 0) {
            newProfitability[type] = 'none';
            return;
        }

        const routeProfits = validRoutes.map(route => {
            const destAirport = airports.find(ap => ap.code === route.destination);
            if (!destAirport) return 0;

            const distance = calculateDistanceNM(homeBaseAirport.position, destAirport.position);
            const avgDemand = (route.demand.morning + route.demand.afternoon + route.demand.evening) / 3;
            const passengers = Math.floor(aircraftType.capacity * avgDemand);
            
            const revenue = passengers * distance * revenuePerMile;
            const cost = distance * (aircraftType.fuelPerNm + aircraftType.baseMaintenancePerNm);
            return revenue - cost;
        });

        const avgProfit = routeProfits.reduce((sum, profit) => sum + profit, 0) / routeProfits.length;

        if (avgProfit > 5000) {
            newProfitability[type] = 'high';
        } else if (avgProfit > 1500) {
            newProfitability[type] = 'medium';
        } else {
            newProfitability[type] = 'low';
        }
    });

    setProfitability(newProfitability);

  }, [selectedHomeBase, airports, routes, aircraftTypes, revenuePerMile]);


  const handleBuy = (type: string) => {
    onBuyAircraft(type, selectedHomeBase, aircraftName);
    setAircraftName(''); // Reset for next purchase
  };

  return (
    <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-50" onClick={onClose}>
      <div id="fleet-management-modal" className="w-full max-w-4xl bg-gray-800 border-2 border-cyan-500/30 rounded-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
            <h2 className="text-2xl font-bold text-white">Fleet Management</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-3 rounded-md mb-4">
            <div>
              <label htmlFor="homeBase" className="font-semibold text-gray-300 block mb-1">Assign Home Base:</label>
              <select
                  id="homeBase"
                  value={selectedHomeBase}
                  onChange={(e) => setSelectedHomeBase(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm"
              >
                  {airports.map(ap => <option key={ap.code} value={ap.code}>{ap.name} ({ap.code})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="aircraftName" className="font-semibold text-gray-300 block mb-1">Aircraft Name (Optional):</label>
              <input
                  id="aircraftName"
                  type="text"
                  value={aircraftName}
                  onChange={(e) => setAircraftName(e.target.value)}
                  placeholder="e.g., Spirit of Paris"
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm"
              />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {Object.keys(aircraftTypes).map((type) => {
            const ac = aircraftTypes[type];
            const canAfford = playerCash >= ac.cost;
            const canBuy = canAfford && !!selectedHomeBase;
            return (
              <div key={type} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-cyan-400">{ac.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">({type})</p>
                  <p className="text-lg font-semibold text-green-400">${ac.cost.toLocaleString()}</p>
                  <ul className="text-sm text-gray-300 mt-2 space-y-1">
                    <li>Range: {ac.range.toLocaleString()} NM</li>
                    <li>Speed: {ac.speed} knots</li>
                    <li>Capacity: {ac.capacity} pax</li>
                  </ul>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <button 
                      onClick={() => handleBuy(type)}
                      disabled={!canBuy}
                      className="px-4 py-2 bg-cyan-600 rounded text-white font-bold hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                      title={!selectedHomeBase ? 'Select a home airport first' : !canAfford ? 'Not enough cash' : `Buy for $${ac.cost.toLocaleString()}`}
                    >
                      Purchase
                    </button>
                    <ProfitIndicator level={profitability[type] || 'none'} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default FleetManagementModal;