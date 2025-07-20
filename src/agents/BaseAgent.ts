import { ChatOpenAI } from "@langchain/openai";
import { AgentResponse } from "./types";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export abstract class BaseAgent {
  protected model: ChatOpenAI;
  protected chain!: RunnableSequence;
  
  constructor(
    modelName: string = "gpt-4",
    temperature: number = 0.7,
    protected prompt?: PromptTemplate
  ) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    this.model = new ChatOpenAI({
      modelName,
      temperature,
      maxTokens: 1500,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  protected async initialize(): Promise<void> {
    if (this.prompt) {
      this.chain = RunnableSequence.from([
        this.prompt,
        this.model,
        new StringOutputParser(),
      ]);
    }
  }

  protected async handleError(error: any): Promise<AgentResponse> {
    console.error(`Agent error: ${error.message}`);
    return {
      success: false,
      error: error.message || 'An unknown error occurred',
    };
  }

  protected validateDates(startDate: Date, endDate: Date): boolean {
    // Reset time components to midnight for comparison
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Allow same-day start and end dates
    return (
      start >= today &&
      end >= start
    );
  }

  abstract process(input: any): Promise<AgentResponse>;
} 