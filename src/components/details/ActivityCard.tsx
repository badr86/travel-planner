import React from 'react';
import { useFormatters } from './hooks/useFormatters';

interface Activity {
  name?: string;
  description?: string;
  duration?: string;
  cost?: string;
  time?: string;
  location?: string;
}

interface ActivityCardProps {
  activity: Activity;
  index: number;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, index }) => {
  const { formatTime, formatDuration } = useFormatters();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm">
          {index + 1}
        </div>
        
        <div className="flex-grow">
          <h4 className="font-semibold text-gray-800 mb-2">
            {activity?.name || 'Activity'}
          </h4>
          
          {activity?.description && (
            <p className="text-gray-600 mb-3 leading-relaxed">
              {activity.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm">
            {activity?.time && (
              <div className="flex items-center gap-1 text-gray-500">
                <span>🕒</span>
                <span>{formatTime(activity.time)}</span>
              </div>
            )}
            
            {activity?.duration && (
              <div className="flex items-center gap-1 text-gray-500">
                <span>⏱️</span>
                <span>{formatDuration(activity.duration)}</span>
              </div>
            )}
            
            {activity?.cost && (
              <div className="flex items-center gap-1 text-green-600 font-medium">
                <span>💰</span>
                <span>{activity.cost}</span>
              </div>
            )}
            
            {activity?.location && (
              <div className="flex items-center gap-1 text-blue-600">
                <span>📍</span>
                <span>{activity.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
