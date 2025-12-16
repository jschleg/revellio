import OpenAI from "openai";
import { log } from "@/lib/logger";
import type {
  Metadata,
  UnifiedAIOutput,
  DataMeshOutput,
  DataMeshRelation,
  CSVData,
} from "@/lib/types/data";
import { buildDataMeshPrompt } from "./prompts/data-mesh-prompt";
import { buildUnifiedAnalysisPrompt } from "./prompts/unified-analysis-prompt";

/**
 * AI Service - Handles AI-powered analysis using OpenAI
 * Uses GPT-4o for structured data analysis tasks
 */
export class AIService {
  private client: OpenAI | null = null;
  private model: string = "gpt-4o";

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
      log.info("OpenAI client initialized with provided API key");
    } else if (typeof window === "undefined") {
      const envKey = process.env.OPENAI_API_KEY;
      if (envKey) {
        this.client = new OpenAI({ apiKey: envKey });
        log.info("OpenAI client initialized with environment variable");
      } else {
        log.error("OPENAI_API_KEY environment variable is not set");
      }
    }
  }

  private isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Data mesh: Analyzes relationships between data elements
   */
  async dataMesh(
    metadataArray: Metadata[],
    dataSlices: CSVData[],
    userPrompt: string = ""
  ): Promise<DataMeshOutput> {
    if (!this.isAvailable()) {
      const errorMsg = "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.";
      log.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const prompt = buildDataMeshPrompt(metadataArray, dataSlices, userPrompt);
      log.info("Sending data mesh request to OpenAI", { files: metadataArray.length, hasPrompt: !!userPrompt });
      
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert in data analysis and data mesh architecture. 
            Analyze the provided metadata and data samples from CSV files.
            Create a comprehensive network analysis showing all relationships and connections between data elements.
            Always respond in JSON format with the exact structure requested.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from OpenAI");
      }

      log.info("Received response from OpenAI");
      const result = JSON.parse(content) as Partial<DataMeshOutput>;

      if (!result.relations || result.relations.length === 0) {
        log.warn("No relations found in AI response");
      }

      return {
        relations: result.relations || [],
        summary: result.summary || "No summary available",
      };
    } catch (error) {
      log.error("Error in data mesh analysis", error);
      if (error instanceof Error) {
        throw new Error(`Data mesh analysis failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Unified analysis: Creates visualization strategy based on data and relations
   */
  async unifiedAnalysis(
    metadataArray: Metadata[],
    dataSlices: CSVData[],
    userPrompt: string,
    dataMeshRelations: DataMeshRelation[] = []
  ): Promise<UnifiedAIOutput> {
    if (!this.isAvailable()) {
      const errorMsg = "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.";
      log.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const prompt = buildUnifiedAnalysisPrompt(metadataArray, dataSlices, userPrompt, dataMeshRelations);
      log.info("Sending unified analysis request to OpenAI", { 
        files: metadataArray.length, 
        relations: dataMeshRelations.length 
      });
      
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert in data analysis and visualization. 
            Analyze the provided metadata and data samples from CSV files.
            Create a complete analysis with visualization instructions, relations, and reasoning.
            Always respond in JSON format with the exact structure requested.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from OpenAI");
      }

      log.info("Received response from OpenAI");
      const result = JSON.parse(content) as Partial<UnifiedAIOutput>;

      if (!result.visualizations || result.visualizations.length === 0) {
        log.warn("No visualizations found in AI response");
      }

      return {
        visualizations: result.visualizations || [],
        relations: [], // Relations come from Data Mesh, not from visualization analysis
        reasoning: result.reasoning || "No reasoning available",
        metadata: {
          insights: [], // Not generated by visualization analyzer
          assumptions: [], // Not generated by visualization analyzer
        },
      };
    } catch (error) {
      log.error("Error in unified AI analysis", error);
      if (error instanceof Error) {
        throw new Error(`Unified analysis failed: ${error.message}`);
      }
      throw error;
    }
  }
}
