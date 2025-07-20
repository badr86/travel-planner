'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { TravelPlan, TravelPlanRequest } from '@/agents';

interface PlanningState {
  isLoading: boolean;
  error: string | null;
}

interface TravelContextType {
  travelPlan: TravelPlan | null;
  planningState: PlanningState;
  setTravelPlan: (plan: TravelPlan | null) => void;
  generatePlan: (request: TravelPlanRequest) => Promise<void>;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export function TravelProvider({ children }: { children: ReactNode }) {
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [planningState, setPlanningState] = useState<PlanningState>({
    isLoading: false,
    error: null,
  });

  const generatePlan = async (request: TravelPlanRequest) => {
    try {
      setPlanningState({ isLoading: true, error: null });
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          startDate: request.startDate.toISOString(),
          endDate: request.endDate.toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate travel plan');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate travel plan');
      }

      // Convert dates in the response back to Date objects
      const plan = result.data;
      plan.startDate = new Date(plan.startDate);
      plan.endDate = new Date(plan.endDate);
      if (plan.itinerary) {
        plan.itinerary = plan.itinerary.map((day: any) => ({
          ...day,
          date: new Date(day.date)
        }));
      }

      setTravelPlan(plan);
    } catch (error) {
      setPlanningState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setPlanningState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <TravelContext.Provider value={{ 
      travelPlan, 
      planningState,
      setTravelPlan, 
      generatePlan 
    }}>
      {children}
    </TravelContext.Provider>
  );
}

export function useTravelContext() {
  const context = useContext(TravelContext);
  if (context === undefined) {
    throw new Error('useTravelContext must be used within a TravelProvider');
  }
  return context;
} 