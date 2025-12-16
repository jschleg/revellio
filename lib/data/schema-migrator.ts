/**
 * Schema migration utilities
 * Converts old config-based instructions to new schema-based instructions
 */

import type {
  VisualizationInstruction,
  DataPointReference,
  VisualizationSchema,
} from "@/lib/types/data";

/**
 * Convert old config format to new schema format
 * This is a compatibility layer for backward compatibility
 */
export function migrateInstructionToSchema(
  instruction: VisualizationInstruction,
  csvData: Array<{ fileName: string }>
): VisualizationInstruction {
  // If schema already exists, return as-is
  if (instruction.schema) {
    return instruction;
  }

  // If no config, cannot migrate
  if (!instruction.config) {
    throw new Error("Cannot migrate: instruction has neither schema nor config");
  }

  const { dataSource, columns = [], aggregation } = instruction.config;
  const file = dataSource && dataSource !== "combined" ? dataSource : csvData[0]?.fileName;

  if (!file) {
    throw new Error("Cannot determine source file for migration");
  }

  // Create data point references for all columns
  const createRef = (column: string): DataPointReference => ({
    file,
    column,
  });

  // Create data points for all columns
  const dataPoints = columns.map((col) => createRef(col));

  // Create schema structure based on visualization type
  let structure: VisualizationSchema["structure"] = {};

  if (columns.length >= 2) {
    if (instruction.type === "bar-chart" || instruction.type === "line-chart" || instruction.type === "scatter-plot") {
      structure = {
        xAxis: {
          column: columns[0],
          file,
          type: instruction.type === "scatter-plot" ? "numerical" : instruction.type === "line-chart" ? "temporal" : "categorical",
        },
        yAxis: {
          columns: columns.slice(1).map((col) => ({
            column: col,
            file,
          })),
        },
      };
    } else if (instruction.type === "pie-chart") {
      structure = {
        groupBy: {
          column: columns[0],
          file,
        },
        aggregate: {
          method: (aggregation as "sum" | "avg" | "count" | "min" | "max") || "sum",
          column: columns[1],
          file,
        },
      };
    }
  }

  const schema: VisualizationSchema = {
    dataPoints,
    structure,
    aggregation: aggregation ?? null,
    filters: {},
  };

  return {
    ...instruction,
    schema,
  };
}

