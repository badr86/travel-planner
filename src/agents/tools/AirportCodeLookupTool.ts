import { Tool } from "@langchain/core/tools";

interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
}

export class AirportCodeLookupTool extends Tool {
  name = "airport_code_lookup";
  description = "Look up airport codes for cities. Input should be a city name (e.g., 'New York', 'London', 'Tokyo'). Returns the main airport code for that city.";

  // Static mapping of major cities to their primary airport codes
  private readonly cityToAirportMap: { [key: string]: AirportInfo } = {
    // North America
    'new york': { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA' },
    'los angeles': { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA' },
    'chicago': { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'USA' },
    'miami': { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'USA' },
    'san francisco': { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA' },
    'toronto': { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada' },
    'vancouver': { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada' },
    
    // Europe
    'london': { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
    'paris': { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
    'amsterdam': { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
    'frankfurt': { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
    'madrid': { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain' },
    'rome': { code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy' },
    'zurich': { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
    'vienna': { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria' },
    'munich': { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
    'barcelona': { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain' },
    
    // Asia
    'tokyo': { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
    'beijing': { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China' },
    'shanghai': { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China' },
    'hong kong': { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong' },
    'singapore': { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
    'seoul': { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' },
    'bangkok': { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
    'kuala lumpur': { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
    'mumbai': { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
    'delhi': { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India' },
    
    // Middle East & Africa
    'dubai': { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE' },
    'doha': { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar' },
    'istanbul': { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
    'cairo': { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
    'johannesburg': { code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa' },
    'casablanca': { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco' },
    
    // Australia & Oceania
    'sydney': { code: 'SYD', name: 'Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
    'melbourne': { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },
    'auckland': { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand' },
    
    // South America
    'sao paulo': { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' },
    'rio de janeiro': { code: 'GIG', name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil' },
    'buenos aires': { code: 'EZE', name: 'Ezeiza International Airport', city: 'Buenos Aires', country: 'Argentina' },
    'lima': { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru' },
    'bogota': { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' }
  };

  async _call(input: string): Promise<string> {
    try {
      const cityName = input.toLowerCase().trim();
      
      // Direct lookup
      if (this.cityToAirportMap[cityName]) {
        const airportInfo = this.cityToAirportMap[cityName];
        return JSON.stringify({
          success: true,
          city: input,
          airportCode: airportInfo.code,
          airportName: airportInfo.name,
          country: airportInfo.country,
          confidence: 'high'
        });
      }

      // Fuzzy matching for partial matches
      const fuzzyMatch = this.findFuzzyMatch(cityName);
      if (fuzzyMatch) {
        const airportInfo = this.cityToAirportMap[fuzzyMatch];
        return JSON.stringify({
          success: true,
          city: input,
          matchedCity: fuzzyMatch,
          airportCode: airportInfo.code,
          airportName: airportInfo.name,
          country: airportInfo.country,
          confidence: 'medium'
        });
      }

      // If no match found, try to make an educated guess based on common patterns
      const guessedCode = this.makeEducatedGuess(cityName);
      if (guessedCode) {
        return JSON.stringify({
          success: true,
          city: input,
          airportCode: guessedCode,
          airportName: `${input} Airport (estimated)`,
          country: 'Unknown',
          confidence: 'low',
          note: 'This is an estimated airport code. Please verify before booking.'
        });
      }

      return JSON.stringify({
        success: false,
        city: input,
        error: `No airport code found for ${input}. Please try a major city name or provide the airport code directly.`,
        suggestions: this.getSuggestions(cityName)
      });

    } catch (error) {
      return JSON.stringify({
        success: false,
        city: input,
        error: `Error looking up airport code: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private findFuzzyMatch(cityName: string): string | null {
    const cities = Object.keys(this.cityToAirportMap);
    
    // Check if the input is contained in any city name
    for (const city of cities) {
      if (city.includes(cityName) || cityName.includes(city)) {
        return city;
      }
    }

    // Check for common abbreviations or alternative names
    const alternativeNames: { [key: string]: string } = {
      'nyc': 'new york',
      'la': 'los angeles',
      'sf': 'san francisco',
      'chi': 'chicago',
      'vegas': 'las vegas',
      'dc': 'washington',
      'philly': 'philadelphia',
      'bos': 'boston',
      'sea': 'seattle',
      'atl': 'atlanta'
    };

    if (alternativeNames[cityName]) {
      const fullName = alternativeNames[cityName];
      if (this.cityToAirportMap[fullName]) {
        return fullName;
      }
    }

    return null;
  }

  private makeEducatedGuess(cityName: string): string | null {
    // Simple heuristic: take first 3 letters and uppercase
    if (cityName.length >= 3) {
      return cityName.substring(0, 3).toUpperCase();
    }
    return null;
  }

  private getSuggestions(cityName: string): string[] {
    const cities = Object.keys(this.cityToAirportMap);
    const suggestions: string[] = [];

    // Find cities that start with the same letter
    const firstLetter = cityName.charAt(0).toLowerCase();
    for (const city of cities) {
      if (city.charAt(0) === firstLetter) {
        suggestions.push(city);
      }
    }

    // If no suggestions, provide some popular destinations
    if (suggestions.length === 0) {
      suggestions.push('new york', 'london', 'paris', 'tokyo', 'sydney');
    }

    return suggestions.slice(0, 5); // Return max 5 suggestions
  }
}
