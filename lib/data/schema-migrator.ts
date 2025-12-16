/**
 * Schema migration utilities
 * Converts old config-based instructions to new schema-based instructions
 */

import type {
  VisualizationInstruction,
  DataPointReference,
  BarChartSchema,
  LineChartSchema,
  PieChartSchema,
  ScatterPlotSchema,
  TableSchema,
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

  // Migrate based on visualization type
  switch (instruction.type) {
    case "bar-chart":
      if (columns.length < 2) {
        throw new Error("Bar chart requires at least 2 columns");
      }
      return {
        ...instruction,
        schema: {
          type: "bar-chart",
          dataPoints: {
            category: createRef(columns[0]),
            values: columns.slice(1).map(createRef),
          },
          aggregation: aggregation ?? null,
        } as BarChartSchema,
      };

    case "line-chart":
      if (columns.length < 2) {
        throw new Error("Line chart requires at least 2 columns");
      }
      return {
        ...instruction,
        schema: {
          type: "line-chart",
          dataPoints: {
            time: createRef(columns[0]),
            series: columns.slice(1).map(createRef),
          },
          aggregation: aggregation ?? null,
        } as LineChartSchema,
      };

    case "pie-chart":
      if (columns.length < 2) {
        throw new Error("Pie chart requires at least 2 columns");
      }
      return {
        ...instruction,
        schema: {
          type: "pie-chart",
          dataPoints: {
            category: createRef(columns[0]),
            value: createRef(columns[1]),
          },
          aggregation: aggregation ?? null,
        } as PieChartSchema,
      };

    case "scatter-plot":
      if (columns.length < 2) {
        throw new Error("Scatter plot requires at least 2 columns");
      }
      return {
        ...instruction,
        schema: {
          type: "scatter-plot",
          dataPoints: {
            x: createRef(columns[0]),
            y: createRef(columns[1]),
            group: columns[2] ? createRef(columns[2]) : undefined,
          },
        } as ScatterPlotSchema,
      };

    case "table":
      return {
        ...instruction,
        schema: {
          type: "table",
          dataPoints: {
            columns: columns.map(createRef),
          },
        } as TableSchema,
      };

    // Add more cases as needed
    default:
      throw new Error(`Migration not yet implemented for type: ${instruction.type}`);
  }
}

