import type { Metadata, CSVData, DataMeshRelation } from "@/lib/types/data";

/**
 * Builds the prompt for unified visualization analysis
 */
export function buildUnifiedAnalysisPrompt(
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
   Available types: bar-chart, line-chart, pie-chart, scatter-plot, table
   
   Selection criteria:
   - Categorical + Numerical → bar-chart, pie-chart
   - Temporal + Numerical → line-chart
   - 2 Numerical → scatter-plot
   - Detailed inspection → table

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
     * Medium cardinality (10-50): Bar charts work well
     * High cardinality (> 50): Requires aggregation or use table for detailed view
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

═══════════════════════════════════════════════════════════════════
DATA PROCESSING RULES:
═══════════════════════════════════════════════════════════════════

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

STEP 1: IDENTIFY PRIMARY ANALYSIS GOAL
   
   A) TIME-SERIES ANALYSIS (date/time column detected):
      → Use: "line-chart" (single or multiple metrics over time)
      → Aggregation: Group by time period (daily → monthly, etc.) if needed
      → Alternative: "table" for detailed time-based data inspection
   
   B) CATEGORICAL COMPARISON (categorical + numerical):
      → Low cardinality (2-8): "pie-chart" (proportions/percentages)
      → Medium cardinality (8-30): "bar-chart" (rankings, comparisons)
      → High cardinality (>30): "bar-chart" with aggregation, or "table" for detailed view
   
   C) CORRELATION/RELATIONSHIP ANALYSIS:
      → 2 numerical variables: "scatter-plot" (correlation, outliers)
      → Multiple numerical variables: "table" for detailed comparison
   
   D) DETAILED DATA INSPECTION:
      → Use: "table" for exact values, multi-column comparison
      → Best for: Small datasets (< 100 rows) or aggregated summaries
      → Use when: User needs to see precise values or compare multiple columns

STEP 2: CREATE MULTI-PERSPECTIVE STORY (2-4 visualizations recommended)
   → Each visualization should answer a different question
   → Build narrative: "What?" → "How?" → "Why?"
   → Use complementary visualization types (not redundant)
   → Consider: Overview chart → Detailed table, or Trend → Distribution

STEP 3: VALIDATE CHOICES
   ✓ Does the visualization answer the user's question?
   ✓ Is the data structure appropriate for this visualization type?
   ✓ Will this reveal insights or just show data?
   ✓ Does it complement other visualizations in the set?

4. LEVERAGE RELATIONS:
   ${dataMeshRelations.length > 0 
     ? `- The provided Data Mesh relations reveal important connections\n- Create visualizations that highlight these relationships\n- Consider cross-file visualizations when relations exist`
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

