import React from 'react';

interface IFEIconProps {
  className?: string;
  title?: string;
}

const IFEIcon: React.FC<IFEIconProps> = ({ className, title }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="In-Flight Entertainment Icon"
      title={title}
    >
        <path d="M21,17H3V5H21M21,3H3A2,2 0 0,0 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5A2,2 0 0,0 21,3Z" />
    </svg>
  );
};

export default IFEIcon;
