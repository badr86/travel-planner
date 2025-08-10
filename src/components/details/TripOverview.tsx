import React from 'react';
import { InfoCard } from './InfoCard';
import { useFormatters } from './hooks/useFormatters';

interface TripOverviewProps {
  destination: string;
  startDate: Date | string | null | undefined;
  endDate: Date | string | null | undefined;
  budget?: {
    total?: number;
    currency?: string;
  } | null;
}

export const TripOverview: React.FC<TripOverviewProps> = ({
  destination,
  startDate,
  endDate,
  budget,
}) => {
  const { formatDate, formatCurrency } = useFormatters();

  return (
    <InfoCard title="Trip Overview" className="bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📍</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Destination</p>
              <p className="text-lg font-semibold text-gray-800">{destination}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Travel Dates</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {budget && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Budget</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatCurrency(budget.total, budget.currency)}
                </p>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Trip Duration</p>
            <p className="text-2xl font-bold text-primary">
              {startDate && endDate 
                ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                : '?'} days
            </p>
          </div>
        </div>
      </div>
    </InfoCard>
  );
};
