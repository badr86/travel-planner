import { PromptTemplate } from "@langchain/core/prompts";
import { BaseAgent } from "./BaseAgent";
import { AgentResponse, TravelPlanRequest, FlightSegment, FlightOption, FlightSearchResults } from "./types";

export class FlightAgent extends BaseAgent {
  private readonly flightApiKey: string;
  private readonly flightApiUrl = 'https://api.amadeus.com/v2'; // Amadeus API example

  constructor() {
    const prompt = PromptTemplate.fromTemplate(`
      You are a flight search expert providing travel advice based on flight options.
      
      Origin: {origin}
      Destination: {destination}
      Departure Date: {departureDate}
      Return Date: {returnDate}
      Flight Options: {flightData}
      
      Based on the flight search results, provide:
      1. A brief summary of available flight options
      2. Recommendations for the best value flights
      3. Tips for booking and travel
      4. Advice on timing and alternatives
      
      Format your response as practical flight booking advice for travelers.
    `);

    super("gpt-4", 0.7, prompt);
    this.flightApiKey = process.env.AMADEUS_API_KEY || process.env.FLIGHT_API_KEY || '';
    this.initialize();
  }

  async process(request: TravelPlanRequest): Promise<AgentResponse> {
    try {
      if (!this.flightApiKey) {
        console.warn('Flight API key not configured, using mock flight data');
        return this.getMockFlightData(request);
      }

      if (!this.validateDates(request.startDate, request.endDate)) {
        throw new Error("Invalid dates provided");
      }

      // Search for flights
      const flightResults = await this.searchFlights(request);
      
      // Generate AI recommendations based on flight options
      const aiResponse = await this.chain.invoke({
        origin: this.extractOriginCity(request),
        destination: request.destination,
        departureDate: request.startDate.toISOString(),
        returnDate: request.endDate.toISOString(),
        flightData: JSON.stringify(flightResults.flights.slice(0, 3)), // Top 3 options
      });

      const flightInfo: FlightSearchResults = {
        ...flightResults,
        searchSummary: this.extractSummary(aiResponse),
        recommendations: this.extractRecommendations(aiResponse),
      };

      return {
        success: true,
        data: flightInfo,
      };
    } catch (error) {
      console.error('Flight Agent Error:', error);
      return this.handleError(error);
    }
  }

  private extractOriginCity(request: TravelPlanRequest): string {
    // In a real implementation, you might get this from user preferences or location
    // For now, we'll use a default or extract from preferences
    return request.preferences?.origin || 'New York'; // Default origin
  }

  private async searchFlights(request: TravelPlanRequest): Promise<FlightSearchResults> {
    try {
      const origin = this.extractOriginCity(request);
      const destination = request.destination;
      
      // Get airport codes for origin and destination
      const originCode = await this.getAirportCode(origin);
      const destinationCode = await this.getAirportCode(destination);
      
      if (!originCode || !destinationCode) {
        throw new Error(`Could not find airport codes for ${origin} or ${destination}`);
      }

      // Search for flights using the API
      const searchParams = {
        origin: originCode,
        destination: destinationCode,
        departureDate: request.startDate.toISOString().split('T')[0],
        returnDate: request.endDate.toISOString().split('T')[0],
        adults: 1,
        class: 'ECONOMY'
      };

      const flights = await this.callFlightAPI(searchParams);
      
      return {
        origin: origin,
        destination: destination,
        departureDate: request.startDate.toISOString().split('T')[0],
        returnDate: request.endDate.toISOString().split('T')[0],
        passengers: 1,
        flights: flights,
        searchSummary: '',
        recommendations: [],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
  }

  private async getAirportCode(cityName: string): Promise<string | null> {
    // Simple airport code mapping - in a real implementation, you'd use an airport API
    const airportCodes: Record<string, string> = {
      'new york': 'JFK',
      'nyc': 'JFK',
      'london': 'LHR',
      'paris': 'CDG',
      'tokyo': 'NRT',
      'cairo': 'CAI',
      'dubai': 'DXB',
      'los angeles': 'LAX',
      'chicago': 'ORD',
      'miami': 'MIA',
      'toronto': 'YYZ',
      'sydney': 'SYD',
      'rome': 'FCO',
      'barcelona': 'BCN',
      'amsterdam': 'AMS',
      'frankfurt': 'FRA',
      'singapore': 'SIN',
      'hong kong': 'HKG',
      'bangkok': 'BKK',
      'istanbul': 'IST'
    };

    const normalizedCity = cityName.toLowerCase().trim();
    return airportCodes[normalizedCity] || null;
  }

  private async callFlightAPI(params: any): Promise<FlightOption[]> {
    // This is where you'd integrate with a real flight API like Amadeus, Skyscanner, etc.
    // For now, we'll simulate the API call
    
    // In a real implementation:
    // const response = await fetch(`${this.flightApiUrl}/shopping/flight-offers`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.flightApiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(params)
    // });
    
    // For demo purposes, return mock data
    throw new Error('Flight API not implemented - using mock data');
  }

  private getMockFlightData(request: TravelPlanRequest): Promise<AgentResponse> {
    const origin = this.extractOriginCity(request);
    const destination = request.destination;
    
    // Generate realistic mock flight data
    const mockFlights: FlightOption[] = [
      {
        id: 'flight_1',
        price: {
          amount: 650,
          currency: 'USD'
        },
        outbound: [{
          departure: {
            airport: 'JFK',
            city: origin,
            time: '08:30',
            date: request.startDate.toISOString().split('T')[0]
          },
          arrival: {
            airport: 'CAI',
            city: destination,
            time: '23:45',
            date: request.startDate.toISOString().split('T')[0]
          },
          airline: 'EgyptAir',
          flightNumber: 'MS986',
          duration: '11h 15m',
          aircraft: 'Boeing 777-300'
        }],
        return: [{
          departure: {
            airport: 'CAI',
            city: destination,
            time: '02:30',
            date: request.endDate.toISOString().split('T')[0]
          },
          arrival: {
            airport: 'JFK',
            city: origin,
            time: '08:15',
            date: request.endDate.toISOString().split('T')[0]
          },
          airline: 'EgyptAir',
          flightNumber: 'MS985',
          duration: '12h 45m',
          aircraft: 'Boeing 777-300'
        }],
        totalDuration: '24h 00m',
        stops: 0,
        class: 'economy',
        airline: 'EgyptAir',
        baggage: {
          carry_on: true,
          checked: '23kg included'
        }
      },
      {
        id: 'flight_2',
        price: {
          amount: 580,
          currency: 'USD'
        },
        outbound: [{
          departure: {
            airport: 'JFK',
            city: origin,
            time: '14:20',
            date: request.startDate.toISOString().split('T')[0]
          },
          arrival: {
            airport: 'CAI',
            city: destination,
            time: '09:35',
            date: new Date(request.startDate.getTime() + 24*60*60*1000).toISOString().split('T')[0]
          },
          airline: 'Turkish Airlines',
          flightNumber: 'TK1',
          duration: '13h 15m',
          aircraft: 'Airbus A330'
        }],
        return: [{
          departure: {
            airport: 'CAI',
            city: destination,
            time: '11:45',
            date: request.endDate.toISOString().split('T')[0]
          },
          arrival: {
            airport: 'JFK',
            city: origin,
            time: '18:30',
            date: request.endDate.toISOString().split('T')[0]
          },
          airline: 'Turkish Airlines',
          flightNumber: 'TK2',
          duration: '14h 45m',
          aircraft: 'Airbus A330'
        }],
        totalDuration: '28h 00m',
        stops: 1,
        class: 'economy',
        airline: 'Turkish Airlines',
        baggage: {
          carry_on: true,
          checked: '20kg included'
        }
      },
      {
        id: 'flight_3',
        price: {
          amount: 890,
          currency: 'USD'
        },
        outbound: [{
          departure: {
            airport: 'JFK',
            city: origin,
            time: '22:50',
            date: request.startDate.toISOString().split('T')[0]
          },
          arrival: {
            airport: 'CAI',
            city: destination,
            time: '19:30',
            date: new Date(request.startDate.getTime() + 24*60*60*1000).toISOString().split('T')[0]
          },
          airline: 'Lufthansa',
          flightNumber: 'LH441',
          duration: '14h 40m',
          aircraft: 'Airbus A350'
        }],
        return: [{
          departure: {
            airport: 'CAI',
            city: destination,
            time: '21:40',
            date: request.endDate.toISOString().split('T')[0]
          },
          arrival: {
            airport: 'JFK',
            city: origin,
            time: '06:25',
            date: new Date(request.endDate.getTime() + 24*60*60*1000).toISOString().split('T')[0]
          },
          airline: 'Lufthansa',
          flightNumber: 'LH442',
          duration: '13h 45m',
          aircraft: 'Airbus A350'
        }],
        totalDuration: '28h 25m',
        stops: 1,
        class: 'economy',
        airline: 'Lufthansa',
        baggage: {
          carry_on: true,
          checked: '23kg included'
        }
      }
    ];

    const flightResults: FlightSearchResults = {
      origin: origin,
      destination: destination,
      departureDate: request.startDate.toISOString().split('T')[0],
      returnDate: request.endDate.toISOString().split('T')[0],
      passengers: 1,
      flights: mockFlights,
      searchSummary: `Found ${mockFlights.length} flight options from ${origin} to ${destination}. Prices range from $${Math.min(...mockFlights.map(f => f.price.amount))} to $${Math.max(...mockFlights.map(f => f.price.amount))}.`,
      recommendations: [
        'Book early for better prices - prices tend to increase closer to departure',
        'Consider flights with one stop for significant savings',
        'Check baggage policies before booking',
        'Tuesday and Wednesday departures are often cheaper',
        'Clear your browser cookies before booking to avoid price increases'
      ],
      lastUpdated: new Date().toISOString(),
    };

    return Promise.resolve({
      success: true,
      data: flightResults,
    });
  }

  private extractSummary(aiResponse: string): string {
    const lines = aiResponse.split('\n').filter(line => line.trim());
    return lines.slice(0, 2).join(' ').trim() || 'Flight search completed successfully.';
  }

  private extractRecommendations(aiResponse: string): string[] {
    const lines = aiResponse.split('\n').filter(line => line.trim());
    return lines
      .filter(line => line.includes('recommend') || line.includes('suggest') || line.includes('tip') || line.includes('consider'))
      .map(line => line.trim())
      .slice(0, 5) || [
        'Compare prices across different airlines',
        'Book flights 6-8 weeks in advance for best prices',
        'Consider nearby airports for potentially lower fares',
        'Check airline baggage policies before booking',
      ];
  }
}
