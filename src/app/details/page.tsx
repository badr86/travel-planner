'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useTravelContext } from '@/context/TravelContext';

export default function PlanDetailsPage() {
  const router = useRouter();
  const { travelPlan, planningState } = useTravelContext();

  useEffect(() => {
    if (!travelPlan && !planningState.isLoading) {
      router.push('/');
    }
  }, [travelPlan, planningState.isLoading, router]);

  if (planningState.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Generating your travel plan...</p>
      </div>
    );
  }

  if (!travelPlan) {
    return null;
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Date not available';
    try {
      return format(new Date(date), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount: number | null | undefined, currency: string = 'USD') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `${currency} 0`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, string> = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️',
    };
    return iconMap[iconCode] || '🌤️';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        Your Travel Plan
      </h1>

      {/* Trip Overview */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Trip Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-lg">
              <span className="font-medium">Destination:</span> {travelPlan.destination}
            </p>
            <p className="text-lg">
              <span className="font-medium">Dates:</span>{' '}
              {formatDate(travelPlan.startDate)} - {formatDate(travelPlan.endDate)}
            </p>
          </div>
          <div>
            <p className="text-lg">
              <span className="font-medium">Total Budget:</span>{' '}
              {formatCurrency(travelPlan.budget?.total, travelPlan.budget?.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Itinerary */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Daily Itinerary</h2>
        <div className="space-y-6">
          {travelPlan.itinerary?.map((day, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <h3 className="text-xl font-medium mb-3">
                Day {index + 1} - {formatDate(day?.date)}
              </h3>
              <div className="space-y-3">
                {day?.activities?.map((activity, actIndex) => (
                  <div key={actIndex} className="pl-4 border-l-2 border-primary">
                    <p className="font-medium">{activity?.name || 'Activity'}</p>
                    <p className="text-gray-600">{activity?.description || 'No description available'}</p>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>Duration: {activity?.duration || 'Not specified'}</span>
                      {activity?.cost && (
                        <span className="ml-4">Cost: {activity.cost}</span>
                      )}
                    </div>
                  </div>
                )) || <p className="text-gray-500">No activities planned for this day.</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flight Information */}
      {travelPlan.flightInfo && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
            ✈️ Flight Options
          </h2>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Route:</strong> {travelPlan.flightInfo.origin} → {travelPlan.flightInfo.destination}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Departure:</strong> {travelPlan.flightInfo.departureDate}
              {travelPlan.flightInfo.returnDate && (
                <span> | <strong>Return:</strong> {travelPlan.flightInfo.returnDate}</span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Passengers:</strong> {travelPlan.flightInfo.passengers}
            </p>
          </div>

          {travelPlan.flightInfo.searchSummary && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Search Summary</h3>
              <p className="text-gray-700">{travelPlan.flightInfo.searchSummary}</p>
            </div>
          )}

          <div className="space-y-4">
            {travelPlan.flightInfo.flights.map((flight, index) => (
              <div key={flight.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{flight.airline}</h3>
                    <p className="text-sm text-gray-600">
                      {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`} • 
                      {flight.totalDuration} • {flight.class.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {flight.price.currency} {flight.price.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">per person</p>
                  </div>
                </div>

                {/* Outbound Flight */}
                <div className="mb-3">
                  <h4 className="font-medium text-gray-700 mb-2">Outbound</h4>
                  {flight.outbound.map((segment, segIndex) => (
                    <div key={segIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="font-medium">{segment.departure.time}</p>
                          <p className="text-sm text-gray-500">{segment.departure.airport}</p>
                          <p className="text-xs text-gray-400">{segment.departure.city}</p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-sm text-gray-600">{segment.flightNumber}</p>
                          <p className="text-xs text-gray-400">{segment.duration}</p>
                          <div className="w-full h-px bg-gray-300 my-1"></div>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{segment.arrival.time}</p>
                          <p className="text-sm text-gray-500">{segment.arrival.airport}</p>
                          <p className="text-xs text-gray-400">{segment.arrival.city}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Return Flight */}
                {flight.return && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700 mb-2">Return</h4>
                    {flight.return.map((segment, segIndex) => (
                      <div key={segIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-medium">{segment.departure.time}</p>
                            <p className="text-sm text-gray-500">{segment.departure.airport}</p>
                            <p className="text-xs text-gray-400">{segment.departure.city}</p>
                          </div>
                          <div className="flex-1 text-center">
                            <p className="text-sm text-gray-600">{segment.flightNumber}</p>
                            <p className="text-xs text-gray-400">{segment.duration}</p>
                            <div className="w-full h-px bg-gray-300 my-1"></div>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{segment.arrival.time}</p>
                            <p className="text-sm text-gray-500">{segment.arrival.airport}</p>
                            <p className="text-xs text-gray-400">{segment.arrival.city}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Flight Details */}
                <div className="flex justify-between items-center text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <span className="mr-4">✈️ {flight.outbound[0]?.aircraft || 'Aircraft TBD'}</span>
                    <span className="mr-4">🧳 {flight.baggage.carry_on ? 'Carry-on included' : 'No carry-on'}</span>
                    <span>📦 {flight.baggage.checked}</span>
                  </div>
                  {flight.bookingUrl && (
                    <a 
                      href={flight.bookingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Book Now
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {travelPlan.flightInfo.recommendations && travelPlan.flightInfo.recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">✈️ Flight Recommendations</h3>
              <ul className="space-y-1">
                {travelPlan.flightInfo.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700 text-sm">• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Last updated: {new Date(travelPlan.flightInfo.lastUpdated).toLocaleString()}
          </p>
        </div>
      )}

      {/* Accommodation Information */}
      {travelPlan.accommodationInfo && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
            🏨 Accommodation Options
          </h2>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Destination:</strong> {travelPlan.accommodationInfo.destination}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Check-in:</strong> {travelPlan.accommodationInfo.checkInDate} | 
              <strong>Check-out:</strong> {travelPlan.accommodationInfo.checkOutDate}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Duration:</strong> {travelPlan.accommodationInfo.nights} night{travelPlan.accommodationInfo.nights !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Type:</strong> {travelPlan.accommodationInfo.accommodationType.charAt(0).toUpperCase() + travelPlan.accommodationInfo.accommodationType.slice(1)}
            </p>
          </div>

          {travelPlan.accommodationInfo.searchSummary && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Search Summary</h3>
              <p className="text-gray-700">{travelPlan.accommodationInfo.searchSummary}</p>
            </div>
          )}

          <div className="space-y-6">
            {travelPlan.accommodationInfo.accommodations.map((accommodation, index) => (
              <div key={accommodation.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-xl text-gray-800 mr-3">{accommodation.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {accommodation.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center mr-4">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${
                            i < Math.floor(accommodation.rating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}>
                            ⭐
                          </span>
                        ))}
                        <span className="ml-1 text-sm text-gray-600">({accommodation.rating})</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        📍 {accommodation.location.distanceFromCenter} from center
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{accommodation.description}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Address:</strong> {accommodation.location.address}
                    </p>
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-2xl font-bold text-green-600">
                      {accommodation.pricePerNight.currency} {accommodation.pricePerNight.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">per night</p>
                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      Total: {accommodation.totalPrice.currency} {accommodation.totalPrice.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Room Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Room Type:</span>
                      <p className="text-gray-600">{accommodation.roomType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Capacity:</span>
                      <p className="text-gray-600">{accommodation.guestCapacity} guest{accommodation.guestCapacity !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Breakfast:</span>
                      <p className="text-gray-600">{accommodation.breakfastIncluded ? '✅ Included' : '❌ Not included'}</p>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {accommodation.amenities.map((amenity, amenityIndex) => (
                      <span key={amenityIndex} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-1">Cancellation Policy</h4>
                  <p className="text-sm text-gray-600">{accommodation.cancellationPolicy}</p>
                </div>

                {/* Booking Button */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Check-in: {accommodation.checkIn} | Check-out: {accommodation.checkOut}
                  </div>
                  {accommodation.bookingUrl && (
                    <a 
                      href={accommodation.bookingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      Book Now
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {travelPlan.accommodationInfo.recommendations && travelPlan.accommodationInfo.recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">🏨 Accommodation Recommendations</h3>
              <ul className="space-y-1">
                {travelPlan.accommodationInfo.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700 text-sm">• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Last updated: {new Date(travelPlan.accommodationInfo.lastUpdated).toLocaleString()}
          </p>
        </div>
      )}

      {/* Budget Breakdown */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Budget Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Expenses</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Accommodation:</span>
                <span>{formatCurrency(travelPlan.budget?.accommodation, travelPlan.budget?.currency)}</span>
              </li>
              <li className="flex justify-between">
                <span>Activities:</span>
                <span>{formatCurrency(travelPlan.budget?.activities, travelPlan.budget?.currency)}</span>
              </li>
              <li className="flex justify-between">
                <span>Transportation:</span>
                <span>{formatCurrency(travelPlan.budget?.transportation, travelPlan.budget?.currency)}</span>
              </li>
              <li className="flex justify-between">
                <span>Food:</span>
                <span>{formatCurrency(travelPlan.budget?.food, travelPlan.budget?.currency)}</span>
              </li>
              <li className="flex justify-between">
                <span>Miscellaneous:</span>
                <span>{formatCurrency(travelPlan.budget?.miscellaneous, travelPlan.budget?.currency)}</span>
              </li>
              <li className="flex justify-between font-bold border-t pt-2 mt-2">
                <span>Total:</span>
                <span>{formatCurrency(travelPlan.budget?.total, travelPlan.budget?.currency)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tips and Recommendations */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Tips and Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-2">General Tips</h3>
            <ul className="list-disc pl-5 space-y-1">
              {travelPlan.generalTips?.map((tip, index) => (
                <li key={index}>{tip}</li>
              )) || <li>No general tips available.</li>}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Local Recommendations</h3>
            <ul className="list-disc pl-5 space-y-1">
              {travelPlan.localRecommendations?.map((rec, index) => (
                <li key={index}>{rec}</li>
              )) || <li>No local recommendations available.</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Weather Information */}
      {travelPlan.weatherInfo && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Weather Forecast</h2>
          
          {/* Weather Summary */}
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">{travelPlan.weatherInfo.summary}</p>
          </div>

          {/* Daily Weather Forecast */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {travelPlan.weatherInfo.forecast.map((day, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-lg">
                    {formatDate(day.date)}
                  </h3>
                  <div className="text-2xl">
                    {getWeatherIcon(day.icon)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-medium">
                      {day.temperature.min}° - {day.temperature.max}°{day.temperature.unit}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium capitalize">{day.description}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Humidity:</span>
                    <span>{day.humidity}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wind:</span>
                    <span>{day.windSpeed} km/h</span>
                  </div>
                  
                  {day.precipitation > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rain:</span>
                      <span>{day.precipitation}mm</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Weather Recommendations */}
          <div>
            <h3 className="text-lg font-medium mb-3">Weather Recommendations</h3>
            <ul className="list-disc pl-5 space-y-1">
              {travelPlan.weatherInfo.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Language Tips */}
      {travelPlan.languageTips && travelPlan.languageTips.length > 0 && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Language Tips</h2>
          <ul className="list-disc pl-5 space-y-1">
            {travelPlan.languageTips?.map((tip, index) => (
              <li key={index}>{tip}</li>
            )) || <li>No language tips available.</li>}
          </ul>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="max-w-4xl mx-auto flex justify-between mt-8">
        <button
          onClick={() => router.push('/')}
          className="text-primary hover:text-blue-700 font-medium"
        >
          ← Back to Planning
        </button>
        <button
          onClick={() => window.print()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          Print Plan
        </button>
      </div>
    </div>
  );
} 