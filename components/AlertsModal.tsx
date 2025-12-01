import React from 'react';
import type { GameEvent } from '../types';

interface AlertsModalProps {
  events: GameEvent[];
  onClose: () => void;
}

const isPositiveEvent = (event: GameEvent) => {
    if (event.type === 'fuel_price_change') {
        return event.value < 1.0;
    }
    return ['concert', 'sports', 'conference'].includes(event.type);
};

const AlertsModal: React.FC<AlertsModalProps> = ({ events, onClose }) => {
  return (
    <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-full max-w-2xl bg-gray-800 border-2 border-yellow-500/30 rounded-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-white">Current Alerts & Events</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2">
          {events.length > 0 ? (
            events.map((event, index) => {
              const isPositive = isPositiveEvent(event);
              return (
                <div key={index} className={`p-3 rounded-md border ${isPositive ? 'bg-cyan-900/30 border-cyan-700/50' : 'bg-yellow-900/30 border-yellow-700/50'}`}>
                  <p className={`font-semibold ${isPositive ? 'text-cyan-300' : 'text-yellow-300'}`}>
                    {event.description}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-8">No current alerts or events.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsModal;
