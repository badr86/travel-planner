import { NextResponse } from 'next/server';
import { TravelPlanningCoordinator } from '@/agents';
import { TravelPlanRequest } from '@/agents';

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const rawRequest = await request.json();
    
    // Convert date strings back to Date objects
    const travelRequest: TravelPlanRequest = {
      ...rawRequest,
      startDate: new Date(rawRequest.startDate),
      endDate: new Date(rawRequest.endDate),
    };

    const coordinator = new TravelPlanningCoordinator();
    const response = await coordinator.createTravelPlan(travelRequest);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to generate travel plan' },
        { status: 500 }
      );
    }

    // Ensure dates in the response are properly formatted
    if (response.data) {
      response.data.startDate = new Date(response.data.startDate);
      response.data.endDate = new Date(response.data.endDate);
      if (response.data.itinerary) {
        response.data.itinerary = response.data.itinerary.map((day: any) => ({
          ...day,
          date: new Date(day.date)
        }));
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in generate route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 