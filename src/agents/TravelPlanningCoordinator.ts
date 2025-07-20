import { ItineraryAgent } from './ItineraryAgent';
import { LocalExpertAgent } from './LocalExpertAgent';
import { BudgetAgent } from './BudgetAgent';
import { WeatherAgent } from './WeatherAgent';
import { FlightAgent } from './FlightAgent';
import { AccommodationAgent } from './AccommodationAgent';
import { TravelPlanRequest, TravelPlan, AgentResponse, LocalExpertRecommendations, WeatherInfo } from './types';

export class TravelPlanningCoordinator {
  private itineraryAgent: ItineraryAgent;
  private localExpertAgent: LocalExpertAgent;
  private budgetAgent: BudgetAgent;
  private weatherAgent: WeatherAgent;
  private flightAgent: FlightAgent;
  private accommodationAgent: AccommodationAgent;

  constructor() {
    this.itineraryAgent = new ItineraryAgent();
    this.localExpertAgent = new LocalExpertAgent();
    this.budgetAgent = new BudgetAgent();
    this.weatherAgent = new WeatherAgent();
    this.flightAgent = new FlightAgent();
    this.accommodationAgent = new AccommodationAgent();
  }

  async createTravelPlan(request: TravelPlanRequest): Promise<AgentResponse> {
    try {
      // Get local expert recommendations first
      const localExpertResponse = await this.localExpertAgent.process(request);
      if (!localExpertResponse.success) {
        throw new Error(localExpertResponse.error);
      }

      const localRecommendations = localExpertResponse.data as LocalExpertRecommendations;

      // Create itinerary based on local recommendations
      const itineraryResponse = await this.itineraryAgent.process({
        ...request,
        preferences: {
          ...request.preferences,
          localRecommendations,
        },
      });
      if (!itineraryResponse.success) {
        throw new Error(itineraryResponse.error);
      }

      // Calculate budget based on itinerary
      const budgetResponse = await this.budgetAgent.process({
        ...request,
        preferences: {
          ...request.preferences,
          plannedActivities: itineraryResponse.data,
        },
      });
      if (!budgetResponse.success) {
        throw new Error(budgetResponse.error);
      }

      // Get weather information
      const weatherResponse = await this.weatherAgent.process(request);
      const weatherInfo = weatherResponse.success ? weatherResponse.data : undefined;

      // Get flight information
      const flightResponse = await this.flightAgent.process(request);
      const flightInfo = flightResponse.success ? flightResponse.data : undefined;

      // Get accommodation information
      const accommodationResponse = await this.accommodationAgent.process(request);
      const accommodationInfo = accommodationResponse.success ? accommodationResponse.data : undefined;

      // Combine all responses into a complete travel plan
      const travelPlan: TravelPlan = {
        destination: request.destination,
        startDate: request.startDate,
        endDate: request.endDate,
        itinerary: itineraryResponse.data || [],
        budget: budgetResponse.data || {
          accommodation: 0,
          activities: 0,
          transportation: 0,
          food: 0,
          miscellaneous: 0,
          total: 0,
          currency: 'USD'
        },
        generalTips: [
          ...(localRecommendations.customs || []),
          ...(localRecommendations.safety || []),
          ...(localRecommendations.timing || []),
          ...(localRecommendations.seasonal || [])
        ],
        localRecommendations: [
          ...(localRecommendations.hiddenGems || []),
          ...(localRecommendations.dining || []),
          ...(localRecommendations.shopping || []),
          ...(localRecommendations.events || [])
        ],
        weatherInfo,
        flightInfo,
        accommodationInfo,
        languageTips: localRecommendations.language || []
      };

      return {
        success: true,
        data: travelPlan,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create travel plan',
      };
    }
  }
} 