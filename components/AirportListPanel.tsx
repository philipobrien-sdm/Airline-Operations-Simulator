import React, { useState } from 'react';
// FIX: Use `import type` for type-only imports.
import type { Airport } from '../types';
import HubIcon from './icons/HubIcon';
import Tooltip from './Tooltip';

interface AirportListPanelProps {
  airports: Airport[];
  onSelectAirport: (code: string) => void;
  selectedAirport: Airport | null;
  isHelpModeActive: boolean;
}

const AirportListPanel: React.FC<AirportListPanelProps> = ({ airports, onSelectAirport, selectedAirport, isHelpModeActive }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="w-full text-gray-300">
       <Tooltip text="A list of all airports. Click one to view its details and outgoing route demand." isHelpModeActive={isHelpModeActive}>
          <div
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="cursor-pointer flex justify-between items-center text-lg font-bold border-b border-gray-700 pb-2 mb-4 text-white"
          >
            <h2>Airports</h2>
            <span className={`transform transition-transform text-xl ${isCollapsed ? '-rotate-90' : 'rotate-90'}`}>›</span>
          </div>
       </Tooltip>
      {!isCollapsed && (
        <div className="max-h-96 overflow-y-auto pr-1">
          <ul className="space-y-1">
            {airports.map(airport => (
              <li
                key={airport.code}
                onClick={() => onSelectAirport(airport.code)}
                className={`cursor-pointer p-2 rounded text-sm transition-colors ${
                  selectedAirport?.code === airport.code ? 'bg-cyan-600/50' : 'hover:bg-gray-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                      {airport.hubStatus && <HubIcon type={airport.hubStatus} className="w-4 h-4" />}
                      <span className="font-bold">{airport.code}</span>
                  </div>
                  <span className="text-gray-400">{airport.city}</span>
                  <span className={`w-3 h-3 rounded-full ${airport.isCovered ? 'bg-green-500' : 'bg-red-500'}`} title={airport.isCovered ? 'In Radar Range' : 'Out of Radar Range'}></span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AirportListPanel;