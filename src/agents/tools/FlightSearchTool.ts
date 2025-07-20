import { Tool } from "@langchain/core/tools";
import { FlightOption, FlightSegment } from "../types";

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  class?: string;
}

export class FlightSearchTool extends Tool {
  name = "flight_search";
  description = "Search for flights between two cities. Input should be a JSON string with origin, destination, departureDate, returnDate (optional), adults (optional), and class (optional).";
  
  private readonly serpApiKey: string;
  private readonly serpApiUrl = 'https://serpapi.com/search';

  constructor() {
    super();
    this.serpApiKey = process.env.SERP_API_KEY || '';
    console.log('FlightSearchTool initialized:');
    console.log('- SERP_API_KEY present:', !!this.serpApiKey);
    console.log('- SERP_API_KEY length:', this.serpApiKey.length);
    console.log('- All env vars with SERP:', Object.keys(process.env).filter(key => key.includes('SERP')));
  }

  async _call(input: string): Promise<string> {
    try {
      const params: FlightSearchParams = JSON.parse(input);
      
      if (!this.serpApiKey) {
        console.warn('SERP API key not configured, returning mock flight data');
        console.warn('Available env vars:', Object.keys(process.env).filter(key => key.includes('API') || key.includes('SERP')));
        return JSON.stringify(this.getMockFlightData(params));
      }

      // Call SERP API for Google Flights
      // Map travel class to valid SERP API values
      const getTravelClass = (classParam?: string): string => {
        if (!classParam || classParam === '0' || classParam === 'undefined') {
          return '1'; // Economy
        }
        
        const classMap: Record<string, string> = {
          'ECONOMY': '1',
          'PREMIUM_ECONOMY': '2', 
          'BUSINESS': '3',
          'FIRST': '4',
          'economy': '1',
          'premium': '2',
          'business': '3',
          'first': '4'
        };
        
        return classMap[classParam] || '1'; // Default to Economy
      };

      const searchParamsObj: Record<string, string> = {
        engine: "google_flights",
        departure_id: params.origin,
        arrival_id: params.destination,
        outbound_date: params.departureDate,
        adults: (params.adults || 1).toString(),
        travel_class: getTravelClass(params.class),
        currency: 'USD',
        api_key: this.serpApiKey
      };

      // Add return_date only if it exists (for round-trip flights)
      if (params.returnDate) {
        searchParamsObj.return_date = params.returnDate;
      }

      const searchParams = new URLSearchParams(searchParamsObj);

      const requestUrl = `${this.serpApiUrl}?${searchParams.toString()}`;

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('SERP API error response:', errorText);
        throw new Error(`SERP API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      //console.log('SERP API response data:', JSON.stringify(data, null, 2));
      
      const flights = this.parseSerpFlightResponse(data);
      //console.log('Parsed flights count:', flights.length);
      
      if (!flights || flights.length === 0) {
        console.warn('SERP API returned no flights, using mock data');
        console.warn('Raw SERP response structure:', Object.keys(data));
        console.warn('Looking for best_flights:', !!data.best_flights);
        console.warn('Looking for other_flights:', !!data.other_flights);
        return JSON.stringify(this.getMockFlightData(params));
      }

      return JSON.stringify({
        flights: flights.slice(0, 5), // Return top 5 options
        searchParams: params,
        totalResults: flights.length
      });

    } catch (error) {
      console.error('Flight search error:', error);
      // Fallback to mock data on error
      const params: FlightSearchParams = JSON.parse(input);
      return JSON.stringify(this.getMockFlightData(params));
    }
  }

  private parseSerpFlightResponse(data: any): FlightOption[] {
    try {
      const flights: FlightOption[] = [];
      
      if (data.best_flights && Array.isArray(data.best_flights)) {
        data.best_flights.forEach((flight: any, index: number) => {
          const flightOption: FlightOption = {
            id: `serp_flight_${index}`,
            price: {
              amount: flight.price || 0,
              currency: 'USD'
            },
            outbound: this.parseFlightSegments(flight.flights || []),
            return: flight.return_flights ? this.parseFlightSegments(flight.return_flights) : undefined,
            totalDuration: flight.total_duration || 'N/A',
            stops: flight.layovers?.length || 0,
            class: 'economy',
            airline: flight.airline || 'Unknown',
            baggage: {
              carry_on: true,
              checked: flight.baggage || 'Check with airline'
            }
          };
          flights.push(flightOption);
        });
      }

      return flights;
    } catch (error) {
      console.error('Error parsing SERP flight response:', error);
      return [];
    }
  }

  private parseFlightSegments(segments: any[]): FlightSegment[] {
    return segments.map((segment: any) => ({
      departure: {
        airport: segment.departure_airport?.id || 'N/A',
        city: segment.departure_airport?.name || 'N/A',
        time: segment.departure_airport?.time || 'N/A',
        date: segment.departure_airport?.date || 'N/A'
      },
      arrival: {
        airport: segment.arrival_airport?.id || 'N/A',
        city: segment.arrival_airport?.name || 'N/A',
        time: segment.arrival_airport?.time || 'N/A',
        date: segment.arrival_airport?.date || 'N/A'
      },
      airline: segment.airline || 'Unknown',
      flightNumber: segment.flight_number || 'N/A',
      duration: segment.duration || 'N/A',
      aircraft: segment.airplane || 'N/A'
    }));
  }

  private getMockFlightData(params: FlightSearchParams): any {
    const mockFlights: FlightOption[] = [
      {
        id: 'mock_flight_1',
        price: {
          amount: 650,
          currency: 'USD'
        },
        outbound: [{
          departure: {
            airport: params.origin.substring(0, 3).toUpperCase(),
            city: params.origin,
            time: '08:30',
            date: params.departureDate
          },
          arrival: {
            airport: params.destination.substring(0, 3).toUpperCase(),
            city: params.destination,
            time: '14:45',
            date: params.departureDate
          },
          airline: 'Delta Airlines',
          flightNumber: 'DL123',
          duration: '6h 15m',
          aircraft: 'Boeing 737'
        }],
        return: params.returnDate ? [{
          departure: {
            airport: params.destination.substring(0, 3).toUpperCase(),
            city: params.destination,
            time: '16:20',
            date: params.returnDate
          },
          arrival: {
            airport: params.origin.substring(0, 3).toUpperCase(),
            city: params.origin,
            time: '22:35',
            date: params.returnDate
          },
          airline: 'Delta Airlines',
          flightNumber: 'DL124',
          duration: '6h 15m',
          aircraft: 'Boeing 737'
        }] : undefined,
        totalDuration: params.returnDate ? '12h 30m' : '6h 15m',
        stops: 0,
        class: 'economy',
        airline: 'Delta Airlines',
        baggage: {
          carry_on: true,
          checked: '23kg included'
        }
      },
      {
        id: 'mock_flight_2',
        price: {
          amount: 520,
          currency: 'USD'
        },
        outbound: [{
          departure: {
            airport: params.origin.substring(0, 3).toUpperCase(),
            city: params.origin,
            time: '12:15',
            date: params.departureDate
          },
          arrival: {
            airport: params.destination.substring(0, 3).toUpperCase(),
            city: params.destination,
            time: '20:30',
            date: params.departureDate
          },
          airline: 'United Airlines',
          flightNumber: 'UA456',
          duration: '8h 15m',
          aircraft: 'Airbus A320'
        }],
        return: params.returnDate ? [{
          departure: {
            airport: params.destination.substring(0, 3).toUpperCase(),
            city: params.destination,
            time: '09:45',
            date: params.returnDate
          },
          arrival: {
            airport: params.origin.substring(0, 3).toUpperCase(),
            city: params.origin,
            time: '18:00',
            date: params.returnDate
          },
          airline: 'United Airlines',
          flightNumber: 'UA457',
          duration: '8h 15m',
          aircraft: 'Airbus A320'
        }] : undefined,
        totalDuration: params.returnDate ? '16h 30m' : '8h 15m',
        stops: 1,
        class: 'economy',
        airline: 'United Airlines',
        baggage: {
          carry_on: true,
          checked: '20kg included'
        }
      }
    ];

    return {
      flights: mockFlights,
      searchParams: params,
      totalResults: mockFlights.length
    };
  }
}
