import type { Metadata, CSVData } from "@/lib/types/data";

/**
 * Builds the prompt for data mesh analysis
 */
export function buildDataMeshPrompt(
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

