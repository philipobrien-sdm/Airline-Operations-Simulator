import React from 'react';

interface CabinCrewIconProps {
  className?: string;
  title?: string;
}

const CabinCrewIcon: React.FC<CabinCrewIconProps> = ({ className, title }) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
        aria-label="Cabin Crew Icon"
        title={title}
    >
       <path d="M12,2A2,2 0 0,0 10,4C10,5.11 10.9,6 12,6C13.11,6 14,5.11 14,4A2,2 0 0,0 12,2M12,8C9.24,8 7,10.24 7,13V22H9V17H15V22H17V13C17,10.24 14.76,8 12,8Z" />
    </svg>
  );
};

export default CabinCrewIcon;
