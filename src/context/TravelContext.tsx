'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of our travel plan data
interface TravelPlan {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
}

// Define the shape of our context
interface TravelContextType {
  travelPlan: TravelPlan;
  setTravelPlan: (plan: TravelPlan) => void;
}

// Create the context with a default value
const TravelContext = createContext<TravelContextType | undefined>(undefined);

// Create a provider component
export function TravelProvider({ children }: { children: ReactNode }) {
  const [travelPlan, setTravelPlan] = useState<TravelPlan>({
    destination: '',
    startDate: null,
    endDate: null,
  });

  return (
    <TravelContext.Provider value={{ travelPlan, setTravelPlan }}>
      {children}
    </TravelContext.Provider>
  );
}

// Create a custom hook to use the travel context
export function useTravelContext() {
  const context = useContext(TravelContext);
  if (context === undefined) {
    throw new Error('useTravelContext must be used within a TravelProvider');
  }
  return context;
} 