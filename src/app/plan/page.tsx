'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useTravelContext } from '@/context/TravelContext';

export default function PlanOverview() {
  const router = useRouter();
  const { travelPlan } = useTravelContext();

  // Redirect to home if no travel plan exists
  useEffect(() => {
    if (!travelPlan.destination) {
      router.push('/');
    }
  }, [travelPlan, router]);

  // Format dates for display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'MMMM d, yyyy');
  };

  if (!travelPlan.destination) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        Your Travel Plan
      </h1>

      {/* Trip Overview */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Trip Overview</h2>
        <div className="space-y-2">
          <p className="text-lg">
            <span className="font-medium">Destination:</span>{' '}
            {travelPlan.destination}
          </p>
          <p className="text-lg">
            <span className="font-medium">Dates:</span>{' '}
            {formatDate(travelPlan.startDate)} - {formatDate(travelPlan.endDate)}
          </p>
        </div>
      </div>

      {/* Places to Visit */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Suggested Places to Visit</h2>
        <div className="text-gray-600">
          <p>Coming soon! We'll suggest popular attractions and activities in {travelPlan.destination}.</p>
        </div>
      </div>

      {/* Weather Forecast */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Weather Forecast</h2>
        <div className="text-gray-600">
          <p>Weather information for {travelPlan.destination} will be available soon!</p>
        </div>
      </div>

      {/* Travel Checklist */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Travel Checklist</h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <input type="checkbox" id="passport" className="mr-2" />
            <label htmlFor="passport">Passport/ID</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="tickets" className="mr-2" />
            <label htmlFor="tickets">Travel Tickets</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="accommodation" className="mr-2" />
            <label htmlFor="accommodation">Accommodation Booking</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="insurance" className="mr-2" />
            <label htmlFor="insurance">Travel Insurance</label>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-2xl mx-auto mt-8">
        <button
          onClick={() => router.push('/')}
          className="text-primary hover:text-blue-700 font-medium"
        >
          ← Back to Planning
        </button>
      </div>
    </div>
  );
} 