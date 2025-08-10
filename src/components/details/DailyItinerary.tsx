import React, { useState } from 'react';
import { InfoCard } from './InfoCard';
import { ActivityCard } from './ActivityCard';
import { useFormatters } from './hooks/useFormatters';

interface Activity {
  name?: string;
  description?: string;
  duration?: string;
  cost?: string;
  time?: string;
  location?: string;
}

interface ItineraryDay {
  date?: Date | string;
  activities?: Activity[];
}

interface DailyItineraryProps {
  itinerary?: ItineraryDay[];
}

export const DailyItinerary: React.FC<DailyItineraryProps> = ({ itinerary }) => {
  const { formatDate } = useFormatters();
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0])); // First day expanded by default

  const toggleDay = (dayIndex: number) => {
    const newExpandedDays = new Set(expandedDays);
    if (newExpandedDays.has(dayIndex)) {
      newExpandedDays.delete(dayIndex);
    } else {
      newExpandedDays.add(dayIndex);
    }
    setExpandedDays(newExpandedDays);
  };

  const expandAll = () => {
    setExpandedDays(new Set(itinerary?.map((_, index) => index) || []));
  };

  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  if (!itinerary || itinerary.length === 0) {
    return (
      <InfoCard title="Daily Itinerary">
        <div className="text-center py-8 text-gray-500">
          <p>No itinerary available yet.</p>
        </div>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="Daily Itinerary" className="bg-gradient-to-r from-green-50 to-emerald-50">
      {/* Expand/Collapse All Controls */}
      <div className="flex justify-end gap-2 mb-6">
        <button
          onClick={expandAll}
          className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
        >
          Collapse All
        </button>
      </div>

      <div className="space-y-4">
        {itinerary.map((day, dayIndex) => {
          const isExpanded = expandedDays.has(dayIndex);
          const activityCount = day?.activities?.length || 0;
          
          return (
            <div key={dayIndex} className="relative">
              {/* Day Header - Clickable */}
              <div 
                className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-primary cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => toggleDay(dayIndex)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {dayIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Day {dayIndex + 1} - {formatDate(day?.date)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {activityCount} {activityCount === 1 ? 'activity' : 'activities'} planned
                      </p>
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Icon */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {isExpanded ? 'Click to collapse' : 'Click to expand'}
                    </span>
                    <div className={`transform transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : 'rotate-0'
                    }`}>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities - Collapsible */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="mt-4 ml-4 space-y-4">
                  {day?.activities && day.activities.length > 0 ? (
                    day.activities.map((activity, actIndex) => (
                      <div 
                        key={actIndex}
                        className="transform transition-all duration-200 hover:scale-[1.02]"
                        style={{ 
                          animationDelay: `${actIndex * 100}ms`,
                          animation: isExpanded ? 'fadeInUp 0.3s ease-out forwards' : 'none'
                        }}
                      >
                        <ActivityCard
                          activity={activity}
                          index={actIndex}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                      <p>No activities planned for this day.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Day Separator */}
              {dayIndex < itinerary.length - 1 && (
                <div className="flex items-center justify-center my-6">
                  <div className="flex-grow h-px bg-gray-200"></div>
                  <div className="mx-4 text-gray-400 text-sm">•••</div>
                  <div className="flex-grow h-px bg-gray-200"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add CSS animation styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </InfoCard>
  );
};
