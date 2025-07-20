import { PromptTemplate } from "@langchain/core/prompts";
import { BaseAgent } from "./BaseAgent";
import { AgentResponse, TravelPlanRequest, AccommodationOption, AccommodationSearchResults } from "./types";

export class AccommodationAgent extends BaseAgent {
  private readonly accommodationApiKey: string;

  constructor() {
    super();
    this.accommodationApiKey = process.env.BOOKING_API_KEY || process.env.ACCOMMODATION_API_KEY || '';
  }

  async process(request: TravelPlanRequest): Promise<AgentResponse> {
    try {
      console.log('🏨 Accommodation Agent - Processing request for:', request.destination);

      // Get accommodation search results
      const accommodationResults = await this.searchAccommodations(request);

      // Generate AI recommendations for the accommodations
      const aiRecommendations = await this.generateAccommodationRecommendations(request, accommodationResults);

      // Combine results with AI insights
      const finalResults: AccommodationSearchResults = {
        ...accommodationResults,
        recommendations: this.extractRecommendations(aiRecommendations),
        searchSummary: this.extractSummary(aiRecommendations),
      };

      return {
        success: true,
        data: finalResults,
      };
    } catch (error) {
      console.error('❌ Accommodation Agent Error:', error);
      return {
        success: false,
        error: `Failed to search accommodations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async searchAccommodations(request: TravelPlanRequest): Promise<AccommodationSearchResults> {
    // In a real implementation, this would call accommodation APIs like:
    // - Booking.com API
    // - Expedia API
    // - Airbnb API
    // - Hotels.com API
    
    if (this.accommodationApiKey) {
      // TODO: Implement real API integration
      console.log('🔑 Using real accommodation API (not implemented yet)');
    }

    // For now, return mock data based on accommodation type and destination
    return this.getMockAccommodationData(request);
  }

  private getMockAccommodationData(request: TravelPlanRequest): AccommodationSearchResults {
    const accommodationType = request.preferences?.accommodationType || 'hotel';
    const destination = request.destination;
    const checkIn = request.startDate.toISOString().split('T')[0];
    const checkOut = request.endDate.toISOString().split('T')[0];
    
    // Calculate number of nights
    const nights = Math.ceil((request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24));

    const accommodationOptions: AccommodationOption[] = [];

    // Generate different options based on accommodation type
    switch (accommodationType.toLowerCase()) {
      case 'hotel':
        accommodationOptions.push(
          {
            id: 'hotel-1',
            name: `Grand ${destination} Hotel`,
            type: 'hotel',
            rating: 4.5,
            pricePerNight: {
              amount: 150,
              currency: 'USD'
            },
            totalPrice: {
              amount: 150 * nights,
              currency: 'USD'
            },
            location: {
              address: `123 Main Street, ${destination}`,
              distanceFromCenter: '0.5 km',
              coordinates: { lat: 0, lng: 0 }
            },
            amenities: ['Free WiFi', 'Pool', 'Gym', 'Restaurant', 'Room Service', 'Concierge'],
            images: ['https://example.com/hotel1.jpg'],
            description: `Luxury hotel in the heart of ${destination} with modern amenities and excellent service.`,
            cancellationPolicy: 'Free cancellation until 24 hours before check-in',
            bookingUrl: 'https://booking.com/hotel-1',
            checkIn: checkIn,
            checkOut: checkOut,
            roomType: 'Deluxe Double Room',
            guestCapacity: 2,
            breakfastIncluded: true
          },
          {
            id: 'hotel-2',
            name: `${destination} Business Hotel`,
            type: 'hotel',
            rating: 4.0,
            pricePerNight: {
              amount: 120,
              currency: 'USD'
            },
            totalPrice: {
              amount: 120 * nights,
              currency: 'USD'
            },
            location: {
              address: `456 Business District, ${destination}`,
              distanceFromCenter: '1.2 km',
              coordinates: { lat: 0, lng: 0 }
            },
            amenities: ['Free WiFi', 'Business Center', 'Meeting Rooms', 'Airport Shuttle'],
            images: ['https://example.com/hotel2.jpg'],
            description: `Modern business hotel perfect for both leisure and business travelers.`,
            cancellationPolicy: 'Free cancellation until 48 hours before check-in',
            bookingUrl: 'https://booking.com/hotel-2',
            checkIn: checkIn,
            checkOut: checkOut,
            roomType: 'Standard Double Room',
            guestCapacity: 2,
            breakfastIncluded: false
          }
        );
        break;

      case 'hostel':
        accommodationOptions.push(
          {
            id: 'hostel-1',
            name: `${destination} Backpackers Hostel`,
            type: 'hostel',
            rating: 4.2,
            pricePerNight: {
              amount: 35,
              currency: 'USD'
            },
            totalPrice: {
              amount: 35 * nights,
              currency: 'USD'
            },
            location: {
              address: `789 Backpacker Street, ${destination}`,
              distanceFromCenter: '0.8 km',
              coordinates: { lat: 0, lng: 0 }
            },
            amenities: ['Free WiFi', 'Shared Kitchen', 'Common Room', 'Luggage Storage', 'Laundry'],
            images: ['https://example.com/hostel1.jpg'],
            description: `Friendly hostel with great atmosphere, perfect for budget travelers and meeting other travelers.`,
            cancellationPolicy: 'Free cancellation until 24 hours before check-in',
            bookingUrl: 'https://hostelworld.com/hostel-1',
            checkIn: checkIn,
            checkOut: checkOut,
            roomType: 'Shared Dormitory (6 beds)',
            guestCapacity: 1,
            breakfastIncluded: true
          },
          {
            id: 'hostel-2',
            name: `Central ${destination} Hostel`,
            type: 'hostel',
            rating: 4.0,
            pricePerNight: {
              amount: 45,
              currency: 'USD'
            },
            totalPrice: {
              amount: 45 * nights,
              currency: 'USD'
            },
            location: {
              address: `321 Central Plaza, ${destination}`,
              distanceFromCenter: '0.3 km',
              coordinates: { lat: 0, lng: 0 }
            },
            amenities: ['Free WiFi', 'Shared Kitchen', 'Bar', 'Tours Desk', '24/7 Reception'],
            images: ['https://example.com/hostel2.jpg'],
            description: `Modern hostel in prime location with excellent facilities and social atmosphere.`,
            cancellationPolicy: 'Free cancellation until 48 hours before check-in',
            bookingUrl: 'https://hostelworld.com/hostel-2',
            checkIn: checkIn,
            checkOut: checkOut,
            roomType: 'Private Double Room',
            guestCapacity: 2,
            breakfastIncluded: false
          }
        );
        break;

      case 'apartment':
      case 'airbnb':
        accommodationOptions.push(
          {
            id: 'apartment-1',
            name: `Cozy ${destination} Apartment`,
            type: 'apartment',
            rating: 4.7,
            pricePerNight: {
              amount: 85,
              currency: 'USD'
            },
            totalPrice: {
              amount: 85 * nights,
              currency: 'USD'
            },
            location: {
              address: `567 Residential Area, ${destination}`,
              distanceFromCenter: '1.5 km',
              coordinates: { lat: 0, lng: 0 }
            },
            amenities: ['Free WiFi', 'Full Kitchen', 'Washing Machine', 'Balcony', 'Parking'],
            images: ['https://example.com/apartment1.jpg'],
            description: `Charming apartment with all amenities, perfect for a home-away-from-home experience.`,
            cancellationPolicy: 'Moderate cancellation policy',
            bookingUrl: 'https://airbnb.com/apartment-1',
            checkIn: checkIn,
            checkOut: checkOut,
            roomType: 'Entire Apartment (1 bedroom)',
            guestCapacity: 4,
            breakfastIncluded: false
          },
          {
            id: 'apartment-2',
            name: `Modern ${destination} Loft`,
            type: 'apartment',
            rating: 4.8,
            pricePerNight: {
              amount: 110,
              currency: 'USD'
            },
            totalPrice: {
              amount: 110 * nights,
              currency: 'USD'
            },
            location: {
              address: `890 Trendy District, ${destination}`,
              distanceFromCenter: '0.7 km',
              coordinates: { lat: 0, lng: 0 }
            },
            amenities: ['Free WiFi', 'Full Kitchen', 'Rooftop Terrace', 'Gym Access', 'Concierge'],
            images: ['https://example.com/apartment2.jpg'],
            description: `Stylish modern loft in trendy neighborhood with amazing city views.`,
            cancellationPolicy: 'Strict cancellation policy',
            bookingUrl: 'https://airbnb.com/apartment-2',
            checkIn: checkIn,
            checkOut: checkOut,
            roomType: 'Entire Loft (2 bedrooms)',
            guestCapacity: 6,
            breakfastIncluded: false
          }
        );
        break;

      default:
        // Default to hotel options
        accommodationOptions.push(
          {
            id: 'default-1',
            name: `${destination} Comfort Inn`,
            type: 'hotel',
            rating: 4.0,
            pricePerNight: {
              amount: 100,
              currency: 'USD'
            },
            totalPrice: {
              amount: 100 * nights,
              currency: 'USD'
            },
            location: {
              address: `100 Comfort Street, ${destination}`,
              distanceFromCenter: '1.0 km',
              coordinates: { lat: 0, lng: 0 }
            },
            amenities: ['Free WiFi', 'Breakfast', 'Parking'],
            images: ['https://example.com/default1.jpg'],
            description: `Comfortable accommodation with essential amenities at a great value.`,
            cancellationPolicy: 'Free cancellation until 24 hours before check-in',
            bookingUrl: 'https://booking.com/default-1',
            checkIn: checkIn,
            checkOut: checkOut,
            roomType: 'Standard Room',
            guestCapacity: 2,
            breakfastIncluded: true
          }
        );
    }

    return {
      destination: destination,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights: nights,
      accommodationType: accommodationType,
      accommodations: accommodationOptions,
      searchSummary: '',
      recommendations: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  private async generateAccommodationRecommendations(
    request: TravelPlanRequest,
    accommodationResults: AccommodationSearchResults
  ): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert travel accommodation advisor. Based on the following accommodation search results and travel request, provide helpful recommendations and insights.

      Travel Request:
      - Destination: {destination}
      - Dates: {startDate} to {endDate}
      - Accommodation Type: {accommodationType}
      - Budget: {budget}
      - Travel Style: {travelStyle}

      Accommodation Options Found:
      {accommodationOptions}

      Please provide:
      1. A brief summary of the accommodation search results (2-3 sentences)
      2. 3-5 specific recommendations for choosing accommodations, considering:
         - Value for money
         - Location advantages
         - Amenities that match the travel style
         - Booking tips and timing
         - Local neighborhood insights

      Format your response as:
      SUMMARY: [Your summary here]
      
      RECOMMENDATIONS:
      • [Recommendation 1]
      • [Recommendation 2]
      • [Recommendation 3]
      • [Recommendation 4]
      • [Recommendation 5]
    `);

    const accommodationOptionsText = accommodationResults.accommodations
      .map(acc => `${acc.name} (${acc.type}): $${acc.pricePerNight.amount}/night, Rating: ${acc.rating}, Location: ${acc.location.distanceFromCenter} from center`)
      .join('\n');

    const formattedPrompt = await prompt.format({
      destination: request.destination,
      startDate: request.startDate.toDateString(),
      endDate: request.endDate.toDateString(),
      accommodationType: request.preferences?.accommodationType || 'hotel',
      budget: request.preferences?.budget || 'moderate',
      travelStyle: request.preferences?.travelStyle || 'balanced',
      accommodationOptions: accommodationOptionsText,
    });

    const response = await this.model.invoke(formattedPrompt);
    return response.content as string;
  }

  private extractSummary(aiResponse: string): string {
    const summaryMatch = aiResponse.match(/SUMMARY:\s*([\s\S]*?)(?=\n\n|\nRECOMMENDATIONS:|$)/);
    return summaryMatch ? summaryMatch[1].trim() : 'Accommodation search completed successfully.';
  }

  private extractRecommendations(aiResponse: string): string[] {
    const recommendationsMatch = aiResponse.match(/RECOMMENDATIONS:\s*([\s\S]+)/);
    if (!recommendationsMatch) return [];

    return recommendationsMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('•'))
      .map(line => line.substring(1).trim())
      .filter(line => line.length > 0);
  }
}
