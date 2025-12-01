import React, { useState } from 'react';
// FIX: Use `import type` for type-only imports.
import type { Aircraft, Airport } from '../types';
import AircraftIcon from './icons/AircraftIcon';
import Tooltip from './Tooltip';

interface FleetPanelProps {
  aircrafts: Aircraft[];
  selectedAircraftId: string | null;
  onSelectAircraft: (id: string) => void;
  getAirportByCode: (code: string) => Airport | undefined;
  isHelpModeActive: boolean;
}

const FleetPanel: React.FC<FleetPanelProps> = ({ aircrafts, selectedAircraftId, onSelectAircraft, getAirportByCode, isHelpModeActive }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div id="fleet-panel" className="w-full text-gray-300">
       <Tooltip text="A list of all aircraft in your fleet. Click an aircraft to view details and create schedules." isHelpModeActive={isHelpModeActive}>
          <div
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="cursor-pointer flex justify-between items-center text-lg font-bold border-b border-gray-700 pb-2 mb-4 text-white"
          >
            <h2>Your Fleet ({aircrafts.length})</h2>
            <span className={`transform transition-transform text-xl ${isCollapsed ? '-rotate-90' : 'rotate-90'}`}>›</span>
          </div>
       </Tooltip>

      {!isCollapsed && (
        <div className="max-h-60 overflow-y-auto pr-1">
          {aircrafts.length > 0 ? (
            <ul className="space-y-2">
              {aircrafts.map(ac => {
                const hasSchedule = ac.schedule && ac.schedule.length > 0;
                const statusConfig: Record<Aircraft['status'], string> = {
                    IN_FLIGHT: 'bg-yellow-500/20 text-yellow-400',
                    LANDED: 'bg-green-500/20 text-green-400',
                    GROUNDED: 'bg-red-500/20 text-red-400',
                    REPOSITIONING: 'bg-blue-500/20 text-blue-400',
                };

                return (
                <li
                  key={ac.id}
                  onClick={() => onSelectAircraft(ac.id)}
                  className={`cursor-pointer p-2 rounded text-sm transition-colors relative ${
                    selectedAircraftId === ac.id ? 'bg-cyan-600/50' : 'hover:bg-gray-800'
                  } ${!hasSchedule && ac.status !== 'GROUNDED' ? 'border border-red-500/50' : 'border border-transparent'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <AircraftIcon className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="font-bold">{ac.name || ac.id} <span className="text-gray-400 font-normal">({ac.type})</span></p>
                        <p className="text-xs text-gray-400">
                          {ac.status === 'LANDED' || ac.status === 'GROUNDED'
                            ? `At ${ac.destination}` 
                            : `${ac.origin} → ${ac.destination}`
                          }
                        </p>
                      </div>
                    </div>
                    {hasSchedule || ac.status === 'REPOSITIONING' ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[ac.status]}`}>
                        {ac.status.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-400 bg-red-900/80 px-2 py-0.5 rounded">
                        NO SCHEDULE
                      </span>
                    )}
                  </div>
                </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">You have no aircraft. Purchase one from the "Manage Fleet" menu.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FleetPanel;