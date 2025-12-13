import type {
  Metadata,
  Structure,
  Relation,
  SemanticOverlap,
} from "@/lib/types/data";

/**
 * Structure Analyzer - Analyzes data structures and relationships (deterministic)
 */
export class StructureAnalyzer {
  /**
   * Analyze structure from multiple metadata sources
   */
  analyze(metadataArray: Metadata[]): Structure {
    const relations = this.findRelations(metadataArray);
    const overlaps = this.detectSemanticOverlap(metadataArray);
    const suggestedMerge = this.suggestMerge(metadataArray);

    return {
      tables: metadataArray,
      relations,
      overlaps,
      suggestedMerge,
    };
  }

  /**
   * Find relations between columns
   */
  findRelations(metadataArray: Metadata[]): Relation[] {
    const relations: Relation[] = [];

    // Find potential key relationships (same column name across tables)
    const columnMap = new Map<string, Metadata[]>();
    metadataArray.forEach((metadata) => {
      metadata.columns.forEach((col) => {
        if (!columnMap.has(col.name)) {
          columnMap.set(col.name, []);
        }
        columnMap.get(col.name)!.push(metadata);
      });
    });

    // Identify key relations
    columnMap.forEach((metadatas, columnName) => {
      if (metadatas.length > 1) {
        metadatas.forEach((meta1, i) => {
          metadatas.slice(i + 1).forEach((meta2) => {
            relations.push({
              type: "key",
              sourceColumn: `${meta1.fileName}.${columnName}`,
              targetColumn: `${meta2.fileName}.${columnName}`,
              confidence: 0.8,
              description: `Potential join key: ${columnName}`,
            });
          });
        });
      }
    });

    // Find time-based columns
    metadataArray.forEach((metadata) => {
      const timeColumns = metadata.columns.filter(
        (col) => col.type === "date" || this.looksLikeDateColumn(col.name)
      );

      if (timeColumns.length > 0) {
        timeColumns.forEach((col) => {
          relations.push({
            type: "time",
            sourceColumn: `${metadata.fileName}.${col.name}`,
            targetColumn: `${metadata.fileName}.${col.name}`,
            confidence: 0.9,
            description: `Time dimension: ${col.name}`,
          });
        });
      }
    });

    return relations;
  }

  /**
   * Detect semantic overlaps between columns
   */
  detectSemanticOverlap(metadataArray: Metadata[]): SemanticOverlap[] {
    const overlaps: SemanticOverlap[] = [];

    // Simple heuristic: columns with similar names
    const allColumns = metadataArray.flatMap((meta) =>
      meta.columns.map((col) => ({
        name: col.name,
        fileName: meta.fileName,
      }))
    );

    for (let i = 0; i < allColumns.length; i++) {
      for (let j = i + 1; j < allColumns.length; j++) {
        const similarity = this.calculateSimilarity(
          allColumns[i].name,
          allColumns[j].name
        );

        if (similarity > 0.7) {
          overlaps.push({
            columns: [allColumns[i].name, allColumns[j].name],
            similarity,
            description: `Similar column names: ${allColumns[i].name} and ${allColumns[j].name}`,
          });
        }
      }
    }

    return overlaps;
  }

  private suggestMerge(metadataArray: Metadata[]): Structure["suggestedMerge"] {
    if (metadataArray.length <= 1) {
      return undefined;
    }

    // Check if structures are homogeneous
    const firstColumns = metadataArray[0].columns.map((col) => col.name).sort();
    const allSame = metadataArray.every((meta) => {
      const cols = meta.columns.map((col) => col.name).sort();
      return (
        cols.length === firstColumns.length &&
        cols.every((col, i) => col === firstColumns[i])
      );
    });

    if (allSame) {
      return {
        tables: metadataArray.map((meta) => meta.fileName),
        strategy: "homogeneous",
        assumptions: ["All files have identical column structure"],
      };
    }

    // Check for common columns
    const commonColumns = this.findCommonColumns(metadataArray);
    if (commonColumns.length > 0) {
      return {
        tables: metadataArray.map((meta) => meta.fileName),
        strategy: "heterogeneous",
        assumptions: [
          `Files share ${commonColumns.length} common column(s): ${commonColumns.join(", ")}`,
          "Missing values will be filled with null",
        ],
      };
    }

    return undefined;
  }

  private looksLikeDateColumn(columnName: string): boolean {
    const lower = columnName.toLowerCase();
    return (
      lower.includes("date") ||
      lower.includes("time") ||
      lower.includes("timestamp") ||
      lower.includes("created") ||
      lower.includes("updated")
    );
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    // Exact match
    if (s1 === s2) return 1.0;

    // One contains the other
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Levenshtein-like simple similarity
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const editDistance = this.levenshteinDistance(longer, shorter);
    return 1 - editDistance / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private findCommonColumns(metadataArray: Metadata[]): string[] {
    if (metadataArray.length === 0) return [];

    const firstColumns = new Set(
      metadataArray[0].columns.map((col) => col.name)
    );

    const common = new Set<string>();
    firstColumns.forEach((colName) => {
      if (
        metadataArray.every((meta) =>
          meta.columns.some((col) => col.name === colName)
        )
      ) {
        common.add(colName);
      }
    });

    return Array.from(common);
  }
}

