
import React from 'react';

interface DispatcherIconProps {
  className?: string;
  title?: string;
}

const DispatcherIcon: React.FC<DispatcherIconProps> = ({ className, title }) => {
  return (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-label="Dispatcher Icon"
        title={title}
    >
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,7A2,2 0 0,0 10,9V11C10,12.11 10.9,13 12,13C13.11,13 14,12.11 14,11V9A2,2 0 0,0 12,7M17,14C17,15.68 15.7,17.11 14.08,17.45L15.11,19.5H8.89L9.92,17.45C8.3,17.11 7,15.68 7,14H9A3,3 0 0,0 12,17A3,3 0 0,0 15,14H17Z" />
    </svg>
  );
};

export default DispatcherIcon;
