import type { CSVData, ProcessedData, MergedData, Structure } from "@/lib/types/data";
import { StructureAnalyzer } from "@/lib/analysis/structure-analyzer";

/**
 * Data Processor - Processes and aggregates CSV data
 */
export class DataProcessor {
  private structureAnalyzer: StructureAnalyzer;

  constructor() {
    this.structureAnalyzer = new StructureAnalyzer();
  }

  /**
   * Process one or more CSV files
   */
  async process(csvData: CSVData[]): Promise<ProcessedData> {
    if (csvData.length === 0) {
      throw new Error("No CSV data provided");
    }

    // Analyze structure
    const structure = this.structureAnalyzer.analyze(
      csvData.map((data) => data.metadata)
    );

    // If multiple files and structure suggests merge, create merged data
    let merged: MergedData | undefined;
    if (csvData.length > 1 && structure.suggestedMerge) {
      merged = this.mergeData(csvData, structure.suggestedMerge.strategy);
    }

    return {
      raw: csvData,
      merged,
      structure,
    };
  }

  /**
   * Aggregate data by specified columns
   */
  aggregate(
    data: ProcessedData,
    groupBy: string[],
    aggregations: { column: string; operation: "sum" | "avg" | "count" | "min" | "max" }[]
  ): Record<string, unknown>[] {
    const sourceData = data.merged || data.raw[0];
    if (!sourceData) {
      return [];
    }

    const grouped = new Map<string, typeof sourceData.rows>();

    // Group rows
    sourceData.rows.forEach((row) => {
      const key = groupBy.map((col) => String(row[col] || "")).join("|");
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(row);
    });

    // Aggregate each group
    const result: Record<string, unknown>[] = [];
    grouped.forEach((rows, key) => {
      const groupKey = key.split("|");
      const aggregated: Record<string, unknown> = {};

      // Add group by columns
      groupBy.forEach((col, index) => {
        aggregated[col] = rows[0]?.[col] ?? null;
      });

      // Apply aggregations
      aggregations.forEach((agg) => {
        const values = rows
          .map((row) => row[agg.column])
          .filter((val): val is number => typeof val === "number");

        switch (agg.operation) {
          case "sum":
            aggregated[`${agg.column}_sum`] = values.reduce((a, b) => a + b, 0);
            break;
          case "avg":
            aggregated[`${agg.column}_avg`] =
              values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case "count":
            aggregated[`${agg.column}_count`] = values.length;
            break;
          case "min":
            aggregated[`${agg.column}_min`] =
              values.length > 0 ? Math.min(...values) : null;
            break;
          case "max":
            aggregated[`${agg.column}_max`] =
              values.length > 0 ? Math.max(...values) : null;
            break;
        }
      });

      result.push(aggregated);
    });

    return result;
  }

  private mergeData(
    csvData: CSVData[],
    strategy: "homogeneous" | "heterogeneous"
  ): MergedData {
    if (strategy === "homogeneous") {
      return this.mergeHomogeneous(csvData);
    } else {
      return this.mergeHeterogeneous(csvData);
    }
  }

  private mergeHomogeneous(csvData: CSVData[]): MergedData {
    // Assume all files have same structure
    const firstFile = csvData[0];
    const allRows = csvData.flatMap((file) => file.rows);

    return {
      columns: firstFile.metadata.columns,
      rows: allRows,
      sourceFiles: csvData.map((file) => file.fileName),
      mergeStrategy: "homogeneous",
    };
  }

  private mergeHeterogeneous(csvData: CSVData[]): MergedData {
    // Collect all unique columns
    const allColumns = new Set<string>();
    csvData.forEach((file) => {
      file.columns.forEach((col) => allColumns.add(col));
    });

    const columns = Array.from(allColumns).map((name, index) => ({
      name,
      type: "string" as const,
      index,
    }));

    // Merge rows, filling missing columns with null
    const allRows = csvData.flatMap((file) =>
      file.rows.map((row) => {
        const mergedRow: Record<string, unknown> & { _raw: string[] } = {
          _raw: [],
        };
        columns.forEach((col) => {
          mergedRow[col.name] = row[col.name] ?? null;
        });
        return mergedRow as typeof file.rows[0];
      })
    );

    return {
      columns,
      rows: allRows,
      sourceFiles: csvData.map((file) => file.fileName),
      mergeStrategy: "heterogeneous",
    };
  }
}

