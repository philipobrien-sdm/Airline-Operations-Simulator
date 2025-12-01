import React from 'react';

interface PilotIconProps {
  className?: string;
  title?: string;
}

const PilotIcon: React.FC<PilotIconProps> = ({ className, title }) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
        aria-label="Pilot Icon"
        title={title}
    >
      <path d="M12,2A2,2,0,0,0,10,4V5A2,2,0,0,0,8,7V9.5A2.5,2.5,0,0,0,10.5,12A2.5,2.5,0,0,0,13,9.5V7A2,2,0,0,0,11,5V4A2,2,0,0,0,12,2M19.5,8H22V10H19.5A3.5,3.5,0,0,1,16,13.5V15.5H13V14.5L12,14L11,14.5V15.5H8V13.5A3.5,3.5,0,0,1,4.5,10H2V8H4.5A3.5,3.5,0,0,1,8,4.5H9V5A2,2,0,0,0,11,7H13A2,2,0,0,0,15,5V4.5H16A3.5,3.5,0,0,1,19.5,8M8,17.5V22H10V20H14V22H16V17.5A3.5,3.5,0,0,1,12.5,14H11.5A3.5,3.5,0,0,1,8,17.5Z" />
    </svg>
  );
};

export default PilotIcon;
