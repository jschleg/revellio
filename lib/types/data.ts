/**
 * Core data types for Revellio
 */

export type ColumnType = "string" | "number" | "date" | "boolean" | "unknown";

export interface Column {
  name: string;
  type: ColumnType;
  index: number;
}

export interface Row {
  _raw: string[];
  [columnName: string]: string | number | boolean | null | string[] | undefined;
}

export interface SampleData {
  rows: Row[];
  totalRows: number;
}

export interface Metadata {
  fileName: string;
  columns: Column[];
  columnTypes: ColumnType[];
  sample: SampleData;
  rowCount: number;
  hasHeader: boolean;
}

export interface CSVData {
  fileName: string;
  columns: string[];
  rows: Row[];
  rawContent: string;
  metadata: Metadata;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface QualityReport {
  completeness: number; // 0-1
  consistency: number; // 0-1
  issues: string[];
}

export interface Relation {
  type: "key" | "time" | "category" | "semantic";
  sourceColumn: string;
  targetColumn: string;
  confidence: number; // 0-1
  description: string;
}

export interface SemanticOverlap {
  columns: string[];
  similarity: number; // 0-1
  description: string;
}

export interface Structure {
  tables: Metadata[];
  relations: Relation[];
  overlaps: SemanticOverlap[];
  suggestedMerge?: {
    tables: string[];
    strategy: "homogeneous" | "heterogeneous";
    assumptions: string[];
  };
}

export interface ProcessedData {
  raw: CSVData[];
  merged?: MergedData;
  structure: Structure;
}

export interface MergedData {
  columns: Column[];
  rows: Row[];
  sourceFiles: string[];
  mergeStrategy: string;
}

export type VisualizationType = 
  | "bar-chart"
  | "line-chart"
  | "pie-chart"
  | "table"
  | "scatter-plot"
  | "relational-view"
  | "aggregated-overview"
  | "treemap"
  | "sankey"
  | "heatmap"
  | "radar"
  | "stream"
  | "sunburst"
  | "bump"
  | "parallel-coordinates"
  | "network"
  | "calendar"
  | "chord"
  | "circle-packing"
  | "funnel"
  | "marimekko"
  | "swarmplot"
  | "boxplot"
  | "bullet"
  | "icicle"
  | "radial-bar"
  | "tree"
  | "waffle"
  | "geo";

export interface VisualizationSuggestion {
  type: VisualizationType;
  data: ProcessedData;
  explanation: string;
  reasoning: string;
}

export interface AIAnalysis {
  structure: Structure;
  visualizations: VisualizationSuggestion[];
  insights: string[];
  assumptions: string[];
}

export interface Decision {
  type: "visualization" | "merge" | "relation";
  data: unknown;
  reasoning: string;
}

export interface Explanation {
  decision: Decision;
  rationale: string;
  alternatives?: string[];
  confidence: number;
}

/**
 * Data point identifier - exactly identifies a data point in the original file
 */
export interface DataPointIdentifier {
  file: string; // Exact file name
  column: string; // Exact column name
  rowIndex?: number; // Optional: specific row index (0-based), if not provided, use all rows
}

/**
 * Complete visualization schema - defines the exact structure and data points for a visualization
 */
export interface VisualizationSchema {
  // Exact data point identifiers - defines which data points to use from original files
  dataPoints: DataPointIdentifier[];
  
  // Complete structure for the visualization
  structure: {
    // For charts: defines axes, series, etc.
    xAxis?: {
      column: string; // Column name for X-axis
      file: string; // Source file
      type?: "categorical" | "numerical" | "temporal";
    };
    yAxis?: {
      columns: Array<{
        column: string; // Column name for Y-axis
        file: string; // Source file
        label?: string; // Display label
      }>;
    };
    // For aggregated views: defines grouping and aggregation
    groupBy?: {
      column: string;
      file: string;
    };
    aggregate?: {
      method: "sum" | "avg" | "count" | "min" | "max";
      column: string;
      file: string;
    };
    // Additional visualization-specific configuration
    [key: string]: unknown;
  };
  
  // Aggregation method if needed
  aggregation?: "sum" | "avg" | "count" | "min" | "max" | null;
  
  // Filters to apply
  filters?: Record<string, unknown>;
}

/**
 * Unified AI output structure
 */
export interface VisualizationInstruction {
  type: VisualizationType;
  module: string; // Which visualization module to use
  config: {
    dataSource: string; // Which CSV file(s) to use (for backward compatibility)
    columns?: string[]; // Which columns to visualize (for backward compatibility)
    aggregation?: "sum" | "avg" | "count" | null; // Optional aggregation method (for backward compatibility)
    filters?: Record<string, unknown>; // Optional filters (for backward compatibility)
  };
  // Complete schema - defines exact data points and structure for this visualization
  schema?: VisualizationSchema; // Optional for backward compatibility, but should always be provided by AI
  reasoning: string; // Why this visualization was chosen
}

export interface UnifiedAIOutput {
  visualizations: VisualizationInstruction[];
  relations: Relation[];
  reasoning: string; // Overall reasoning for all decisions
  metadata: {
    insights: string[];
    assumptions: string[];
  };
}

export interface DataMeshElement {
  name: string; // Element name (e.g., column name, file name, or data point)
  source: {
    file: string; // Source file name
    column?: string; // Column name if applicable
    rowIndex?: number; // Row index if applicable (0-based)
  };
}

export interface DataMeshRelation {
  title: string; // Short, descriptive title summarizing the relation (e.g., "Customer Order Chain", "Revenue Aggregation")
  elements: DataMeshElement[]; // Array of elements connected by this relation (minimum 2)
  relationExplanation: string; // Detailed explanation of the relationship/connection between all elements
}

export interface DataMeshOutput {
  relations: DataMeshRelation[];
  summary: string; // Overall summary of the data mesh/network
}
