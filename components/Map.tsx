import React from 'react';
import GoogleMapReact from 'google-map-react';
// FIX: Use `import type` for type-only imports.
import type { Airport, Aircraft, Radar, GameEvent, AircraftDisplayData } from '../types';
import AirportComponent from './AirportComponent';
import AircraftComponent from './AircraftComponent';
import RadarComponent from './RadarComponent';

interface MapProps {
  airports: Airport[];
  aircrafts: AircraftDisplayData[];
  radars: Radar[];
  gameEvents: GameEvent[];
  selectedAirport: Airport | null;
  selectedAircraftId: string | null;
  selectedRadarId: string | null;
  onSelectAirport: (code: string) => void;
  onSelectAircraft: (id: string) => void;
  onSelectRadar: (id: string) => void;
  onToggleRadarStatus: (id: string) => void;
  onMapClick: () => void;
}

const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
];

const Map: React.FC<MapProps> = (props) => {
  const {
    airports, aircrafts, radars, gameEvents,
    selectedAircraftId, selectedRadarId,
    onSelectAirport, onSelectAircraft, onSelectRadar, onToggleRadarStatus, onMapClick
  } = props;

  const defaultProps = {
    center: { lat: 48.8566, lng: 15.3522 }, // Centered on Europe
    zoom: 5
  };
  
  const mapOptions = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
  };

  const negativeEventTypes: GameEvent['type'][] = ['strike', 'weather'];
  const positiveEventTypes: GameEvent['type'][] = ['concert', 'sports', 'conference'];

  return (
    <div id="map-container" style={{ height: '100vh', width: '100%' }} onClick={onMapClick}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        options={mapOptions}
      >
        {radars.map(radar => (
          <RadarComponent
            key={radar.id}
            lat={radar.position.lat}
            lng={radar.position.lng}
            radar={radar}
            isSelected={selectedRadarId === radar.id}
            onSelect={onSelectRadar}
            onToggleStatus={onToggleRadarStatus}
          />
        ))}
        {airports.map(airport => {
          const isDisrupted = gameEvents.some(d => negativeEventTypes.includes(d.type) && d.target === airport.code);
          const hasPositiveEvent = gameEvents.some(d => positiveEventTypes.includes(d.type) && d.target === airport.code);
          return (
            <AirportComponent
              key={airport.code}
              lat={airport.position.lat}
              lng={airport.position.lng}
              airport={airport}
              onSelect={onSelectAirport}
              isDisrupted={isDisrupted}
              hasPositiveEvent={hasPositiveEvent}
              isAiHub={!!airport.aiHubAirline}
            />
          );
        })}
        {aircrafts.map(aircraft => {
           const isDisrupted = gameEvents.some(d => d.type === 'fault' && d.target === aircraft.id) || aircraft.status === 'GROUNDED';
           return (
              <AircraftComponent
                key={aircraft.id}
                lat={aircraft.position.lat}
                lng={aircraft.position.lng}
                aircraft={aircraft}
                isSelected={selectedAircraftId === aircraft.id}
                onSelect={onSelectAircraft}
                isDisrupted={isDisrupted}
              />
           );
        })}
      </GoogleMapReact>
    </div>
  );
};

export default Map;