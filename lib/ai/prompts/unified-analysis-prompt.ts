import type { Metadata, Row, UnifiedAIOutput, DataMeshRelation } from "@/lib/types/data";

/**
 * Builds the prompt for visualization analysis
 */
export function buildUnifiedAnalysisPrompt(
  metadataArray: Metadata[],
  dataSlices: Array<{ fileName: string; rows: Row[] }>,
  userPrompt: string,
  relations?: DataMeshRelation[],
  existingOutput?: UnifiedAIOutput,
  feedback?: string
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

  // Handle feedback scenario - include existing output and feedback
  const existingOutputSection = existingOutput
    ? `\n\nPREVIOUS OUTPUT (for reference):
${JSON.stringify(existingOutput, null, 2)}`
    : "";

  const feedbackSection = feedback
    ? `\n\nUSER FEEDBACK: ${feedback}\n\nPlease regenerate the visualizations considering this feedback along with the previous output.`
    : "";

  // Build relations section if provided
  const relationsSection = relations && relations.length > 0
    ? `\n\nSELECTED RELATIONS (you MUST create one visualization for EACH relation):
${relations.map((rel, idx) => {
  const elements = rel.elements.map(e => {
    let desc = e.source.file;
    if (e.source.column) desc += ` → ${e.source.column}`;
    if (e.source.rowIndex !== undefined) desc += ` (Row ${e.source.rowIndex + 1})`;
    return desc;
  }).join(", ");
  return `Relation ${idx + 1}: ${rel.title}
  Explanation: ${rel.relationExplanation}
  Elements: ${elements}`;
}).join("\n\n")}

CRITICAL: You MUST create exactly ${relations.length} visualization(s), one for each relation above. Each visualization should directly visualize the relationship described in its corresponding relation.`
    : "";

  return `Create visualizations for the provided CSV data.${relationsSection}

METADATA:
${metadataSummary}

DATA SAMPLES:
${dataSamples}

USER REQUEST: ${userPrompt || "Create appropriate visualizations"}${existingOutputSection}${feedbackSection}

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
- Provide clear reasoning for each choice${relations && relations.length > 0 ? `
- CRITICAL: Create exactly ${relations.length} visualization(s), one per relation
- Each visualization must directly visualize the relationship described in its corresponding relation
- The visualization should use the data points and elements specified in the relation` : ""}`;

}