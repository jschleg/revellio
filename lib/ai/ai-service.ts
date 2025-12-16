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
  DataMeshOutput,
  DataMeshRelation,
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
   * Data mesh: Takes metadata and all data and returns a complete data mesh network analysis
   */
  async dataMesh(
    metadataArray: Metadata[],
    dataSlices: CSVData[]
  ): Promise<DataMeshOutput> {
    if (!this.isAvailable()) {
      return this.getFallbackDataMeshOutput();
    }

    try {
      const prompt = this.buildDataMeshPrompt(metadataArray, dataSlices);
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
        throw new Error("No response from AI");
      }

      const result = JSON.parse(content) as Partial<DataMeshOutput>;

      return {
        relations: result.relations || [],
        summary: result.summary || "No summary available",
      };
    } catch (error) {
      console.error("Error in data mesh analysis:", error);
      return this.getFallbackDataMeshOutput();
    }
  }

  /**
   * Unified analysis: Takes metadata, data slices, user prompt and returns complete visualization instructions
   */
  async unifiedAnalysis(
    metadataArray: Metadata[],
    dataSlices: CSVData[],
    userPrompt: string,
    dataMeshRelations: DataMeshRelation[] = []
  ): Promise<UnifiedAIOutput> {
    if (!this.isAvailable()) {
      return this.getFallbackUnifiedOutput(metadataArray);
    }

    try {
      const prompt = this.buildUnifiedAnalysisPrompt(metadataArray, dataSlices, userPrompt, dataMeshRelations);
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
    userPrompt: string,
    dataMeshRelations: DataMeshRelation[] = []
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

    // Format Data Mesh relations if provided
    const relationsSection = dataMeshRelations.length > 0
      ? `
DATA MESH RELATIONS (pre-defined relationships between data elements):
${dataMeshRelations.map((rel, idx) => `
Relation ${idx + 1}:
- Element 1: ${rel.element1} (from ${rel.element1Source.file}${rel.element1Source.column ? ` / ${rel.element1Source.column}` : ""}${rel.element1Source.rowIndex !== undefined ? ` / Row ${rel.element1Source.rowIndex + 1}` : ""})
- Element 2: ${rel.element2} (from ${rel.element2Source.file}${rel.element2Source.column ? ` / ${rel.element2Source.column}` : ""}${rel.element2Source.rowIndex !== undefined ? ` / Row ${rel.element2Source.rowIndex + 1}` : ""})
- Explanation: ${rel.relationExplanation}
`).join("\n")}

IMPORTANT: Use these pre-defined relations when determining which visualization methods work best. Consider these relationships when selecting visualizations and explaining your reasoning.
`
      : "";

    return `Analyze the following CSV data and create a complete visualization strategy:

METADATA:
${metadataSummary}

DATA SAMPLES (5 elements per file):
${dataSlicesSummary}
${relationsSection}
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
${dataMeshRelations.length > 0 
  ? "- Use the pre-defined Data Mesh relations provided above when determining visualization methods\n- The relations have been carefully analyzed and should guide your visualization choices\n- Explain how each visualization leverages or represents the defined relations"
  : "- Identify all relevant relations between files"}
- Choose appropriate visualizations based on the data, relations, and user prompt
- Explain each decision clearly
- Consider the user prompt when selecting visualizations`;
  }

  /**
   * Build prompt for data mesh analysis
   */
  private buildDataMeshPrompt(
    metadataArray: Metadata[],
    dataSlices: CSVData[]
  ): string {
    const metadataSummary = metadataArray.map((meta, idx) => {
      return `
File ${idx + 1}: ${meta.fileName}
- Columns: ${meta.columns.map(c => `${c.name} (${c.type})`).join(", ")}
- Rows: ${meta.rowCount}
- Header present: ${meta.hasHeader}
`;
    }).join("\n");

    // Include 20 data points from each file (sliced for relation determination)
    const dataSlicesSummary = dataSlices.map((data, idx) => {
      return `
File ${idx + 1}: ${data.fileName}
Total rows in file: ${data.metadata?.rowCount || data.rows.length}
Sample data (20 rows used for relation analysis):
${JSON.stringify(data.rows, null, 2)}
`;
    }).join("\n");

    return `Perform a comprehensive data mesh network analysis on the following CSV data.

NOTE: Only 20 data points (rows) from each file are provided for relation determination. This is a sample to identify relationships and connections between data elements.

METADATA:
${metadataSummary}

SAMPLE DATA (20 rows per file):
${dataSlicesSummary}

Create a JSON response with the following structure:
{
  "relations": [
    {
      "element1": "First element (can be a column name, file name, data value, or conceptual element)",
      "element1Source": {
        "file": "Source file name (e.g., 'orders.csv')",
        "column": "Column name if element1 is a column or data value from a column (optional)",
        "rowIndex": number // Row index (0-based) if element1 is a specific data value (optional)
      },
      "element2": "Second element (can be a column name, file name, data value, or conceptual element)",
      "element2Source": {
        "file": "Source file name (e.g., 'customers.csv')",
        "column": "Column name if element2 is a column or data value from a column (optional)",
        "rowIndex": number // Row index (0-based) if element2 is a specific data value (optional)
      },
      "relationExplanation": "Detailed explanation of how these two elements are connected, related, or interact. Explain the type of relationship, why they are connected, and what insights this connection provides."
    }
  ],
  "summary": "Overall summary of the data mesh network, describing the overall structure, key connections, and patterns found across all data elements."
}

IMPORTANT:
- Identify ALL possible relationships and connections between data elements
- ALWAYS include source information (file, column, rowIndex) for traceability
- For column-to-column relationships: include both column names and file names
- For data value relationships: include file, column, and rowIndex
- For file-to-file relationships: include both file names
- For conceptual relationships: include file names at minimum
- Consider relationships between:
  * Columns within the same file
  * Columns across different files
  * Files themselves
  * Specific data values and patterns
  * Conceptual relationships (semantic, structural, temporal, etc.)
- Be comprehensive - find as many connections as possible
- Explain each relationship clearly and in detail
- Focus on creating a complete network/mesh view of all data connections
- Make sure source information is accurate and traceable`;
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

  /**
   * Fallback data mesh output when AI is not available
   */
  private getFallbackDataMeshOutput(): DataMeshOutput {
    return {
      relations: [],
      summary: "AI service not available",
    };
  }
}
