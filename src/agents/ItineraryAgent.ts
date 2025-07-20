import { PromptTemplate } from "@langchain/core/prompts";
import { BaseAgent } from "./BaseAgent";
import { AgentResponse, TravelPlanRequest, DayPlan } from "./types";

export class ItineraryAgent extends BaseAgent {
  constructor() {
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert travel itinerary planner. Create a detailed day-by-day itinerary for the following trip:
      Destination: {destination}
      Start Date: {startDate}
      End Date: {endDate}
      Preferences: {preferences}

      Consider the following:
      1. Time of year and weather
      2. Popular attractions and hidden gems
      3. Logical flow of activities
      4. Travel time between locations
      5. Meal times and restaurant suggestions
      6. Rest periods
      7. Local events or seasonal activities

      Provide a detailed itinerary with specific times, locations, and activity durations.
    `);

    super("gpt-4", 0.7, prompt);
    this.initialize();
  }

  async process(request: TravelPlanRequest): Promise<AgentResponse> {
    try {
      if (!this.validateDates(request.startDate, request.endDate)) {
        throw new Error("Invalid dates provided");
      }

      const response = await this.chain.invoke({
        destination: request.destination,
        startDate: request.startDate.toISOString(),
        endDate: request.endDate.toISOString(),
        preferences: JSON.stringify(request.preferences || {}),
      });

      // Process the response into structured DayPlan objects
      const itinerary = this.parseItinerary(response);

      return {
        success: true,
        data: itinerary,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private parseItinerary(text: string): DayPlan[] {
    const days: DayPlan[] = [];
    
    // More robust parsing approach
    // Split by "Day" followed by number and colon/dash
    const dayPattern = /Day\s*(\d+)[:\-]?\s*/gi;
    const sections = text.split(dayPattern).filter(Boolean);
    
    // Process sections in pairs (day number, content)
    for (let i = 0; i < sections.length; i += 2) {
      const dayNumber = parseInt(sections[i]) || (i / 2 + 1);
      const dayContent = sections[i + 1] || sections[i];
      
      if (!dayContent) continue;
      
      // Extract activities from the day content
      const activities = this.extractActivities(dayContent);
      
      // Calculate the actual date for this day
      const baseDate = new Date();
      const dayDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + dayNumber - 1);
      
      days.push({
        date: dayDate,
        activities,
      });
    }
    
    // If no days were parsed, try alternative parsing
    if (days.length === 0) {
      return this.fallbackParsing(text);
    }
    
    return days;
  }
  
  private extractActivities(dayContent: string): any[] {
    const activities: any[] = [];
    const lines = dayContent.split('\n').map(line => line.trim()).filter(Boolean);
    
    for (const line of lines) {
      // Match various time formats: 9:00, 09:00, 9:00 AM, etc.
      const timeMatch = line.match(/^(\d{1,2}:\d{2}(?:\s*[AaPp][Mm])?)/); 
      
      if (timeMatch) {
        const time = timeMatch[1];
        const rest = line.substring(timeMatch[0].length).replace(/^[\s\-:]+/, '');
        
        if (rest.trim()) {
          // Extract activity name and description
          const parts = rest.split(/[\-–—]|\.|:|;/).map(p => p.trim()).filter(Boolean);
          const name = parts[0] || 'Activity';
          const description = parts.length > 1 ? parts.slice(1).join('. ') : rest;
          
          activities.push({
            name: name,
            description: description,
            duration: this.estimateDuration(description),
            location: this.extractLocation(description),
            tips: [],
          });
        }
      } else if (line.length > 10 && !line.match(/^(morning|afternoon|evening|night)/i)) {
        // Non-time based activity
        activities.push({
          name: line.split(/[\-–—]|\./).map(p => p.trim()).filter(Boolean)[0] || 'Activity',
          description: line,
          duration: '1-2 hours',
          location: this.extractLocation(line),
          tips: [],
        });
      }
    }
    
    return activities;
  }
  
  private fallbackParsing(text: string): DayPlan[] {
    // Fallback: create a single day with all activities
    const activities = this.extractActivities(text);
    
    return [{
      date: new Date(),
      activities: activities.length > 0 ? activities : [{
        name: 'Explore destination',
        description: 'General exploration and sightseeing',
        duration: 'Full day',
        location: 'Various locations',
        tips: [],
      }],
    }];
  }
  
  private estimateDuration(description: string): string {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('museum') || lowerDesc.includes('tour')) return '2-3 hours';
    if (lowerDesc.includes('meal') || lowerDesc.includes('lunch') || lowerDesc.includes('dinner')) return '1-2 hours';
    if (lowerDesc.includes('shopping') || lowerDesc.includes('market')) return '1-3 hours';
    if (lowerDesc.includes('walk') || lowerDesc.includes('stroll')) return '30-60 minutes';
    return '1-2 hours';
  }
  
  private extractLocation(description: string): string {
    // Simple location extraction - look for capitalized words that might be places
    const locationMatch = description.match(/(?:at|in|to|visit)\s+([A-Z][a-zA-Z\s]+?)(?:[,.]|$)/);
    if (locationMatch) return locationMatch[1].trim();
    
    // Look for standalone capitalized phrases
    const capitalizedMatch = description.match(/\b[A-Z][a-zA-Z\s]{2,20}\b/);
    if (capitalizedMatch) return capitalizedMatch[0].trim();
    
    return 'Location TBD';
  }
}