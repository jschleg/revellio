import type { Metadata, Row, DataMeshRelation } from "@/lib/types/data";
import type { DataMeshConfig } from "../ai-service";

/**
 * Builds the prompt for data mesh analysis
 */
export function buildDataMeshPrompt(
  metadataArray: Metadata[],
  dataSlices: Array<{ fileName: string; rows: Row[] }>,
  userPrompt: string = "",
  config: DataMeshConfig = {},
  existingRelations?: DataMeshRelation[],
  feedback?: string,
  relationToUpdate?: DataMeshRelation
): string {
  // Only include essential metadata
  const metadataSummary = metadataArray.map((meta, idx) => {
    return `File ${idx + 1}: ${meta.fileName}
Columns: ${meta.columns.map(c => `${c.name} (${c.type})`).join(", ")}
Rows: ${meta.rowCount}`;
  }).join("\n\n");

  // Only include sample rows (not full data structure)
  const dataSamples = dataSlices.map((data, idx) => {
    return `File ${idx + 1}: ${data.fileName}
Sample rows:
${JSON.stringify(data.rows.slice(0, 10), null, 1)}`;
  }).join("\n\n");

  const maxRelations = config.maxRelations ? `Generate up to ${config.maxRelations} relations.` : "";
  const minElements = config.minRelationElements || 2;
  const maxElements = config.maxRelationElements ? `Maximum ${config.maxRelationElements} elements per relation.` : "";
  const focusAreas = config.focusAreas?.length ? `Focus on: ${config.focusAreas.join(", ")}.` : "";

  // Handle single relation update scenario
  const relationToUpdateSection = relationToUpdate
    ? `\n\nRELATION TO UPDATE:
${JSON.stringify(relationToUpdate, null, 2)}

IMPORTANT: You must UPDATE this specific relation based on the user feedback. Return ONLY the updated version of this relation in the relations array. Do not include any other relations.`
    : "";

  // Handle reroll scenario - include existing relations and feedback
  const existingRelationsSection = existingRelations && existingRelations.length > 0 && !relationToUpdate
    ? `\n\nEXISTING RELATIONS (keep these, generate additional ones):
${JSON.stringify(existingRelations, null, 2)}`
    : "";

  const feedbackSection = feedback
    ? `\n\nUSER FEEDBACK: ${feedback}\n\nPlease consider this feedback when ${relationToUpdate ? "updating the relation" : "generating relations"}.`
    : "";

  const rerollInstruction = existingRelations && existingRelations.length > 0 && !relationToUpdate
    ? `\n\nIMPORTANT: Keep all existing relations above. Generate ADDITIONAL relations based on the feedback and data.`
    : "";

  return `Analyze CSV data and identify relationships between data elements.

METADATA:
${metadataSummary}

SAMPLE DATA:
${dataSamples}${userPrompt ? `\n\nUSER CONTEXT: ${userPrompt}` : ""}${relationToUpdateSection}${existingRelationsSection}${feedbackSection}

${maxRelations} ${maxElements} ${focusAreas}
Minimum ${minElements} elements per relation.${rerollInstruction}

OUTPUT JSON:
{
  "relations": [
    {
      "title": "Short descriptive title (3-8 words)",
      "elements": [
        {
          "name": "Element name",
          "source": {
            "file": "filename.csv",
            "column": "column_name (optional)",
            "rowIndex": 0 (optional, 0-based)
          }
        }
      ],
      "relationExplanation": "How elements connect"
    }
  ],
  "summary": "Overall network summary"
}

GUIDELINES:
- Create meaningful connections (2+ elements per relation)
- Use column-level for column relationships, row-level for specific values
- Include accurate source info (file, column, rowIndex when needed)
- Quality over quantity: well-defined relations only`;
}

