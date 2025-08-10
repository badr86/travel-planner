import React from 'react';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  className = '',
  titleClassName = '',
}) => {
  return (
    <div className={`max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8 ${className}`}>
      <h2 className={`text-2xl font-semibold mb-4 ${titleClassName}`}>
        {title}
      </h2>
      {children}
    </div>
  );
};
