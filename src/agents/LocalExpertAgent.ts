import { PromptTemplate } from "@langchain/core/prompts";
import { BaseAgent } from "./BaseAgent";
import { AgentResponse, TravelPlanRequest } from "./types";

export class LocalExpertAgent extends BaseAgent {
  constructor() {
    const prompt = PromptTemplate.fromTemplate(`
      You are a knowledgeable local expert for {destination}. Provide detailed local insights and recommendations for a visitor staying from {startDate} to {endDate}.
      Their preferences: {preferences}

      Please provide recommendations for:
      1. Hidden gems and local favorites
      2. Cultural customs and etiquette
      3. Local transportation tips
      4. Food and dining recommendations
      5. Safety considerations
      6. Seasonal considerations
      7. Local festivals or events during the visit
      8. Best times for popular attractions
      9. Local phrases and communication tips
      10. Shopping and souvenirs

      Format your response in clear sections with practical, actionable advice.
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

      // Parse the response into structured recommendations
      const recommendations = this.parseRecommendations(response);

      return {
        success: true,
        data: recommendations,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private parseRecommendations(text: string): {
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
  } {
    // Initialize the structure
    const recommendations = {
      hiddenGems: [] as string[],
      customs: [] as string[],
      transportation: [] as string[],
      dining: [] as string[],
      safety: [] as string[],
      seasonal: [] as string[],
      events: [] as string[],
      timing: [] as string[],
      language: [] as string[],
      shopping: [] as string[],
    };

    // Split the text into sections and parse each section
    const sections = text.split(/\d+\./g).filter(Boolean);
    
    // Map sections to their respective categories
    sections.forEach((section, index) => {
      const items = section
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());

      switch(index) {
        case 0: recommendations.hiddenGems = items; break;
        case 1: recommendations.customs = items; break;
        case 2: recommendations.transportation = items; break;
        case 3: recommendations.dining = items; break;
        case 4: recommendations.safety = items; break;
        case 5: recommendations.seasonal = items; break;
        case 6: recommendations.events = items; break;
        case 7: recommendations.timing = items; break;
        case 8: recommendations.language = items; break;
        case 9: recommendations.shopping = items; break;
      }
    });

    return recommendations;
  }
} 