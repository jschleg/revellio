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

  private buildUnifiedAnalysisPrompt(
    metadataArray: Metadata[],
    dataSlices: CSVData[],
    userPrompt: string,
    dataMeshRelations: DataMeshRelation[] = []
  ): string {
    // Metadata and data samples are only for reference/context
    const metadataSummary = metadataArray.map((meta, idx) => {
      return `
File ${idx + 1}: ${meta.fileName}
- Columns: ${meta.columns.map(c => `${c.name} (${c.type})`).join(", ")}
- Rows: ${meta.rowCount}
`;
    }).join("\n");

    const dataSlicesSummary = dataSlices.map((data, idx) => {
      const sampleRows = data.rows.slice(0, 5);
      return `
File ${idx + 1}: ${data.fileName}
Sample data (5 rows):
${JSON.stringify(sampleRows, null, 2)}
`;
    }).join("\n");

    if (dataMeshRelations.length === 0) {
      return `No data mesh relations provided. Cannot generate visualizations without relations.`;
    }

    const relationsSection = dataMeshRelations.map((rel, idx) => `
═══════════════════════════════════════════════════════════════════
RELATION ${idx + 1}: ${rel.title}
═══════════════════════════════════════════════════════════════════

Elements:
${rel.elements.map((element, elIdx) => `  ${elIdx + 1}. ${element.name}
     Source: ${element.source.file}${element.source.column ? ` / ${element.source.column}` : ""}${element.source.rowIndex !== undefined ? ` / Row ${element.source.rowIndex + 1}` : ""}`).join("\n")}

Explanation: ${rel.relationExplanation}

YOUR TASK FOR THIS RELATION:
Analyze this relation and determine the best visualization type to display it.
Consider:
- What type of data do the elements contain? (categorical, numerical, temporal, hierarchical)
- What is the relationship pattern? (flow, hierarchy, correlation, comparison, distribution)
- Which visualization type best represents this specific relation?
- What columns from the referenced files should be used?
- What aggregation (if any) is needed?

Generate ONE visualization instruction for this relation.
`).join("\n\n");

    return `You are a data visualization expert. Your ONLY task is to determine how to display each provided Data Mesh relation.

REFERENCE CONTEXT (for understanding data structure - use only to verify column names and data types):
METADATA:
${metadataSummary}

DATA SAMPLES (for reference only - to understand data structure):
${dataSlicesSummary}

USER PROMPT (additional context):
${userPrompt || "No additional context provided"}

═══════════════════════════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════════════════════════

For EACH relation below, determine the best way to visualize it:

1. ANALYZE THE RELATION:
   - What elements are connected?
   - What data types are involved? (categorical, numerical, temporal)
   - What is the relationship pattern? (comparison, flow, hierarchy, correlation, etc.)

2. CHOOSE VISUALIZATION TYPE:
   Available types: bar-chart, line-chart, pie-chart, scatter-plot, table, aggregated-overview, relational-view, treemap, sankey, heatmap, radar, stream, sunburst, bump, parallel-coordinates, network, calendar, chord, circle-packing, funnel, marimekko, swarmplot, boxplot, bullet, icicle, radial-bar, tree, waffle, geo
   
   Selection criteria:
   - Categorical + Numerical → bar-chart, pie-chart, treemap
   - Temporal + Numerical → line-chart, stream, calendar
   - 2 Numerical → scatter-plot
   - Flow/Process → sankey, funnel
   - Network/Connections → network, chord
   - Hierarchy → treemap, sunburst, tree, icicle
   - Matrix/Grid → heatmap
   - Multiple metrics → radar, parallel-coordinates

3. SELECT COLUMNS:
   - Use columns from the files referenced in the relation elements
   - Verify column names exist in the metadata above
   - Choose columns that best represent the relation

4. DETERMINE AGGREGATION:
   - "sum": For totals, counts, additive metrics
   - "avg": For averages, rates
   - "count": For counting occurrences
   - null: For raw data display

5. PROVIDE REASONING:
   - Explain why this visualization type fits this relation
   - Describe how it will display the relationship

${relationsSection}

═══════════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════

Create a JSON response with this structure:

{
  "visualizations": [
    {
      "type": "visualization-type",
      "module": "Descriptive title for this visualization",
      "config": {
        "dataSource": "exact-filename.csv" or "combined",
        "columns": ["exact", "column", "names"],
        "aggregation": "sum" | "avg" | "count" | null,
        "filters": {}
      },
      "schema": {
        "dataPoints": [
          {
            "file": "exact-filename.csv",
            "column": "exact-column-name",
            "rowIndex": null // Omit or set to null to use ALL rows from this column
          }
          // ... all data points needed for this visualization
        ],
        "structure": {
          // Structure depends on visualization type:
          // For bar-chart, line-chart, scatter-plot:
          "xAxis": {
            "column": "exact-column-name",
            "file": "exact-filename.csv",
            "type": "categorical" | "numerical" | "temporal"
          },
          "yAxis": {
            "columns": [
              {
                "column": "exact-column-name",
                "file": "exact-filename.csv",
                "label": "Display label (optional)"
              }
            ]
          },
          // For aggregated visualizations:
          "groupBy": {
            "column": "exact-column-name",
            "file": "exact-filename.csv"
          },
          "aggregate": {
            "method": "sum" | "avg" | "count" | "min" | "max",
            "column": "exact-column-name",
            "file": "exact-filename.csv"
          }
        },
        "aggregation": "sum" | "avg" | "count" | "min" | "max" | null,
        "filters": {}
      },
      "reasoning": "Why this visualization type was chosen for this relation and how it displays the relationship"
    }
    // ... one visualization per relation
  ],
  "reasoning": "Brief summary: how the visualizations represent the relations"
}

CRITICAL REQUIREMENTS FOR SCHEMA:
- The "schema" field is MANDATORY and must be COMPLETE for each visualization
- "dataPoints" must list ALL data points needed, with exact file and column names
- "structure" must define the complete visualization structure (xAxis, yAxis, groupBy, etc.)
- Use ALL data from files (omit rowIndex or set to null) unless specific rows are needed
- Verify all file names and column names exist in the metadata
- The schema must be sufficient to render the visualization without additional inference
- IMPORTANT: The schema defines which data points from the ORIGINAL files are used
- IMPORTANT: Always set rowIndex to null or omit it to use ALL rows from the identified columns
- IMPORTANT: The dataPoints array should include all columns needed for the visualization

EXAMPLE SCHEMA FOR SCATTER-PLOT:
{
  "dataPoints": [
    { "file": "sales.csv", "column": "price", "rowIndex": null },
    { "file": "sales.csv", "column": "quantity", "rowIndex": null }
  ],
  "structure": {
    "xAxis": { "column": "price", "file": "sales.csv", "type": "numerical" },
    "yAxis": {
      "columns": [{ "column": "quantity", "file": "sales.csv", "label": "Quantity Sold" }]
    }
  },
  "aggregation": null,
  "filters": {}
}

CRITICAL REQUIREMENTS:
- Generate ONE visualization per relation
- Use EXACT column names from metadata (case-sensitive)
- Use EXACT file names from metadata
- Verify all columns exist before including them
- Choose appropriate aggregation based on data characteristics
- Provide clear, specific reasoning for each visualization choice
- ALWAYS include a complete "schema" field with all necessary data point identifiers

METADATA:
${metadataSummary}

DATA SAMPLES (5 elements per file):
${dataSlicesSummary}
${relationsSection}
USER PROMPT (additional context):
${userPrompt || "No additional context provided"}

═══════════════════════════════════════════════════════════════════
PHASE 1: DATA ANALYSIS (MANDATORY - DO THIS FIRST)
═══════════════════════════════════════════════════════════════════

Before creating ANY visualizations, perform comprehensive data analysis:

1. COLUMN TYPE IDENTIFICATION:
   - String columns: Categorical data, IDs, names, text fields
   - Number columns: Continuous values, counts, metrics, measurements
   - Date/Time columns: Temporal data (ISO dates, timestamps, date strings)
   - Boolean columns: Binary flags, yes/no, true/false

2. DATA CHARACTERISTICS:
   - Cardinality: Count unique values per column
     * Low cardinality (< 10): Good for pie charts, small bar charts
     * Medium cardinality (10-50): Bar charts, treemaps work well
     * High cardinality (> 50): Requires aggregation or different visualization
   - Distribution: Identify patterns (normal, skewed, uniform, sparse)
   - Missing values: Check for null/empty values that need handling
   - Outliers: Detect extreme values that might need special handling

3. TEMPORAL ANALYSIS:
   - Identify date/time columns (look for: date, time, timestamp, created_at, etc.)
   - Determine time granularity (seconds, minutes, hours, days, months, years)
   - Check if data is sequential/chronological
   - Identify time-based patterns (daily, weekly, monthly, seasonal)

4. RELATIONSHIP DETECTION:
   - Foreign keys: Columns that likely reference other tables
   - Hierarchical structures: Parent-child relationships, nested categories
   - Correlations: Numerical columns that might correlate
   - Cross-file relationships: Use provided data mesh relations

5. BUSINESS CONTEXT:
   - Identify key metrics (revenue, cost, count, percentage, rate)
   - Detect KPIs and performance indicators
   - Recognize business dimensions (region, product, customer, time)
   - Understand the domain (sales, marketing, operations, finance, etc.)

6. AGGREGATION NEEDS:
   - Determine if raw data needs aggregation
   - Identify grouping dimensions (by time, category, region, etc.)
   - Choose appropriate aggregation (sum, avg, count, min, max)

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

8. TREEMAP:
   - USE FOR: Hierarchical data, part-to-whole relationships, showing proportions with size
   - REQUIREMENTS:
     * At least 1 categorical column (categories) + 1 numerical column (values)
     * Numerical values should be positive (negative values will be filtered)
     * Best for 5-30 categories
   - AGGREGATION: Usually "sum" to aggregate values per category
   - EXAMPLES: Market share by product, budget allocation, file size distribution, category breakdown
   - ADVANTAGES: Shows both hierarchy and relative sizes simultaneously
   - USE WHEN: You want to show proportions AND hierarchy in one view

9. SANKEY:
   - USE FOR: Flow diagrams, showing movement/transitions between states, process flows
   - REQUIREMENTS:
     * At least 3 columns: source (categorical), target (categorical), value (numerical)
     * Shows flows from source nodes to target nodes
   - AGGREGATION: Usually "sum" to aggregate flows between same source-target pairs
   - EXAMPLES: Customer journey, energy flows, migration patterns, conversion funnels, data pipeline flows
   - ADVANTAGES: Visualizes complex multi-step processes and relationships
   - USE WHEN: Data represents flows, transitions, or movements between categories

10. HEATMAP:
    - USE FOR: Matrix data, correlation analysis, showing intensity/values in a grid
    - REQUIREMENTS:
      * At least 3 columns: row (categorical), column (categorical), value (numerical)
      * Creates a matrix showing values at row-column intersections
    - AGGREGATION: Usually "sum" or "avg" when multiple values exist for same row-column pair
    - EXAMPLES: Correlation matrix, time-series heatmap (time × category), performance matrix, activity heatmap
    - ADVANTAGES: Shows patterns and intensity across two categorical dimensions
    - USE WHEN: You need to visualize relationships between two categorical variables with intensity

11. RADAR:
    - USE FOR: Multi-dimensional comparison, showing multiple metrics for different categories
    - REQUIREMENTS:
      * 1 categorical column (categories) + 2+ numerical columns (metrics)
      * Each category gets a radar shape with metrics as axes
    - AGGREGATION: Usually "sum" or "avg" when grouping
    - EXAMPLES: Performance comparison across dimensions, skill assessments, multi-metric analysis
    - USE WHEN: Comparing multiple metrics across categories in one view

12. STREAM:
    - USE FOR: Stacked area chart showing composition over time, part-to-whole over time
    - REQUIREMENTS:
      * 1 time/sequence column + 2+ numerical columns (series)
      * Shows how composition changes over time
    - AGGREGATION: Usually "sum" when grouping by time
    - EXAMPLES: Market share over time, category composition trends, stacked time series
    - USE WHEN: Showing how proportions of different categories change over time

13. SUNBURST:
    - USE FOR: Hierarchical data with circular layout, multi-level proportions
    - REQUIREMENTS:
      * 1 hierarchical column (with separators like /, -, _) + 1 numerical column
      * Creates nested rings showing hierarchy levels
    - AGGREGATION: Usually "sum" when grouping by hierarchy
    - EXAMPLES: File system structure, organizational hierarchy, nested categories
    - USE WHEN: Data has clear hierarchy and you want circular, nested visualization

14. BUMP:
    - USE FOR: Ranking changes over time, position evolution
    - REQUIREMENTS:
      * 3 columns: x (time/sequence), series (categories), value (ranking metric)
      * Shows how rankings change across time periods
    - AGGREGATION: Usually "sum" or "avg" when grouping
    - EXAMPLES: Top 10 rankings over time, competitive positions, leaderboard evolution
    - USE WHEN: Tracking how rankings or positions change over time

15. PARALLEL-COORDINATES:
    - USE FOR: Multi-dimensional data analysis, pattern detection across many variables
    - REQUIREMENTS:
      * 2+ numerical columns (all should be numeric)
      * Shows relationships between multiple dimensions simultaneously
    - AGGREGATION: Usually null (show raw data)
    - EXAMPLES: Multi-variate analysis, pattern detection, outlier identification
    - USE WHEN: Analyzing relationships across many numerical dimensions

16. NETWORK:
    - USE FOR: Node-link diagrams, showing connections between entities
    - REQUIREMENTS:
      * 2 columns: source (categorical), target (categorical)
      * Shows nodes connected by links
    - AGGREGATION: Usually "count" when multiple connections exist
    - EXAMPLES: Social networks, dependency graphs, relationship networks
    - USE WHEN: Visualizing connections and relationships between entities

17. CALENDAR:
    - USE FOR: Time-based data in calendar format, activity patterns by date
    - REQUIREMENTS:
      * 1 date column + 1 numerical column (value)
      * Shows values as colored squares in calendar grid
    - AGGREGATION: Usually "sum" when multiple values per date
    - EXAMPLES: Activity calendar, daily metrics, GitHub-style contribution graph
    - USE WHEN: Showing temporal patterns in calendar format

18. CHORD:
    - USE FOR: Circular flow diagrams, showing relationships in circular layout
    - REQUIREMENTS:
      * 3 columns: source (categorical), target (categorical), value (numerical)
      * Creates circular diagram with chords connecting nodes
    - AGGREGATION: Usually "sum" when multiple flows exist
    - EXAMPLES: Migration flows, trade relationships, circular dependencies
    - USE WHEN: Showing bidirectional or circular relationships

19. CIRCLE-PACKING:
    - USE FOR: Hierarchical data with nested circles, showing hierarchy and size
    - REQUIREMENTS:
      * 1 categorical column + 1 numerical column (size)
      * Creates nested circles where size represents value
    - AGGREGATION: Usually "sum" when grouping
    - EXAMPLES: Hierarchical categories, nested groups, bubble hierarchy
    - USE WHEN: Showing hierarchy with size-based encoding

20. FUNNEL:
    - USE FOR: Conversion funnels, process stages, sequential reduction
    - REQUIREMENTS:
      * 1 label column (stages) + 1 numerical column (values)
      * Shows decreasing values through stages
    - AGGREGATION: Usually "sum" when grouping
    - EXAMPLES: Sales funnel, conversion pipeline, process stages
    - USE WHEN: Showing sequential reduction or conversion stages

21. MARIMEKKO:
    - USE FOR: Two-dimensional categorical analysis, showing composition across two dimensions
    - REQUIREMENTS:
      * 3 columns: id (categorical), dimension (categorical), value (numerical)
      * Shows stacked bars with variable widths
    - AGGREGATION: Usually "sum" when grouping
    - EXAMPLES: Market composition, two-dimensional breakdowns
    - USE WHEN: Analyzing composition across two categorical dimensions

22. SWARMPLOT:
    - USE FOR: Distribution visualization, showing individual data points grouped
    - REQUIREMENTS:
      * 2 columns: group (categorical), value (numerical)
      * Shows individual points arranged to show distribution
    - AGGREGATION: Usually null (show raw data)
    - EXAMPLES: Distribution by category, individual data points, density visualization
    - USE WHEN: Showing individual data points and their distribution

23. BOXPLOT:
    - USE FOR: Statistical distribution, quartiles, outliers, median
    - REQUIREMENTS:
      * 2 columns: group (categorical), value (numerical)
      * Shows quartiles, median, and outliers
    - AGGREGATION: Calculated automatically (statistical)
    - EXAMPLES: Statistical distributions, outlier detection, quartile analysis
    - USE WHEN: Showing statistical properties and distributions

24. BULLET:
    - USE FOR: Performance metrics, KPIs with targets and ranges
    - REQUIREMENTS:
      * 1 label column + 1 value column
      * Shows actual value against target ranges
    - AGGREGATION: Usually "sum" or "avg"
    - EXAMPLES: KPI dashboards, performance vs targets, goal tracking
    - USE WHEN: Showing performance against targets or ranges

25. ICICLE:
    - USE FOR: Hierarchical data in rectangular layout, tree structure
    - REQUIREMENTS:
      * 1 hierarchical column + 1 numerical column
      * Similar to treemap but with different layout
    - AGGREGATION: Usually "sum" when grouping
    - EXAMPLES: Hierarchical breakdowns, tree structures
    - USE WHEN: Showing hierarchy in rectangular icicle format

26. RADIAL-BAR:
    - USE FOR: Circular bar charts, showing values in radial layout
    - REQUIREMENTS:
      * 1 categorical column + 1 numerical column
      * Bars arranged in circle
    - AGGREGATION: Usually "sum" when grouping
    - EXAMPLES: Circular comparisons, radial metrics
    - USE WHEN: Want circular layout for bar chart

27. TREE:
    - USE FOR: Hierarchical tree structure, node-link tree diagram
    - REQUIREMENTS:
      * 1 hierarchical column + 1 numerical column
      * Shows tree structure with nodes and links
    - AGGREGATION: Usually "sum" when grouping
    - EXAMPLES: Organizational charts, hierarchical trees, node structures
    - USE WHEN: Showing explicit tree/hierarchical relationships

28. WAFFLE:
    - USE FOR: Part-to-whole visualization in grid format, proportions
    - REQUIREMENTS:
      * 1 categorical column + 1 numerical column
      * Shows proportions as filled squares in grid
    - AGGREGATION: Usually "sum" when grouping
    - EXAMPLES: Market share grid, proportion visualization, percentage breakdown
    - USE WHEN: Showing proportions in grid/square format

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

═══════════════════════════════════════════════════════════════════
PHASE 2: VISUALIZATION STRATEGY (DECISION FRAMEWORK)
═══════════════════════════════════════════════════════════════════

DECISION TREE - Follow this logic to choose visualizations:

STEP 1: START WITH OVERVIEW (ALWAYS FIRST)
   → Create "aggregated-overview" as the FIRST visualization
   → Provides context: total rows, key metrics, data quality
   → Exception: Skip if user explicitly asks for specific visualization

STEP 2: IDENTIFY PRIMARY ANALYSIS GOAL
   
   A) TIME-SERIES ANALYSIS (date/time column detected):
      → Primary: "line-chart" (single metric over time)
      → Alternative: "stream" (multiple metrics, showing composition)
      → Alternative: "calendar" (daily patterns, activity heatmap)
      → If ranking over time: "bump"
      → Aggregation: Group by time period (daily → monthly, etc.)
   
   B) CATEGORICAL COMPARISON (categorical + numerical):
      → Low cardinality (2-8): "pie-chart" (proportions)
      → Medium cardinality (8-30): "bar-chart" (rankings, comparisons)
      → High cardinality (>30): "treemap" (hierarchical grouping)
      → If circular layout preferred: "radial-bar"
      → If grid format: "waffle"
   
   C) HIERARCHICAL DATA (nested structure detected):
      → Circular layout: "sunburst"
      → Rectangular layout: "treemap" or "icicle"
      → Node-link tree: "tree"
      → Nested circles: "circle-packing"
   
   D) CORRELATION/RELATIONSHIP ANALYSIS:
      → 2 numerical variables: "scatter-plot"
      → 3+ numerical variables: "parallel-coordinates"
      → Matrix (2 categorical + 1 numerical): "heatmap"
      → Network relationships: "network" or "chord"
   
   E) FLOW/PROCESS ANALYSIS:
      → Source → Target flows: "sankey"
      → Bidirectional flows: "chord"
      → Conversion stages: "funnel"
   
   F) DISTRIBUTION ANALYSIS:
      → Statistical properties: "boxplot"
      → Individual points: "swarmplot"
      → Multi-metric comparison: "radar"
   
   G) PERFORMANCE/KPI DASHBOARD:
      → KPI metrics: "bullet"
      → Two-dimensional composition: "marimekko"

STEP 3: CREATE MULTI-PERSPECTIVE STORY (3-5 visualizations)
   → Overview → Trend → Distribution → Relationship → Detail
   → Each visualization should answer a different question
   → Build narrative: "What?" → "How?" → "Why?" → "What if?"
   → Use complementary visualization types (not redundant)

STEP 4: VALIDATE CHOICES
   ✓ Does the visualization answer the user's question?
   ✓ Is the data structure appropriate for this visualization type?
   ✓ Will this reveal insights or just show data?
   ✓ Does it complement other visualizations in the set?

4. LEVERAGE RELATIONS:
   ${dataMeshRelations.length > 0 
     ? `- The provided Data Mesh relations reveal important connections\n- Create visualizations that highlight these relationships\n- Consider cross-file visualizations when relations exist\n- Use relational-view to show the network structure`
     : `- Identify implicit relationships between columns/files\n- Consider how data from different files might relate`}

5. USER PROMPT INTEGRATION:
   - If user provides specific questions, create visualizations that answer them
   - If user mentions specific metrics, prioritize those
   - Adapt visualization types to user's analytical goals

═══════════════════════════════════════════════════════════════════
PHASE 3: OUTPUT GENERATION (STRICT REQUIREMENTS)
═══════════════════════════════════════════════════════════════════

OUTPUT FORMAT (JSON):

{
  "visualizations": [
    {
      "type": "exact-type-from-list",
      "module": "Clear, descriptive title (e.g., 'Monthly Revenue Trends', 'Product Category Distribution')",
      "config": {
        "dataSource": "EXACT filename from metadata (case-sensitive) OR 'combined'",
        "columns": ["EXACT column names from data - verify spelling"],
        "aggregation": "sum" | "avg" | "count" | null,
        "filters": {}
      },
      "reasoning": "COMPREHENSIVE explanation (3-5 sentences):
        1. Why this visualization type was chosen
        2. What specific insight or pattern it reveals
        3. How it answers the user's question or business need
        4. What the user should look for in this visualization"
    }
  ],
  "relations": [
    {
      "type": "key" | "time" | "category" | "semantic",
      "sourceColumn": "EXACT column name",
      "targetColumn": "EXACT column name",
      "confidence": 0.0-1.0,
      "description": "Clear relationship description"
    }
  ],
  "reasoning": "STRATEGIC NARRATIVE (5-10 sentences):
    - How visualizations work together as a story
    - The analytical journey: from overview to insights
    - Key patterns and relationships discovered
    - Business implications and actionable insights
    - What questions are answered and what new questions arise",
  "metadata": {
    "insights": [
      "Specific, actionable insight 1 (not generic)",
      "Data-driven finding 2",
      "Business implication 3"
    ],
    "assumptions": [
      "Data quality assumption (e.g., 'Assuming dates are valid')",
      "Business context assumption",
      "Relationship assumption"
    ]
  }
}

═══════════════════════════════════════════════════════════════════
QUALITY ASSURANCE CHECKLIST (MANDATORY)
═══════════════════════════════════════════════════════════════════

BEFORE OUTPUTTING, VERIFY:

□ COLUMN VALIDATION:
  - All column names exist in the actual data (check metadata)
  - Column names match exactly (case-sensitive)
  - Data types are appropriate for visualization type

□ VISUALIZATION SELECTION:
  - Type matches data structure (categorical vs numerical vs temporal)
  - Aggregation is appropriate (sum for totals, avg for rates, count for frequencies)
  - Visualization answers a specific question or reveals an insight

□ DATA PROCESSING:
  - Aggregation logic is correct for the use case
  - Missing values are handled appropriately
  - Data volume is reasonable (aggregate if too large)

□ NARRATIVE COHERENCE:
  - Visualizations tell a story (not random charts)
  - Each visualization adds unique value
  - Logical progression: overview → analysis → details

□ USER CONTEXT:
  - User prompt is addressed (if provided)
  - Business context is considered
  - Insights are actionable and relevant

□ RELATIONS INTEGRATION:
  - Data mesh relations are leveraged (if available)
  - Cross-file visualizations are considered
  - Relationships enhance understanding

═══════════════════════════════════════════════════════════════════
EXCELLENCE PRINCIPLES
═══════════════════════════════════════════════════════════════════

1. INSIGHT-DRIVEN: Every visualization must reveal something meaningful
2. STORYTELLING: Visualizations should tell a coherent data story
3. PRECISION: Use exact column names, appropriate types, correct aggregations
4. CONTEXT: Consider business domain, user goals, data relationships
5. QUALITY > QUANTITY: 3-5 excellent visualizations beat 10 generic ones
6. ACTIONABLE: Insights should lead to decisions or further analysis

REMEMBER: You are creating a professional data analysis, not just generating charts.
Make every visualization count. Make every insight valuable.`;
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
