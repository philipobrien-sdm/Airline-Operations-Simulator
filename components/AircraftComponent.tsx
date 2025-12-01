

import React from 'react';
// FIX: Use `import type` for type-only imports.
import type { AircraftDisplayData } from '../types';
import AircraftIcon from './icons/AircraftIcon';

interface AircraftComponentProps {
  aircraft: AircraftDisplayData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isDisrupted: boolean;
  // FIX: Add lat and lng props for GoogleMapReact. These are required for positioning the component on the map.
  lat: number;
  lng: number;
}

const AircraftComponent: React.FC<AircraftComponentProps> = ({ aircraft, isSelected, onSelect, isDisrupted }) => {
  let color = 'text-yellow-500'; // Default for AI
  if (aircraft.airline === 'PLAYER') {
    color = isDisrupted ? 'text-yellow-500' : 'text-cyan-400';
  }


  return (
    <div 
      className="relative group cursor-pointer"
      style={{ transform: 'translate(-50%, -50%)' }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(aircraft.id);
      }}
    >
      <AircraftIcon 
        className={`w-6 h-6 ${color} transition-all duration-300 ${isSelected ? 'scale-125' : 'group-hover:scale-110'}`}
        style={{ transform: `rotate(${aircraft.bearing - 90}deg)` }} 
      />
      {isSelected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          {aircraft.name || aircraft.id} ({aircraft.origin}-{aircraft.destination})
        </div>
      )}
    </div>
  );
};

export default AircraftComponent;