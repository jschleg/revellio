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
${rel.elements.map((element, elIdx) => `- Element ${elIdx + 1}: ${element.name} (from ${element.source.file}${element.source.column ? ` / ${element.source.column}` : ""}${element.source.rowIndex !== undefined ? ` / Row ${element.source.rowIndex + 1}` : ""})`).join("\n")}
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
      "elements": [
        {
          "name": "Element name (can be a column name, file name, specific data value, or conceptual element)",
          "source": {
            "file": "Source file name (e.g., 'orders.csv')",
            "column": "Column name if element is a column or data value from a column (optional, omit if not applicable)",
            "rowIndex": number // Row index if element is a specific data value (optional, omit if not applicable, 0-based)
          }
        }
        // ... add more elements (minimum 2, but can be 3, 4, 5, or more as needed)
      ],
      "relationExplanation": "Detailed explanation of how ALL elements in this relation are connected, related, or interact together as a group."
    }
  ],
  "summary": "Overall summary of the data mesh network, including the number of relations and key patterns identified."
}

CRITICAL GUIDELINES FOR CREATING RELATIONS:

1. RELATION SIZE DECISION:
   - Create relations with 2 elements when there's a direct, pairwise connection (e.g., foreign key relationships, direct dependencies)
   - Create relations with 3+ elements when multiple elements form a logical group or network:
     * Hierarchical relationships (parent-child-grandchild)
     * Transaction chains (order → payment → shipment)
     * Category hierarchies (product → category → department)
     * Time-based sequences (start → process → end)
     * Multi-file aggregations (same metric across different sources)
     * Conceptual groupings (all columns measuring the same business concept)

2. QUALITY CRITERIA:
   - Each relation must represent a MEANINGFUL connection - avoid arbitrary groupings
   - All elements in a relation should share a clear logical relationship
   - Prefer fewer, well-defined relations over many weak connections
   - Relations should tell a story or reveal a pattern in the data

3. ELEMENT TYPES:
   - Column-level: When entire columns relate (e.g., "customer_id" in orders.csv relates to "id" in customers.csv)
   - Row-level: When specific data values relate (include rowIndex)
   - File-level: When entire files relate conceptually
   - Mixed: Combine different granularities when it makes sense

4. RELATION EXPLANATION:
   - Must explain how ALL elements connect, not just pairs
   - Describe the type of relationship (hierarchical, transactional, categorical, temporal, etc.)
   - Include business context when possible
   - Be specific about the nature of the connection

5. NETWORK STRUCTURE:
   - Aim for a balanced network: not too sparse (few relations) or too dense (everything connected)
   - Identify key hub elements (elements that appear in multiple relations)
   - Create relations that reveal data quality issues or inconsistencies
   - Consider both explicit connections (same values) and implicit connections (semantic relationships)

6. SOURCE INFORMATION:
   - ALWAYS include accurate source information (file, column, rowIndex) for traceability
   - Use rowIndex only when referring to specific data values, not entire columns
   - Omit optional fields (column, rowIndex) when not applicable

EXAMPLES:

Good 2-element relation:
- "customer_id" column in orders.csv ↔ "id" column in customers.csv
- Explanation: "Foreign key relationship linking orders to their customers"

Good 3-element relation:
- "order_id" in orders.csv, "order_id" in payments.csv, "order_id" in shipments.csv
- Explanation: "Transaction chain connecting an order to its payment and shipment records"

Good 4+ element relation:
- All "revenue" columns across different ad platform files (google_ads, meta_ads, etc.)
- Explanation: "Aggregated revenue metrics from multiple advertising platforms, representing total marketing spend"

IMPORTANT:
- Identify ALL meaningful relationships and connections
- Be strategic about relation size - use multi-point relations when they reveal important patterns
- Quality over quantity: better to have fewer, well-defined relations than many weak ones
- The AI should decide the optimal number of points per relation based on the logical grouping`;
  }
}
