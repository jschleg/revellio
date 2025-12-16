import OpenAI from "openai";
import { log } from "@/lib/logger";
import type {
  Metadata,
  UnifiedAIOutput,
  DataMeshOutput,
  DataMeshRelation,
  CSVData,
} from "@/lib/types/data";

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
      const prompt = this.buildDataMeshPrompt(metadataArray, dataSlices, userPrompt);
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
      const prompt = this.buildUnifiedAnalysisPrompt(metadataArray, dataSlices, userPrompt, dataMeshRelations);
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
        relations: result.relations || [],
        reasoning: result.reasoning || "No reasoning available",
        metadata: {
          insights: result.metadata?.insights || [],
          assumptions: result.metadata?.assumptions || [],
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

  private buildDataMeshPrompt(
    metadataArray: Metadata[],
    dataSlices: CSVData[],
    userPrompt: string = ""
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
      return `
File ${idx + 1}: ${data.fileName}
Total rows in file: ${data.metadata?.rowCount || data.rows.length}
Sample data (20 rows used for relation analysis):
${JSON.stringify(data.rows, null, 2)}
`;
    }).join("\n");

    const userPromptSection = userPrompt
      ? `

USER CONTEXT / ADDITIONAL INSTRUCTIONS:
${userPrompt}

Please consider this context when identifying relationships and connections.`
      : "";

    return `Perform a comprehensive data mesh network analysis on the following CSV data.

NOTE: Only 20 data points (rows) from each file are provided for relation determination. This is a sample to identify relationships and connections between data elements.

METADATA:
${metadataSummary}

SAMPLE DATA (20 rows per file):
${dataSlicesSummary}${userPromptSection}

Create a JSON response with the following structure:
{
  "relations": [
    {
      "element1": "First element (can be a column name, file name, data value, or conceptual element)",
      "element1Source": {
        "file": "Source file name (e.g., 'orders.csv')",
        "column": "Column name if element1 is a column or data value from a column (optional)",
        "rowIndex": number
      },
      "element2": "Second element (can be a column name, file name, data value, or conceptual element)",
      "element2Source": {
        "file": "Source file name (e.g., 'customers.csv')",
        "column": "Column name if element2 is a column or data value from a column (optional)",
        "rowIndex": number
      },
      "relationExplanation": "Detailed explanation of how these two elements are connected, related, or interact."
    }
  ],
  "summary": "Overall summary of the data mesh network."
}

IMPORTANT:
- Identify ALL possible relationships and connections between data elements
- ALWAYS include source information (file, column, rowIndex) for traceability
- Be comprehensive - find as many connections as possible
- Explain each relationship clearly and in detail`;
  }
}
