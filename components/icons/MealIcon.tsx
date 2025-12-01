import React from 'react';

interface MealIconProps {
  className?: string;
  title?: string;
}

const MealIcon: React.FC<MealIconProps> = ({ className, title }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="Meal Service Icon"
      title={title}
    >
        <path d="M11,9H13V2H11V9M12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2A1,1 0 0,1 13,3V9H16.5A2.5,2.5 0 0,1 19,11.5A2.5,2.5 0 0,1 16.5,14H11V21A1,1 0 0,1 12,22Z" />
    </svg>
  );
};

export default MealIcon;
