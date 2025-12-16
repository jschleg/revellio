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

    return `You are an expert data visualization analyst. Analyze the following CSV data and create a comprehensive, professional visualization strategy.

METADATA:
${metadataSummary}

DATA SAMPLES (5 elements per file):
${dataSlicesSummary}
${relationsSection}
USER PROMPT (additional context):
${userPrompt || "No additional context provided"}

CRITICAL: Before creating visualizations, analyze the data structure:
1. Identify column types (string, number, date, boolean)
2. Detect temporal patterns (date/time columns)
3. Identify categorical vs. numerical data
4. Check for relationships between columns
5. Determine data distribution and cardinality
6. Identify potential aggregations needed

VISUALIZATION TYPE SELECTION CRITERIA:

1. BAR-CHART:
   - USE FOR: Comparing values across categories, showing rankings, part-to-whole comparisons
   - REQUIREMENTS: 
     * At least 1 categorical column (X-axis) + 1+ numerical columns (Y-axis)
     * Categorical column should have < 20 unique values (if more, aggregate or group)
   - AGGREGATION: Usually "sum" or "avg" when grouping categories
   - EXAMPLES: Sales by region, revenue by product, counts by category
   - AVOID: When you have time-series data (use line-chart instead)

2. LINE-CHART:
   - USE FOR: Time series, trends over time, continuous data progression
   - REQUIREMENTS:
     * At least 1 date/time column (X-axis) + 1+ numerical columns (Y-axis)
     * Data should be ordered chronologically
   - AGGREGATION: Usually "avg" or "sum" if grouping by time periods
   - EXAMPLES: Revenue over time, temperature trends, stock prices, monthly metrics
   - AVOID: For non-temporal categorical comparisons

3. PIE-CHART:
   - USE FOR: Showing proportions/percentages of a whole, categorical distribution
   - REQUIREMENTS:
     * 1 categorical column + 1 numerical column
     * Categorical should have 2-8 categories (ideal: 3-6)
     * Numerical should represent counts, percentages, or sums
   - AGGREGATION: Usually "sum" or "count"
   - EXAMPLES: Market share, category distribution, status breakdown
   - AVOID: More than 8 categories, when exact values matter more than proportions

4. SCATTER-PLOT:
   - USE FOR: Correlation analysis, relationship between two numerical variables, outlier detection
   - REQUIREMENTS:
     * 2 numerical columns (X and Y axes)
     * Both columns should have continuous numerical values
   - AGGREGATION: Usually null (show raw data points)
   - EXAMPLES: Price vs. quantity, age vs. income, correlation analysis
   - AVOID: When one variable is categorical

5. TABLE:
   - USE FOR: Detailed data inspection, exact values, multi-column comparison, small datasets
   - REQUIREMENTS:
     * Any number of columns
     * Best for < 100 rows (or aggregate first)
   - AGGREGATION: Usually null, or "count" for summary tables
   - EXAMPLES: Transaction details, comparison tables, raw data display
   - AVOID: For large datasets without aggregation

6. AGGREGATED-OVERVIEW:
   - USE FOR: Summary statistics, KPIs, data quality metrics, high-level insights
   - REQUIREMENTS:
     * Multiple numerical columns for statistics
     * Should provide key metrics (sum, avg, min, max, count)
   - AGGREGATION: Multiple aggregations (sum, avg, count, etc.)
   - EXAMPLES: Dashboard summary, data quality report, key metrics overview
   - USE WHEN: User needs quick insights before detailed analysis

7. RELATIONAL-VIEW:
   - USE FOR: Showing relationships between multiple datasets/files, data mesh visualization
   - REQUIREMENTS:
     * Multiple CSV files with identified relationships
     * Pre-defined relations from data mesh analysis
   - EXAMPLES: Foreign key relationships, cross-file connections, data lineage
   - USE WHEN: Data mesh relations are available and relationships are the focus

DATA PROCESSING RULES:

1. COLUMN SELECTION:
   - Always verify column names exist in the data
   - For aggregations, ensure numerical columns are actually numeric
   - For time-series, ensure date columns are properly formatted
   - Select the most relevant columns (not all columns)

2. AGGREGATION STRATEGY:
   - "sum": For additive metrics (revenue, quantity, counts)
   - "avg": For rates, averages, or when normalizing data
   - "count": For counting occurrences, unique values, or frequencies
   - Use aggregation when:
     * Categorical data has many unique values (> 20)
     * Time-series data needs grouping (daily → monthly)
     * Multiple rows share the same category

3. MULTI-FILE HANDLING:
   - If relations exist, consider combining related files
   - Use "combined" as dataSource when merging related datasets
   - Ensure column names are unique when combining (use file prefix if needed)

4. DATA QUALITY:
   - Handle missing/null values appropriately
   - Filter out invalid data points (NaN, null, undefined)
   - Consider data volume: limit to reasonable sizes for visualization

VISUALIZATION STRATEGY:

1. START WITH OVERVIEW:
   - Always include an "aggregated-overview" as the first visualization
   - Provides context and key metrics before detailed analysis

2. PRIORITIZE BY DATA TYPE:
   - Time-series data → line-chart
   - Categorical comparisons → bar-chart
   - Proportions → pie-chart
   - Correlations → scatter-plot
   - Relationships → relational-view

3. CREATE MULTIPLE PERSPECTIVES:
   - Don't just create one visualization
   - Show different aspects: overview, trends, distributions, details
   - Aim for 3-5 visualizations that tell a complete story

4. LEVERAGE RELATIONS:
   ${dataMeshRelations.length > 0 
     ? `- The provided Data Mesh relations reveal important connections\n- Create visualizations that highlight these relationships\n- Consider cross-file visualizations when relations exist\n- Use relational-view to show the network structure`
     : `- Identify implicit relationships between columns/files\n- Consider how data from different files might relate`}

5. USER PROMPT INTEGRATION:
   - If user provides specific questions, create visualizations that answer them
   - If user mentions specific metrics, prioritize those
   - Adapt visualization types to user's analytical goals

OUTPUT REQUIREMENTS:

Create a JSON response with the following structure:
{
  "visualizations": [
    {
      "type": "bar-chart" | "line-chart" | "pie-chart" | "table" | "scatter-plot" | "relational-view" | "aggregated-overview",
      "module": "Descriptive name (e.g., 'Revenue by Region', 'Time Series Analysis')",
      "config": {
        "dataSource": "Exact filename from metadata or 'combined'",
        "columns": ["Exact column names from the data"],
        "aggregation": "sum" | "avg" | "count" | null,
        "filters": {}
      },
      "reasoning": "Detailed explanation: Why this type? What does it reveal? How does it answer the user's question or reveal insights?"
    }
  ],
  "relations": [
    {
      "type": "key" | "time" | "category" | "semantic",
      "sourceColumn": "Exact column name from file 1",
      "targetColumn": "Exact column name from file 2",
      "confidence": 0.0-1.0,
      "description": "Clear description of the relationship"
    }
  ],
  "reasoning": "Overall strategy: How do the visualizations work together? What story do they tell? What insights do they reveal?",
  "metadata": {
    "insights": ["Key insight 1", "Key insight 2", "Actionable finding"],
    "assumptions": ["Assumption about data quality", "Assumption about relationships"]
  }
}

CRITICAL QUALITY CHECKS:
- Verify all column names exist in the actual data
- Ensure data types match visualization requirements
- Use appropriate aggregations for the data structure
- Create a logical sequence of visualizations (overview → detail)
- Provide clear, actionable reasoning for each visualization
- Consider the user's prompt and analytical goals
- Leverage data mesh relations when available

Remember: Quality over quantity. Better to have 3-4 excellent, well-reasoned visualizations than 10 generic ones.`;
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
      "title": "Short, descriptive title (3-8 words) summarizing the relation (e.g., 'Customer Order Chain', 'Revenue Aggregation', 'Date Sequence')",
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

4. RELATION TITLE:
   - Create a concise, descriptive title (3-8 words) that summarizes the relation
   - Use clear, business-friendly language (e.g., "Customer Order Chain", "Revenue Aggregation", "Date Sequence")
   - The title should give an immediate overview of what the relation represents
   - Avoid generic titles like "Relation 1" or "Connection" - be specific

5. RELATION EXPLANATION:
   - Must explain how ALL elements connect, not just pairs
   - Describe the type of relationship (hierarchical, transactional, categorical, temporal, etc.)
   - Include business context when possible
   - Be specific about the nature of the connection

6. NETWORK STRUCTURE:
   - Aim for a balanced network: not too sparse (few relations) or too dense (everything connected)
   - Identify key hub elements (elements that appear in multiple relations)
   - Create relations that reveal data quality issues or inconsistencies
   - Consider both explicit connections (same values) and implicit connections (semantic relationships)

7. SOURCE INFORMATION:
   - ALWAYS include accurate source information (file, column, rowIndex) for traceability
   - Use rowIndex only when referring to specific data values, not entire columns
   - Omit optional fields (column, rowIndex) when not applicable

EXAMPLES:

Good 2-element relation:
- Title: "Customer Order Link"
- Elements: "customer_id" column in orders.csv ↔ "id" column in customers.csv
- Explanation: "Foreign key relationship linking orders to their customers"

Good 3-element relation:
- Title: "Order Transaction Chain"
- Elements: "order_id" in orders.csv, "order_id" in payments.csv, "order_id" in shipments.csv
- Explanation: "Transaction chain connecting an order to its payment and shipment records"

Good 4+ element relation:
- Title: "Multi-Platform Revenue Aggregation"
- Elements: All "revenue" columns across different ad platform files (google_ads, meta_ads, etc.)
- Explanation: "Aggregated revenue metrics from multiple advertising platforms, representing total marketing spend"

IMPORTANT:
- Consider the User Provided Prompt. Adapt context accordingly.
- Identify ALL meaningful relationships and connections
- Be strategic about relation size - use multi-point relations when they reveal important patterns
- Quality over quantity: better to have fewer, well-defined relations than many weak ones
- The AI should decide the optimal number of points per relation based on the logical grouping`;
  }
}
