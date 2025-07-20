'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelContext } from '@/context/TravelContext';
import { TravelPlanRequest } from '@/agents';
import { addDays } from 'date-fns';

export default function Home() {
  const router = useRouter();
  const { generatePlan, planningState } = useTravelContext();

  // Set initial dates: start date tomorrow, end date 7 days after
  const tomorrow = addDays(new Date(), 1);
  tomorrow.setHours(0, 0, 0, 0); // Reset time to midnight

  const [formData, setFormData] = useState<TravelPlanRequest>({
    destination: '',
    startDate: tomorrow,
    endDate: addDays(tomorrow, 7),
    preferences: {
      budget: '',
      interests: [],
      accommodationType: '',
      travelStyle: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (formData.startDate < today) {
      setFormData(prev => ({ ...prev, startDate: tomorrow }));
      return;
    }

    if (formData.endDate < formData.startDate) {
      setFormData(prev => ({ ...prev, endDate: addDays(formData.startDate, 1) }));
      return;
    }

    await generatePlan(formData);
    if (!planningState.error) {
      router.push('/details');
    }
  };

  const handleInterestChange = (interest: string) => {
    const interests = formData.preferences?.interests || [];
    const updatedInterests = interests.includes(interest)
      ? interests.filter(i => i !== interest)
      : [...interests, interest];

    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        interests: updatedInterests,
      },
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        Travel Planner
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Destination */}
        <div>
          <label htmlFor="destination" className="block text-lg font-medium mb-2">
            Destination
          </label>
          <input
            type="text"
            id="destination"
            value={formData.destination}
            onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-lg font-medium mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate.toISOString().split('T')[0]}
              min={tomorrow.toISOString().split('T')[0]}
              onChange={(e) => {
                const newStartDate = new Date(e.target.value);
                setFormData(prev => ({
                  ...prev,
                  startDate: newStartDate,
                  // If end date is before new start date, update it
                  endDate: prev.endDate < newStartDate ? addDays(newStartDate, 1) : prev.endDate
                }));
              }}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-lg font-medium mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={formData.endDate.toISOString().split('T')[0]}
              min={formData.startDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="budget" className="block text-lg font-medium mb-2">
            Budget Range
          </label>
          <select
            id="budget"
            value={formData.preferences?.budget || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              preferences: { ...prev.preferences, budget: e.target.value }
            }))}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a budget range</option>
            <option value="budget">Budget</option>
            <option value="moderate">Moderate</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-lg font-medium mb-2">
            Interests
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['culture', 'nature', 'food', 'adventure', 'relaxation', 'shopping'].map((interest) => (
              <label key={interest} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.preferences?.interests?.includes(interest) || false}
                  onChange={() => handleInterestChange(interest)}
                  className="rounded"
                />
                <span className="capitalize">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Accommodation Type */}
        <div>
          <label htmlFor="accommodationType" className="block text-lg font-medium mb-2">
            Accommodation Type
          </label>
          <select
            id="accommodationType"
            value={formData.preferences?.accommodationType || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              preferences: { ...prev.preferences, accommodationType: e.target.value }
            }))}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select accommodation type</option>
            <option value="hotel">Hotel</option>
            <option value="hostel">Hostel</option>
            <option value="apartment">Apartment</option>
            <option value="resort">Resort</option>
          </select>
        </div>

        {/* Travel Style */}
        <div>
          <label htmlFor="travelStyle" className="block text-lg font-medium mb-2">
            Travel Style
          </label>
          <select
            id="travelStyle"
            value={formData.preferences?.travelStyle || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              preferences: { ...prev.preferences, travelStyle: e.target.value }
            }))}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select travel style</option>
            <option value="relaxed">Relaxed</option>
            <option value="balanced">Balanced</option>
            <option value="active">Active</option>
          </select>
        </div>

        {/* Error Message */}
        {planningState.error && (
          <div className="text-red-600 text-center py-2 bg-red-50 rounded-md">
            {planningState.error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={planningState.isLoading}
            className={`
              px-6 py-2 rounded-md text-white font-medium
              ${planningState.isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark'
              }
            `}
          >
            {planningState.isLoading ? 'Generating Plan...' : 'Generate Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
