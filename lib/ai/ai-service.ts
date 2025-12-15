import OpenAI from "openai";
import type {
  Metadata,
  AIAnalysis,
  VisualizationSuggestion,
  Structure,
  Decision,
  Explanation,
  Relation,
  UnifiedAIOutput,
  VisualizationInstruction,
  CSVData,
} from "@/lib/types/data";

/**
 * AI Service - Handles AI-powered analysis and decision making using OpenAI
 * 
 * Uses GPT-4o for structured data analysis tasks
 */
export class AIService {
  private client: OpenAI | null = null;
  private model: string = "gpt-4o";

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new OpenAI({
        apiKey: apiKey,
      });
    } else if (typeof window === "undefined") {
      // Server-side: try to get from environment
      const envKey = process.env.OPENAI_API_KEY;
      if (envKey) {
        this.client = new OpenAI({
          apiKey: envKey,
        });
      }
    }
  }

  /**
   * Check if AI service is available
   */
  private isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Analyze metadata and generate AI insights
   */
  async analyzeMetadata(metadataArray: Metadata[]): Promise<AIAnalysis> {
    if (!this.isAvailable()) {
      // Fallback to basic structure if AI is not available
      return this.getFallbackAnalysis(metadataArray);
    }

    try {
      const prompt = this.buildMetadataAnalysisPrompt(metadataArray);
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert in data analysis and visualization. 
            Analyze the provided CSV file metadata and create structured analyses.
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
        throw new Error("No response from AI");
      }

      const analysis = JSON.parse(content) as Partial<AIAnalysis>;
      
      return {
        structure: analysis.structure || this.getFallbackStructure(metadataArray),
        visualizations: analysis.visualizations || [],
        insights: analysis.insights || [],
        assumptions: analysis.assumptions || [],
      };
    } catch (error) {
      console.error("Error in AI analysis:", error);
      return this.getFallbackAnalysis(metadataArray);
    }
  }

  /**
   * Suggest visualizations based on data structure
   */
  async suggestVisualizations(
    structure: Structure
  ): Promise<VisualizationSuggestion[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const prompt = this.buildVisualizationPrompt(structure);
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert in data visualization. 
            Analyze the data structure and suggest appropriate visualizations.
            Always respond in JSON format with an array of visualization suggestions.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const result = JSON.parse(content) as { visualizations?: VisualizationSuggestion[] };
      return result.visualizations || [];
    } catch (error) {
      console.error("Error in visualization suggestions:", error);
      return [];
    }
  }

  /**
   * Explain a decision made by the system
   */
  async explainDecision(decision: Decision): Promise<Explanation> {
    if (!this.isAvailable()) {
      return {
        decision,
        rationale: "AI service not available",
        confidence: 0.5,
      };
    }

    try {
      const prompt = `Explain the following system decision:
      
Type: ${decision.type}
Data: ${JSON.stringify(decision.data, null, 2)}

Explain:
1. Why this decision was made
2. What alternatives were considered
3. How confident the decision is (0-1)

Respond in JSON format with: rationale, alternatives (array), confidence (0-1)`;

      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert in explainable AI. Explain decisions clearly and comprehensibly.",
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
        throw new Error("No response from AI");
      }

      const explanation = JSON.parse(content) as Partial<Explanation>;
      return {
        decision,
        rationale: explanation.rationale || "No explanation available",
        alternatives: explanation.alternatives || [],
        confidence: explanation.confidence || 0.5,
      };
    } catch (error) {
      console.error("Error in decision explanation:", error);
      return {
        decision,
        rationale: "Error generating explanation",
        confidence: 0.5,
      };
    }
  }

  /**
   * Identify relations between datasets using AI
   */
  async identifyRelations(metadataArray: Metadata[]): Promise<Relation[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const prompt = this.buildRelationPrompt(metadataArray);
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert in data modeling and relations.
            Identify relationships between different datasets.
            Always respond in JSON format with an array of relations.`,
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
        return [];
      }

      const result = JSON.parse(content) as { relations?: Relation[] };
      return result.relations || [];
    } catch (error) {
      console.error("Error in relation identification:", error);
      return [];
    }
  }

  /**
   * Generate explanation text for visualizations
   */
  async generateExplanation(
    visualizationType: string,
    data: unknown
  ): Promise<string> {
    if (!this.isAvailable()) {
      return "Explanation not available";
    }

    try {
      const prompt = `Explain this visualization:
      
Type: ${visualizationType}
Data: ${JSON.stringify(data, null, 2)}

Explain:
- What does the visualization show?
- Why was this type chosen?
- What insights can be derived?`;

      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert in data visualization. Explain visualizations clearly and understandably.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      });

      return response.choices[0]?.message?.content || "Explanation not available";
    } catch (error) {
      console.error("Error in explanation generation:", error);
      return "Error generating explanation";
    }
  }

  /**
   * Build prompt for metadata analysis
   */
  private buildMetadataAnalysisPrompt(metadataArray: Metadata[]): string {
    const metadataSummary = metadataArray.map((meta, idx) => {
      return `
File ${idx + 1}: ${meta.fileName}
- Columns: ${meta.columns.map(c => `${c.name} (${c.type})`).join(", ")}
- Rows: ${meta.rowCount}
- Header present: ${meta.hasHeader}
- Sample data (first 3 rows):
${JSON.stringify(meta.sample.rows.slice(0, 3), null, 2)}
`;
    }).join("\n");

    return `Analyze the following CSV metadata and create a structured analysis:

${metadataSummary}

Create a JSON response with:
- structure: { tables: Metadata[], relations: Relation[], overlaps: SemanticOverlap[], suggestedMerge?: {...} }
- visualizations: Array of visualization suggestions
- insights: Array of insights (strings)
- assumptions: Array of assumptions (strings)

Identify:
1. Potential relations between files
2. Semantic overlaps
3. Appropriate visualizations
4. Important insights`;
  }

  /**
   * Build prompt for visualization suggestions
   */
  private buildVisualizationPrompt(structure: Structure): string {
    return `Based on this data structure, suggest appropriate visualizations:

Tables: ${structure.tables.length}
Relations: ${structure.relations.length}
Overlaps: ${structure.overlaps.length}

Column Information:
${structure.tables.map((t, i) => 
  `Table ${i + 1}: ${t.columns.map(c => `${c.name} (${c.type})`).join(", ")}`
).join("\n")}

Create a JSON object with an array "visualizations" of visualization suggestions.
Each suggestion should contain:
- type: one of the types (bar-chart, line-chart, pie-chart, table, scatter-plot, relational-view, aggregated-overview)
- explanation: Why this visualization is appropriate
- reasoning: Rationale`;
  }

  /**
   * Build prompt for relation identification
   */
  private buildRelationPrompt(metadataArray: Metadata[]): string {
    const metadataSummary = metadataArray.map((meta, idx) => {
      return `
File ${idx + 1}: ${meta.fileName}
Columns: ${meta.columns.map(c => `${c.name} (${c.type})`).join(", ")}
`;
    }).join("\n");

    return `Identify relationships between these datasets:

${metadataSummary}

Create a JSON object with an array "relations" of relations.
Each relation should contain:
- type: "key" | "time" | "category" | "semantic"
- sourceColumn: Column name from file 1
- targetColumn: Column name from file 2
- confidence: 0-1
- description: Description of the relation`;
  }

  /**
   * Fallback analysis when AI is not available
   */
  private getFallbackAnalysis(metadataArray: Metadata[]): AIAnalysis {
    return {
      structure: this.getFallbackStructure(metadataArray),
      visualizations: [],
      insights: [],
      assumptions: [],
    };
  }

  /**
   * Get fallback structure
   */
  private getFallbackStructure(metadataArray: Metadata[]): Structure {
    return {
      tables: metadataArray,
      relations: [],
      overlaps: [],
    };
  }

  /**
   * Unified analysis: Takes metadata, data slices, user prompt and returns complete visualization instructions
   */
  async unifiedAnalysis(
    metadataArray: Metadata[],
    dataSlices: CSVData[],
    userPrompt: string
  ): Promise<UnifiedAIOutput> {
    if (!this.isAvailable()) {
      return this.getFallbackUnifiedOutput(metadataArray);
    }

    try {
      const prompt = this.buildUnifiedAnalysisPrompt(metadataArray, dataSlices, userPrompt);
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
        throw new Error("No response from AI");
      }

      const result = JSON.parse(content) as Partial<UnifiedAIOutput>;
      
      return {
        visualizations: result.visualizations || [],
        relations: result.relations || [],
        reasoning: result.reasoning || "No reasoning available",
        metadata: {
          insights: result.metadata?.insights || [],
          assumptions: result.metadata?.assumptions || [],
        },
      };
    } catch (error) {
      console.error("Error in unified AI analysis:", error);
      return this.getFallbackUnifiedOutput(metadataArray);
    }
  }

  /**
   * Build prompt for unified analysis
   */
  private buildUnifiedAnalysisPrompt(
    metadataArray: Metadata[],
    dataSlices: CSVData[],
    userPrompt: string
  ): string {
    const metadataSummary = metadataArray.map((meta, idx) => {
      return `
File ${idx + 1}: ${meta.fileName}
- Columns: ${meta.columns.map(c => `${c.name} (${c.type})`).join(", ")}
- Rows: ${meta.rowCount}
- Header present: ${meta.hasHeader}
`;
    }).join("\n");

    const dataSlicesSummary = dataSlices.map((data, idx) => {
      const sampleRows = data.rows.slice(0, 5);
      return `
File ${idx + 1}: ${data.fileName}
Data sample (5 elements):
${JSON.stringify(sampleRows, null, 2)}
`;
    }).join("\n");

    return `Analyze the following CSV data and create a complete visualization strategy:

METADATA:
${metadataSummary}

DATA SAMPLES (5 elements per file):
${dataSlicesSummary}

USER PROMPT (additional context):
${userPrompt || "No additional context provided"}

Create a JSON response with the following structure:
{
  "visualizations": [
    {
      "type": "bar-chart" | "line-chart" | "pie-chart" | "table" | "scatter-plot" | "relational-view" | "aggregated-overview",
      "module": "Name of visualization module",
      "config": {
        "dataSource": "Filename or 'combined'",
        "columns": ["Column1", "Column2"],
        "aggregation": "sum" | "avg" | "count" | null,
        "filters": {}
      },
      "reasoning": "Why this visualization was chosen"
    }
  ],
  "relations": [
    {
      "type": "key" | "time" | "category" | "semantic",
      "sourceColumn": "Column name from file 1",
      "targetColumn": "Column name from file 2",
      "confidence": 0.0-1.0,
      "description": "Description of the relation"
    }
  ],
  "reasoning": "Overall reasoning for all decisions and visualizations",
  "metadata": {
    "insights": ["Insight 1", "Insight 2"],
    "assumptions": ["Assumption 1", "Assumption 2"]
  }
}

IMPORTANT:
- Identify all relevant relations between files
- Choose appropriate visualizations based on the data and user prompt
- Explain each decision clearly
- Consider the user prompt when selecting visualizations`;
  }

  /**
   * Fallback unified output when AI is not available
   */
  private getFallbackUnifiedOutput(metadataArray: Metadata[]): UnifiedAIOutput {
    return {
      visualizations: [],
      relations: [],
      reasoning: "AI service not available",
      metadata: {
        insights: [],
        assumptions: [],
      },
    };
  }
}
