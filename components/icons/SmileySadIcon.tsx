import React from 'react';

interface SmileySadIconProps {
  className?: string;
  title?: string;
}

const SmileySadIcon: React.FC<SmileySadIconProps> = ({ className, title }) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
        aria-label="Sad Smiley Icon"
        title={title}
    >
        <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,20C7.58,20 4,16.42 4,12C4,7.58 7.58,4 12,4C16.42,4 20,7.58 20,12C20,16.42 16.42,20 12,20M12,14.5C9.67,14.5 7.7,15.96 6.89,18H17.11C16.3,15.96 14.33,14.5 12,14.5M8.5,11.5C9.33,11.5 10,10.83 10,10C10,9.17 9.33,8.5 8.5,8.5C7.67,8.5 7,9.17 7,10C7,10.83 7.67,11.5 8.5,11.5M15.5,11.5C16.33,11.5 17,10.83 17,10C17,9.17 16.33,8.5 15.5,8.5C14.67,8.5 14,9.17 14,10C14,10.83 14.67,11.5 15.5,11.5Z" />
    </svg>
  );
};

export default SmileySadIcon;
