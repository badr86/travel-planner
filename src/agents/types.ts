export interface TravelPlanRequest {
  destination: string;
  startDate: Date;
  endDate: Date;
  preferences?: {
    budget?: string;
    interests?: string[];
    accommodationType?: string;
    travelStyle?: string;
    origin?: string; // Added for FlightAgent
    localRecommendations?: any; // Added for LocalExpertAgent
    plannedActivities?: any; // Added for BudgetAgent
  };
}

export interface Activity {
  name: string;
  description: string;
  duration: string;
  cost?: string;
  location: string;
  tips?: string[];
}

export interface DayPlan {
  date: Date;
  activities: Activity[];
  accommodations?: string;
  transportationDetails?: string;
}

export interface Budget {
  accommodation: number;
  activities: number;
  transportation: number;
  food: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

export interface WeatherData {
  date: string;
  temperature: {
    min: number;
    max: number;
    unit: string;
  };
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  icon: string;
}

export interface WeatherInfo {
  location: string;
  forecast: WeatherData[];
  summary: string;
  recommendations: string[];
}

export interface FlightSegment {
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  airline: string;
  flightNumber: string;
  duration: string;
  aircraft: string;
}

export interface FlightOption {
  id: string;
  price: {
    amount: number;
    currency: string;
  };
  outbound: FlightSegment[];
  return?: FlightSegment[];
  totalDuration: string;
  stops: number;
  class: 'economy' | 'premium_economy' | 'business' | 'first';
  bookingUrl?: string;
  airline: string;
  baggage: {
    carry_on: boolean;
    checked: string;
  };
}

export interface FlightSearchResults {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  flights: FlightOption[];
  searchSummary: string;
  recommendations: string[];
  lastUpdated: string;
}

export interface AccommodationOption {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'resort' | 'guesthouse' | 'bnb';
  rating: number;
  pricePerNight: {
    amount: number;
    currency: string;
  };
  totalPrice: {
    amount: number;
    currency: string;
  };
  location: {
    address: string;
    distanceFromCenter: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  images: string[];
  description: string;
  cancellationPolicy: string;
  bookingUrl?: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  guestCapacity: number;
  breakfastIncluded: boolean;
}

export interface AccommodationSearchResults {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  accommodationType: string;
  accommodations: AccommodationOption[];
  searchSummary: string;
  recommendations: string[];
  lastUpdated: string;
}

export interface TravelPlan {
  destination: string;
  startDate: Date;
  endDate: Date;
  itinerary: DayPlan[];
  budget: Budget;
  generalTips: string[];
  localRecommendations: string[];
  weatherInfo?: WeatherInfo;
  flightInfo?: FlightSearchResults;
  accommodationInfo?: AccommodationSearchResults;
  languageTips?: string[];
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Local Expert Agent specific types
export interface LocalExpertRecommendations {
  hiddenGems: string[];
  customs: string[];
  transportation: string[];
  dining: string[];
  safety: string[];
  seasonal: string[];
  events: string[];
  timing: string[];
  language: string[];
  shopping: string[];
} 