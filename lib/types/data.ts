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
  | "aggregated-overview";

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
 * Unified AI output structure
 */
export interface VisualizationInstruction {
  type: VisualizationType;
  module: string; // Which visualization module to use
  config: {
    dataSource: string; // Which CSV file(s) to use
    columns?: string[]; // Which columns to visualize
    aggregation?: string; // Optional aggregation method
    filters?: Record<string, unknown>; // Optional filters
  };
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

export interface DataMeshRelation {
  element1: string; // First element (e.g., column name, file name, or data point)
  element1Source: {
    file: string; // Source file name
    column?: string; // Column name if applicable
    rowIndex?: number; // Row index if applicable (0-based)
  };
  element2: string; // Second element (e.g., column name, file name, or data point)
  element2Source: {
    file: string; // Source file name
    column?: string; // Column name if applicable
    rowIndex?: number; // Row index if applicable (0-based)
  };
  relationExplanation: string; // Detailed explanation of the relationship/connection
}

export interface DataMeshOutput {
  relations: DataMeshRelation[];
  summary: string; // Overall summary of the data mesh/network
}
