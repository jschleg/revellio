import type { Metadata, Row } from "@/lib/types/data";
import type { VisualizationConfig } from "../ai-service";

/**
 * Builds the prompt for visualization analysis
 */
export function buildUnifiedAnalysisPrompt(
  metadataArray: Metadata[],
  dataSlices: Array<{ fileName: string; rows: Row[] }>,
  userPrompt: string,
  config: VisualizationConfig = {}
): string {
  // Only essential metadata
  const metadataSummary = metadataArray.map((meta, idx) => {
    return `File ${idx + 1}: ${meta.fileName}
Columns: ${meta.columns.map(c => `${c.name} (${c.type})`).join(", ")}
Rows: ${meta.rowCount}`;
  }).join("\n\n");

  // Small sample for context
  const dataSamples = dataSlices.map((data, idx) => {
    return `File ${idx + 1}: ${data.fileName}
Sample (5 rows):
${JSON.stringify(data.rows.slice(0, 5), null, 1)}`;
  }).join("\n\n");

  const maxViz = config.maxVisualizations ? `Generate up to ${config.maxVisualizations} visualizations.` : "";
  const preferredTypes = config.preferredTypes?.length ? `Preferred types: ${config.preferredTypes.join(", ")}.` : "";
  const focusMetrics = config.focusMetrics?.length ? `Focus on metrics: ${config.focusMetrics.join(", ")}.` : "";

  return `Create visualizations for the provided CSV data.

METADATA:
${metadataSummary}

DATA SAMPLES:
${dataSamples}

USER REQUEST: ${userPrompt || "Create appropriate visualizations"}

${maxViz} ${preferredTypes} ${focusMetrics}

AVAILABLE TYPES: bar-chart, line-chart, pie-chart, scatter-plot, table

SELECTION GUIDE:
- bar-chart: Categorical + numerical (< 20 categories)
- line-chart: Temporal + numerical (time series)
- pie-chart: Categorical proportions (2-8 categories)
- scatter-plot: 2 numerical variables (correlation)
- table: Detailed data inspection

OUTPUT JSON:
{
  "visualizations": [
    {
      "type": "visualization-type",
      "module": "Descriptive title",
      "config": {
        "dataSource": "filename.csv" or "combined",
        "columns": ["column1", "column2"],
        "aggregation": "sum" | "avg" | "count" | null,
        "filters": {}
      },
      "schema": {
        "dataPoints": [
          {
            "file": "filename.csv",
            "column": "column_name",
            "rowIndex": null
          }
        ],
        "structure": {
          "xAxis": {
            "column": "column_name",
            "file": "filename.csv",
            "type": "categorical" | "numerical" | "temporal"
          },
          "yAxis": {
            "columns": [
              {
                "column": "column_name",
                "file": "filename.csv",
                "label": "Display label"
              }
            ]
          }
        },
        "aggregation": "sum" | "avg" | "count" | null,
        "filters": {}
      },
      "reasoning": "Why this visualization was chosen"
    }
  ],
  "reasoning": "Overall strategy summary"
}

REQUIREMENTS:
- Use exact column/file names from metadata
- Include complete schema with dataPoints and structure
- Set rowIndex to null to use all rows
- Choose appropriate aggregation (sum for totals, avg for rates, count for frequencies)
- Provide clear reasoning for each choice`;

}