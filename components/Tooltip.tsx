import React, { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  isHelpModeActive: boolean;
  children: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, isHelpModeActive, children }) => {
  if (!isHelpModeActive) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full mb-2 w-max max-w-xs left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 border border-cyan-400/50 shadow-lg">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;