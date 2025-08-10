import React from 'react';
import { InfoCard } from './InfoCard';
import { WeatherCard } from './WeatherCard';

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

interface WeatherInfo {
  summary: string;
  forecast: WeatherDay[];
  recommendations: string[];
}

interface WeatherForecastProps {
  weatherInfo?: WeatherInfo | null;
}

export const WeatherForecast: React.FC<WeatherForecastProps> = ({ weatherInfo }) => {
  if (!weatherInfo) {
    return null;
  }

  return (
    <InfoCard title="Weather Forecast" className="bg-gradient-to-r from-sky-50 to-blue-50">
      {/* Weather Summary */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🌤️</span>
          <h3 className="text-lg font-medium text-gray-800">Weather Summary</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">{weatherInfo.summary}</p>
      </div>

      {/* Daily Weather Forecast */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
          <span>📅</span>
          Daily Forecast
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {weatherInfo.forecast.map((day, index) => (
            <WeatherCard key={index} day={day} index={index} />
          ))}
        </div>
      </div>

      {/* Weather Recommendations */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💡</span>
          <h3 className="text-lg font-medium text-gray-800">Weather Recommendations</h3>
        </div>
        <ul className="space-y-2">
          {weatherInfo.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-700">
              <span className="text-amber-500 mt-1">•</span>
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </InfoCard>
  );
};
