import React from 'react';
// FIX: Use `import type` for type-only imports.
import type { Airport } from '../types';
import HubIcon from './icons/HubIcon';

interface AirportComponentProps {
  airport: Airport;
  onSelect: (code: string) => void;
  isDisrupted: boolean;
  hasPositiveEvent: boolean;
  isAiHub: boolean;
  // FIX: Add lat and lng props for GoogleMapReact. These are required for positioning the component on the map.
  lat: number;
  lng: number;
}

const AirportComponent: React.FC<AirportComponentProps> = ({ airport, onSelect, isDisrupted, hasPositiveEvent, isAiHub }) => {
  let color = 'text-gray-400';
  if (hasPositiveEvent) color = 'text-cyan-400';
  else if (isDisrupted) color = 'text-yellow-400';
  else if (airport.isCovered) color = 'text-green-400';
  else color = 'text-red-500';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(airport.code);
  }

  const renderStatusIndicator = () => {
    if (isAiHub) {
        return <div className="w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-red-400" title={`Hub for ${airport.aiHubAirline}`} />;
    }

    let indicatorColorClasses = 'bg-gray-500/50 border-gray-400';
    if (hasPositiveEvent) indicatorColorClasses = 'bg-cyan-500/50 border-cyan-400';
    else if (isDisrupted) indicatorColorClasses = 'bg-yellow-500/50 border-yellow-400';
    else if (airport.isCovered) indicatorColorClasses = 'bg-green-500/50 border-green-400';
    else indicatorColorClasses = 'bg-red-500/50 border-red-400';

    return <div className={`w-2 h-2 rounded-full border ${indicatorColorClasses}`}></div>;
  };

  return (
    <div className="relative group flex flex-col items-center cursor-pointer" onClick={handleClick} style={{ transform: 'translate(-50%, -50%)' }}>
      <div className="flex items-center space-x-1">
        {airport.hubStatus && <HubIcon type={airport.hubStatus} className="w-3 h-3" />}
        {renderStatusIndicator()}
      </div>
      <div className={`mt-1 text-xs font-bold ${color} opacity-80 group-hover:opacity-100 whitespace-nowrap`}>
        {airport.code}
      </div>
    </div>
  );
};

export default AirportComponent;