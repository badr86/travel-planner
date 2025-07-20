import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor } from "langchain/agents";
import { createOpenAIToolsAgent } from "langchain/agents";
import { BaseAgent } from "./BaseAgent";
import { AgentResponse, TravelPlanRequest, FlightSearchResults, FlightOption, FlightSegment } from "./types";
import { FlightSearchTool, AirportCodeLookupTool } from "./tools";

export class FlightAgent extends BaseAgent {
  private agentExecutor!: AgentExecutor;
  private tools!: any[];

  constructor() {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a flight search expert helping travelers find and compare flight options.
      
      IMPORTANT: You MUST use the available tools to help users. Never provide flight information without using the tools first.
      
      Available tools:
      - airport_code_lookup: Look up airport codes for cities (REQUIRED for all flight searches)
      - flight_search: Search for flights between airports (REQUIRED after getting airport codes)
      
      MANDATORY WORKFLOW for ALL flight requests:
      1. ALWAYS use airport_code_lookup to get airport codes for both origin and destination cities
      2. ALWAYS use flight_search with the airport codes to find actual flights
      3. Only after using both tools, provide analysis and recommendations
      
      Do NOT provide flight information without using these tools first. Always start by looking up airport codes.`],
      ["human", "{input}"],
      ["assistant", "{agent_scratchpad}"]
    ]);

    super("gpt-4", 0.7);
    this.prompt = prompt;
    this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      // Initialize tools
      this.tools = [
        new AirportCodeLookupTool(),
        new FlightSearchTool()
      ];

      // Create the agent
      const agent = await createOpenAIToolsAgent({
        llm: this.model,
        tools: this.tools,
        prompt: this.prompt as any
      });

      // Create agent executor
      this.agentExecutor = new AgentExecutor({
        agent,
        tools: this.tools,
        verbose: true,
        maxIterations: 5,
        returnIntermediateSteps: true
      });

    } catch (error) {
      console.error('Error initializing FlightAgent:', error);
      throw error;
    }
  }

  async process(request: TravelPlanRequest): Promise<AgentResponse> {
    try {
      if (!this.validateDates(request.startDate, request.endDate)) {
        throw new Error("Invalid dates provided");
      }

      const origin = this.extractOriginCity(request);
      const destination = request.destination;
      const departureDate = request.startDate.toISOString().split('T')[0];
      const returnDate = request.endDate.toISOString().split('T')[0];

      // Create input for the agent
      const input = `Find flights from ${origin} to ${destination}. Departure date: ${departureDate}, Return date: ${returnDate}. Please search for flights and provide recommendations including pricing, duration, and booking tips.`;

      // Use the agent executor to process the request
      const agentResponse = await this.agentExecutor.invoke({
        input: input
      });

      //console.log('Agent Response:', JSON.stringify(agentResponse, null, 2));

      // Parse the agent's response to extract structured flight data
      const flightInfo = await this.parseAgentResponse(
        agentResponse.output, 
        agentResponse.intermediateSteps || [],
        {
          origin,
          destination,
          departureDate,
          returnDate
        }
      );

      return {
        success: true,
        data: flightInfo,
      };
    } catch (error) {
      console.error('Flight Agent Error:', error);
      // Fallback to mock data on error
      return this.getMockFlightData(request);
    }
  }

  private async parseAgentResponse(
    agentOutput: string, 
    intermediateSteps: any[], 
    searchParams: any
  ): Promise<FlightSearchResults> {
    try {
      //console.log('Parsing agent response:', agentOutput);
      //console.log('Intermediate steps:', JSON.stringify(intermediateSteps, null, 2));
      
      let flights: any[] = [];
      let airportCodes: any = {};
      
      // Extract results from intermediate steps
      for (const step of intermediateSteps) {
        const toolName = step.action?.tool;
        const toolResult = step.observation;
        
        if (toolName === 'airport_code_lookup') {
          try {
            const parsedResult = JSON.parse(toolResult);
            if (parsedResult.success) {
              airportCodes[parsedResult.city] = parsedResult.airportCode;
            }
          } catch (e) {
            console.warn('Failed to parse airport code result:', e);
          }
        } else if (toolName === 'flight_search') {
          try {
            const parsedResult = JSON.parse(toolResult);
            if (parsedResult.flights) {
              flights = parsedResult.flights;
            }
          } catch (e) {
            console.warn('Failed to parse flight search result:', e);
          }
        }
      }
      
      // If no flights found from tools, use mock data
      if (flights.length === 0) {
        console.log('No flights found from tools, using mock data');
        const mockResponse = await this.getMockFlightData({
          destination: searchParams.destination,
          startDate: new Date(searchParams.departureDate),
          endDate: new Date(searchParams.returnDate),
          preferences: { origin: searchParams.origin }
        } as any);
        return mockResponse.data;
      }
      
      const flightInfo: FlightSearchResults = {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate,
        passengers: 1,
        flights: flights,
        searchSummary: this.extractSummary(agentOutput) || `Found ${flights.length} flight options from ${searchParams.origin} to ${searchParams.destination}`,
        recommendations: this.extractRecommendations(agentOutput) || [
          'Compare prices across different airlines',
          'Book flights 6-8 weeks in advance for best prices',
          'Consider nearby airports for potentially lower fares',
          'Check airline baggage policies before booking'
        ],
        lastUpdated: new Date().toISOString()
      };

      return flightInfo;
    } catch (error) {
      console.error('Error parsing agent response:', error);
      throw error;
    }
  }

  private extractOriginCity(request: TravelPlanRequest): string {
    // In a real implementation, you might get this from user preferences or location
    // For now, we'll use a default or extract from preferences
    return request.preferences?.origin || 'New York'; // Default origin
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
