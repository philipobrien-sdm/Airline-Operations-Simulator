import React, { useState, useEffect } from 'react';
import type { GameEvent } from '../types';

interface TickerProps {
  events: GameEvent[];
  onClick: () => void;
}

const Ticker: React.FC<TickerProps> = ({ events, onClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (events.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % events.length);
      }, 5000); // Change message every 5 seconds

      return () => clearInterval(interval);
    }
  }, [events]);

  if (events.length === 0) {
    return null;
  }

  const currentEvent = events[currentIndex];
  
  const isPositiveEvent = (event: GameEvent) => {
    if (event.type === 'fuel_price_change') {
        return event.value < 1.0;
    }
    return ['concert', 'sports', 'conference'].includes(event.type);
  }

  const isPositive = isPositiveEvent(currentEvent);

  const headerStyle = isPositive 
    ? "bg-cyan-500 text-gray-900" 
    : "bg-yellow-500 text-gray-900";
  const messageStyle = isPositive
    ? "text-cyan-200"
    : "text-yellow-200";
  const borderStyle = isPositive
    ? "border-cyan-500/30"
    : "border-yellow-500/30";


  return (
    <div onClick={onClick} className={`fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t ${borderStyle} h-10 flex items-center z-40 overflow-hidden cursor-pointer`}>
      <div className="w-full flex items-center">
        <div className={`${headerStyle} font-bold px-4 h-10 flex items-center flex-shrink-0`}>
          {isPositive ? 'EVENT' : 'ALERT'}
        </div>
        <div className="relative flex-1 h-full">
            <div className={`animate-ticker absolute whitespace-nowrap h-full flex items-center ${messageStyle}`}>
                <span className="mx-8">{currentEvent.description}</span>
            </div>
        </div>
      </div>
       <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: ticker 15s linear infinite;
          min-width: 100%;
        }
      `}</style>
    </div>
  );
};

export default Ticker;
