import { PromptTemplate } from "@langchain/core/prompts";
import { BaseAgent } from "./BaseAgent";
import { AgentResponse, TravelPlanRequest, Budget } from "./types";

export class BudgetAgent extends BaseAgent {
  constructor() {
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert travel budget planner. Create a detailed budget breakdown for the following trip:
      Destination: {destination}
      Start Date: {startDate}
      End Date: {endDate}
      Preferences: {preferences}

      Please provide a detailed budget breakdown with specific USD amounts for each category:
      
      1. Accommodation: $XXX (total for the trip)
      2. Activities: $XXX (museums, tours, attractions)
      3. Transportation: $XXX (local transport, taxis, etc.)
      4. Food: $XXX (meals, snacks, drinks)
      5. Miscellaneous: $XXX (souvenirs, tips, emergency fund)
      
      Total Budget: $XXX USD
      
      For each category, provide:
      - Specific dollar amounts
      - Brief explanation of what's included
      - Money-saving tips where applicable
      
      Use this exact format with dollar signs and amounts clearly marked.
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

      // Parse the response into a structured budget
      const budget = this.parseBudget(response);

      return {
        success: true,
        data: budget,
      };
    } catch (error) {
      console.error('Budget Agent Error:', error);
      return this.handleError(error);
    }
  }

  private parseBudget(text: string): Budget {
    console.log('🔍 Budget Agent - Raw LLM Response:', text);
    
    // Initialize default budget structure
    const budget: Budget = {
      accommodation: 0,
      activities: 0,
      transportation: 0,
      food: 0,
      miscellaneous: 0,
      total: 0,
      currency: 'USD'
    };

    // More robust parsing approach
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    for (const line of lines) {
      console.log('📝 Processing line:', line);
      
      // Look for lines that contain both category keywords and dollar amounts
      const lowerLine = line.toLowerCase();
      
      // More specific patterns for budget categories with dollar amounts
      const patterns = [
        // Pattern 1: "Accommodation: $XXX" or "1. Accommodation: $XXX"
        /(?:accommodation|hotel|lodging|stay)\s*:?\s*\$([\d,]+(?:\.\d{2})?)/i,
        // Pattern 2: "$XXX (accommodation)" or "$XXX for accommodation"
        /\$([\d,]+(?:\.\d{2})?)\s*(?:for|\()?\s*(?:accommodation|hotel|lodging|stay)/i,
      ];
      
      // Check accommodation
      if (lowerLine.includes('accommodation') || lowerLine.includes('hotel') || lowerLine.includes('lodging')) {
        const match = line.match(/\$([\d,]+(?:\.\d{2})?)/i);
        if (match) {
          const value = parseFloat(match[1].replace(/,/g, ''));
          if (value > 50) { // Only accept realistic accommodation costs
            budget.accommodation = Math.max(budget.accommodation, value);
            console.log('✅ Found accommodation:', value);
          }
        }
      }
      
      // Check activities
      else if (lowerLine.includes('activities') || lowerLine.includes('attractions') || lowerLine.includes('tours')) {
        const match = line.match(/\$([\d,]+(?:\.\d{2})?)/i);
        if (match) {
          const value = parseFloat(match[1].replace(/,/g, ''));
          if (value > 20) { // Only accept realistic activity costs
            budget.activities = Math.max(budget.activities, value);
            console.log('✅ Found activities:', value);
          }
        }
      }
      
      // Check transportation
      else if (lowerLine.includes('transportation') || lowerLine.includes('transport')) {
        const match = line.match(/\$([\d,]+(?:\.\d{2})?)/i);
        if (match) {
          const value = parseFloat(match[1].replace(/,/g, ''));
          if (value > 10) { // Only accept realistic transport costs
            budget.transportation = Math.max(budget.transportation, value);
            console.log('✅ Found transportation:', value);
          }
        }
      }
      
      // Check food
      else if (lowerLine.includes('food') || lowerLine.includes('dining') || lowerLine.includes('meals')) {
        const match = line.match(/\$([\d,]+(?:\.\d{2})?)/i);
        if (match) {
          const value = parseFloat(match[1].replace(/,/g, ''));
          if (value > 20) { // Only accept realistic food costs
            budget.food = Math.max(budget.food, value);
            console.log('✅ Found food:', value);
          }
        }
      }
      
      // Check miscellaneous
      else if (lowerLine.includes('miscellaneous') || lowerLine.includes('other') || lowerLine.includes('shopping')) {
        const match = line.match(/\$([\d,]+(?:\.\d{2})?)/i);
        if (match) {
          const value = parseFloat(match[1].replace(/,/g, ''));
          if (value > 10) { // Only accept realistic misc costs
            budget.miscellaneous = Math.max(budget.miscellaneous, value);
            console.log('✅ Found miscellaneous:', value);
          }
        }
      }
      
      // Check total
      else if (lowerLine.includes('total') || lowerLine.includes('overall')) {
        const match = line.match(/\$([\d,]+(?:\.\d{2})?)/i);
        if (match) {
          const value = parseFloat(match[1].replace(/,/g, ''));
          if (value > 100) { // Only accept realistic total costs
            budget.total = Math.max(budget.total, value);
            console.log('✅ Found total:', value);
          }
        }
      }
    }
    
    console.log('📊 Parsed budget before validation:', budget);
    
    // Validate and fix the budget
    const calculatedTotal = budget.accommodation + budget.activities + budget.transportation + budget.food + budget.miscellaneous;
    
    // If individual amounts are too small but we have a total, distribute the total proportionally
    if (calculatedTotal < budget.total * 0.5 && budget.total > 0) {
      console.log('⚠️ Individual amounts too small, distributing total proportionally');
      
      // Use reasonable proportions for a 7-day trip
      budget.accommodation = Math.round(budget.total * 0.40); // 40% for accommodation
      budget.food = Math.round(budget.total * 0.25);          // 25% for food
      budget.activities = Math.round(budget.total * 0.20);    // 20% for activities
      budget.transportation = Math.round(budget.total * 0.10); // 10% for transportation
      budget.miscellaneous = Math.round(budget.total * 0.05);  // 5% for miscellaneous
      
      // Adjust to match the exact total
      const newCalculatedTotal = budget.accommodation + budget.food + budget.activities + budget.transportation + budget.miscellaneous;
      const difference = budget.total - newCalculatedTotal;
      budget.accommodation += difference; // Add any remainder to accommodation
    }
    
    // If no total was found, calculate it from individual amounts
    else if (budget.total === 0 && calculatedTotal > 0) {
      budget.total = calculatedTotal;
    }
    
    // Fallback: if no budget was parsed at all, provide reasonable estimates
    else if (budget.total === 0 && calculatedTotal === 0) {
      console.log('⚠️ No budget data found, using fallback estimates');
      budget.accommodation = 420; // $60/night × 7 nights
      budget.food = 280;          // $40/day × 7 days
      budget.activities = 210;    // $30/day × 7 days
      budget.transportation = 70; // $10/day × 7 days
      budget.miscellaneous = 70;  // $10/day × 7 days
      budget.total = 1050;        // Total for 7-day trip
    }
    
    console.log('✅ Final budget:', budget);
    return budget;
  }
}