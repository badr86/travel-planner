'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelContext } from '@/context/TravelContext';
import {
  LoadingState,
  TripHeader,
  NavigationButtons,
  TripOverview,
  DailyItinerary,
  FlightInformation,
  AccommodationDetails,
  WeatherForecast,
  BudgetBreakdown,
  LocalRecommendations,
} from '@/components/details';

export default function PlanDetailsPage() {
  const router = useRouter();
  const { travelPlan, planningState } = useTravelContext();

  useEffect(() => {
    if (!travelPlan && !planningState.isLoading) {
      router.push('/');
    }
  }, [travelPlan, planningState.isLoading, router]);

  if (planningState.isLoading) {
    return <LoadingState />;
  }

  if (!travelPlan) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TripHeader />
      
      <TripOverview
        destination={travelPlan.destination}
        startDate={travelPlan.startDate}
        endDate={travelPlan.endDate}
        budget={travelPlan.budget}
      />
      
      <DailyItinerary itinerary={travelPlan.itinerary} />
      
      <FlightInformation
        flights={travelPlan.flightInfo?.flights}
      />
      
      <AccommodationDetails accommodations={travelPlan.accommodationInfo?.accommodations} />
      
      <BudgetBreakdown budget={travelPlan.budget} />
      
      <LocalRecommendations
        recommendations={travelPlan.localRecommendations}
        languageTips={travelPlan.languageTips}
      />
      
      <WeatherForecast weatherInfo={travelPlan.weatherInfo} />
      
      <NavigationButtons />
    </div>
  );
}