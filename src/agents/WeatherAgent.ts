import { PromptTemplate } from "@langchain/core/prompts";
import { BaseAgent } from "./BaseAgent";
import { AgentResponse, TravelPlanRequest, WeatherData, WeatherInfo } from "./types";

export class WeatherAgent extends BaseAgent {
  private readonly weatherApiKey: string;
  private readonly weatherApiUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    const prompt = PromptTemplate.fromTemplate(`
      You are a weather expert providing travel advice based on weather conditions.
      
      Location: {location}
      Travel Dates: {startDate} to {endDate}
      Weather Data: {weatherData}
      
      Based on the weather forecast, provide:
      1. A brief summary of the weather conditions during the trip
      2. Clothing recommendations
      3. Activity suggestions based on weather
      4. Any weather-related travel tips or warnings
      
      Format your response as practical advice for travelers.
    `);

    super("gpt-4", 0.7, prompt);
    this.weatherApiKey = process.env.OPENWEATHER_API_KEY || '';
    this.initialize();
  }

  async process(request: TravelPlanRequest): Promise<AgentResponse> {
    try {
      if (!this.weatherApiKey) {
        console.warn('OpenWeather API key not configured, using mock weather data');
        return this.getMockWeatherData(request);
      }

      if (!this.validateDates(request.startDate, request.endDate)) {
        throw new Error("Invalid dates provided");
      }

      // Get coordinates for the destination
      const coordinates = await this.getCoordinates(request.destination);
      if (!coordinates) {
        throw new Error(`Could not find coordinates for ${request.destination}`);
      }

      // Get weather forecast
      const weatherData = await this.getWeatherForecast(coordinates, request.startDate, request.endDate);
      
      // Generate AI recommendations based on weather
      const aiResponse = await this.chain.invoke({
        location: request.destination,
        startDate: request.startDate.toISOString(),
        endDate: request.endDate.toISOString(),
        weatherData: JSON.stringify(weatherData.forecast),
      });

      const weatherInfo: WeatherInfo = {
        ...weatherData,
        summary: this.extractSummary(aiResponse),
        recommendations: this.extractRecommendations(aiResponse),
      };

      return {
        success: true,
        data: weatherInfo,
      };
    } catch (error) {
      console.error('Weather Agent Error:', error);
      return this.handleError(error);
    }
  }

  private async getCoordinates(location: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await fetch(
        `${this.weatherApiUrl}/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${this.weatherApiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.length === 0) {
        return null;
      }
      
      return {
        lat: data[0].lat,
        lon: data[0].lon,
      };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  private async getWeatherForecast(
    coordinates: { lat: number; lon: number },
    startDate: Date,
    endDate: Date
  ): Promise<{ location: string; forecast: WeatherData[] }> {
    try {
      // For current weather and 5-day forecast
      const response = await fetch(
        `${this.weatherApiUrl}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.weatherApiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process forecast data
      const forecast: WeatherData[] = this.processForecastData(data, startDate, endDate);
      
      return {
        location: data.city.name,
        forecast,
      };
    } catch (error) {
      console.error('Error getting weather forecast:', error);
      throw error;
    }
  }

  private processForecastData(apiData: any, startDate: Date, endDate: Date): WeatherData[] {
    const forecast: WeatherData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Group forecasts by date
    const dailyForecasts = new Map<string, any[]>();
    
    apiData.list.forEach((item: any) => {
      const itemDate = new Date(item.dt * 1000);
      if (itemDate >= start && itemDate <= end) {
        const dateKey = itemDate.toISOString().split('T')[0];
        if (!dailyForecasts.has(dateKey)) {
          dailyForecasts.set(dateKey, []);
        }
        dailyForecasts.get(dateKey)!.push(item);
      }
    });

    // Create daily summaries
    dailyForecasts.forEach((dayItems, dateKey) => {
      const temps = dayItems.map(item => item.main.temp);
      const conditions = dayItems.map(item => item.weather[0]);
      
      // Get the most common condition
      const conditionCounts = conditions.reduce((acc, condition) => {
        acc[condition.main] = (acc[condition.main] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dominantCondition = Object.keys(conditionCounts).reduce((a, b) => 
        conditionCounts[a] > conditionCounts[b] ? a : b
      );
      
      const dominantWeather = conditions.find(c => c.main === dominantCondition);
      
      forecast.push({
        date: dateKey,
        temperature: {
          min: Math.round(Math.min(...temps)),
          max: Math.round(Math.max(...temps)),
          unit: '°C',
        },
        condition: dominantCondition,
        description: dominantWeather?.description || '',
        humidity: Math.round(dayItems.reduce((sum, item) => sum + item.main.humidity, 0) / dayItems.length),
        windSpeed: Math.round(dayItems.reduce((sum, item) => sum + item.wind.speed, 0) / dayItems.length),
        precipitation: dayItems.reduce((sum, item) => sum + (item.rain?.['3h'] || 0), 0),
        icon: dominantWeather?.icon || '01d',
      });
    });

    return forecast;
  }

  private getMockWeatherData(request: TravelPlanRequest): Promise<AgentResponse> {
    // Mock weather data when API key is not available
    const mockForecast: WeatherData[] = [];
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      mockForecast.push({
        date: d.toISOString().split('T')[0],
        temperature: {
          min: 20 + Math.floor(Math.random() * 5),
          max: 28 + Math.floor(Math.random() * 7),
          unit: '°C',
        },
        condition: 'Clear',
        description: 'Clear sky',
        humidity: 45 + Math.floor(Math.random() * 20),
        windSpeed: 5 + Math.floor(Math.random() * 10),
        precipitation: 0,
        icon: '01d',
      });
    }

    const weatherInfo: WeatherInfo = {
      location: request.destination,
      forecast: mockForecast,
      summary: `Generally pleasant weather expected in ${request.destination} with clear skies and comfortable temperatures.`,
      recommendations: [
        'Pack light, breathable clothing for warm days',
        'Bring a light jacket for cooler evenings',
        'Don\'t forget sunscreen and sunglasses',
        'Perfect weather for outdoor activities and sightseeing',
      ],
    };

    return Promise.resolve({
      success: true,
      data: weatherInfo,
    });
  }

  private extractSummary(aiResponse: string): string {
    // Extract summary from AI response
    const lines = aiResponse.split('\n').filter(line => line.trim());
    return lines.slice(0, 2).join(' ').trim() || 'Weather information processed successfully.';
  }

  private extractRecommendations(aiResponse: string): string[] {
    // Extract recommendations from AI response
    const lines = aiResponse.split('\n').filter(line => line.trim());
    return lines
      .filter(line => line.includes('recommend') || line.includes('suggest') || line.includes('tip'))
      .map(line => line.trim())
      .slice(0, 4) || [
        'Check weather conditions before outdoor activities',
        'Pack appropriate clothing for the expected weather',
        'Stay hydrated and use sun protection',
      ];
  }
}
