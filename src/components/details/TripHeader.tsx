import React from 'react';

interface TripHeaderProps {
  title?: string;
  className?: string;
}

export const TripHeader: React.FC<TripHeaderProps> = ({
  title = 'Your Travel Plan',
  className = '',
}) => {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <h1 className="text-4xl font-bold text-primary mb-2">
        {title}
      </h1>
      <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
    </div>
  );
};
