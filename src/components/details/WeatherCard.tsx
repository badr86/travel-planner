import React from 'react';
import { useFormatters } from './hooks/useFormatters';
import { getWeatherIcon, getWeatherConditionColor, getTemperatureColor } from './utils/weatherUtils';

interface WeatherDay {
  date: Date | string;
  temperature: {
    min: number;
    max: number;
    unit: string;
  };
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

interface WeatherCardProps {
  day: WeatherDay;
  index: number;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ day, index }) => {
  const { formatDate } = useFormatters();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800 text-sm">
          {formatDate(day.date)}
        </h3>
        <div className="text-3xl">
          {getWeatherIcon(day.icon)}
        </div>
      </div>
      
      {/* Temperature */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Temperature</span>
          <span className={`font-bold text-lg ${getTemperatureColor(day.temperature.max)}`}>
            {day.temperature.min}° - {day.temperature.max}°{day.temperature.unit}
          </span>
        </div>
      </div>
      
      {/* Condition */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Condition</span>
          <span className={`font-medium capitalize text-sm ${getWeatherConditionColor(day.description)}`}>
            {day.description}
          </span>
        </div>
      </div>
      
      {/* Weather Details */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 flex items-center gap-1">
            <span>💧</span>
            Humidity
          </span>
          <span className="font-medium text-gray-700">{day.humidity}%</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 flex items-center gap-1">
            <span>💨</span>
            Wind
          </span>
          <span className="font-medium text-gray-700">{day.windSpeed} km/h</span>
        </div>
        
        {day.precipitation > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center gap-1">
              <span>🌧️</span>
              Rain
            </span>
            <span className="font-medium text-blue-600">{day.precipitation}mm</span>
          </div>
        )}
      </div>
    </div>
  );
};
