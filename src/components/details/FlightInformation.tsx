import React from 'react';
import { InfoCard } from './InfoCard';
import { useFormatters } from './hooks/useFormatters';

// Import types from the actual TravelPlan interface
interface FlightSegment {
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  aircraft?: string;
}

interface FlightOption {
  id: string;
  price: {
    amount: number;
    currency: string;
  };
  outbound: FlightSegment[];
  return?: FlightSegment[];
  totalDuration: string;
  stops: number;
  class: 'economy' | 'premium_economy' | 'business' | 'first';
  bookingUrl?: string;
  airline: string;
  baggage: {
    carry_on: boolean;
    checked: string;
  };
}

interface FlightInformationProps {
  flights?: FlightOption[] | null;
}

const FlightCard: React.FC<{ flight: FlightOption; title: string }> = ({ flight, title }) => {
  const { formatTime, formatCurrency } = useFormatters();
  const hasReturn = flight.return && flight.return.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">
            {flight.airline} • {flight.class.replace('_', ' ').toUpperCase()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(flight.price.amount, flight.price.currency)}
          </p>
          <p className="text-sm text-gray-500">per person</p>
        </div>
      </div>

      {/* Outbound Flight */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
          <span>🛫</span>
          Outbound Journey
        </h4>
        <div className="space-y-3">
          {flight.outbound.map((segment, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 bg-blue-50 rounded-r-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✈️</span>
                  <span className="font-medium text-gray-800">
                    {segment.airline} {segment.flightNumber}
                  </span>
                </div>
                {segment.aircraft && (
                  <span className="text-sm text-gray-500">{segment.aircraft}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Departure</p>
                  <p className="font-semibold">{segment.departure.airport}</p>
                  <p className="text-gray-600">
                    {formatTime(segment.departure.time)} • {segment.departure.date}
                  </p>
                  <p className="text-xs text-gray-500">{segment.departure.city}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Arrival</p>
                  <p className="font-semibold">{segment.arrival.airport}</p>
                  <p className="text-gray-600">
                    {formatTime(segment.arrival.time)} • {segment.arrival.date}
                  </p>
                  <p className="text-xs text-gray-500">{segment.arrival.city}</p>
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                <span>Duration: {segment.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Return Flight */}
      {hasReturn && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
            <span>🛬</span>
            Return Journey
          </h4>
          <div className="space-y-3">
            {flight.return!.map((segment, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4 bg-green-50 rounded-r-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✈️</span>
                    <span className="font-medium text-gray-800">
                      {segment.airline} {segment.flightNumber}
                    </span>
                  </div>
                  {segment.aircraft && (
                    <span className="text-sm text-gray-500">{segment.aircraft}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Departure</p>
                    <p className="font-semibold">{segment.departure.airport}</p>
                    <p className="text-gray-600">
                      {formatTime(segment.departure.time)} • {segment.departure.date}
                    </p>
                    <p className="text-xs text-gray-500">{segment.departure.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Arrival</p>
                    <p className="font-semibold">{segment.arrival.airport}</p>
                    <p className="text-gray-600">
                      {formatTime(segment.arrival.time)} • {segment.arrival.date}
                    </p>
                    <p className="text-xs text-gray-500">{segment.arrival.city}</p>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  <span>Duration: {segment.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-600">
            Total Duration: <span className="font-medium">{flight.totalDuration}</span>
          </span>
          <span className="text-gray-600">
            {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-600">
            🧳 {flight.baggage.carry_on ? 'Carry-on included' : 'No carry-on'}
          </span>
          <span className="text-gray-600">
            📦 {flight.baggage.checked}
          </span>
        </div>
        
        {flight.bookingUrl && (
          <div className="mt-3">
            <a
              href={flight.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <span>🎫</span>
              Book Flight
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export const FlightInformation: React.FC<FlightInformationProps> = ({
  flights,
}) => {
  if (!flights || flights.length === 0) {
    return null;
  }

  return (
    <InfoCard title="Flight Options" className="bg-gradient-to-r from-blue-50 to-cyan-50">
      <div className="space-y-6">
        {flights.map((flight, index) => {
          // Determine if this is outbound or return based on flight data
          const isReturn = flight.return && flight.return.length > 0;
          const title = isReturn ? `Flight Option ${index + 1} (Round Trip)` : `Flight Option ${index + 1}`;
          
          return (
            <div key={flight.id} className="border border-gray-200 rounded-lg p-1">
              <FlightCard flight={flight} title={title} />
            </div>
          );
        })}
      </div>
    </InfoCard>
  );
};
