import React from 'react';
// FIX: Use `import type` for type-only imports.
import type { Radar } from '../types';

interface RadarComponentProps {
  radar: Radar;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  // FIX: Add lat and lng props for GoogleMapReact. These are required for positioning the component on the map.
  lat: number;
  lng: number;
}

const RadarComponent: React.FC<RadarComponentProps> = ({ radar, isSelected, onSelect, onToggleStatus }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(radar.id);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleStatus(radar.id);
  }

  const centerColor = radar.isActive 
    ? (isSelected ? '#06b6d4' : '#4ade80')
    : '#ef4444'; // Red for inactive

  const bgColor = radar.isActive
    ? (isSelected ? 'rgba(6, 182, 212, 0.5)' : 'rgba(74, 222, 128, 0.3)')
    : 'rgba(239, 68, 68, 0.4)';


  return (
    <div
      className="relative group cursor-pointer"
      onClick={handleClick}
      onContextMenu={handleRightClick}
      style={{ transform: 'translate(-50%, -50%)' }} // Center on position
    >
      <div
        className="w-4 h-4 rounded-full border-2"
        style={{
          borderColor: centerColor,
          backgroundColor: bgColor,
          boxShadow: isSelected ? `0 0 10px ${centerColor}` : 'none',
          transition: 'all 0.3s ease',
        }}
        title={`${radar.name} (Right-click to toggle)`}
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full"></div>
    </div>
  );
};

export default RadarComponent;