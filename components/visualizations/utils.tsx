"use client";

import type { CSVData, VisualizationSchema, DataPointIdentifier } from "@/lib/types/data";

/**
 * Apply aggregation to data based on instruction config
 */
export function applyAggregation(
  data: CSVData["rows"],
  columns: string[],
  aggregation: "sum" | "avg" | "count" | "min" | "max" | null | undefined
): Record<string, unknown>[] {
  if (!aggregation || columns.length < 2) {
    return data.map((row) => {
      const entry: Record<string, unknown> = {};
      columns.forEach((col) => {
        entry[col] = row[col] ?? null;
      });
      return entry;
    });
  }

  const [categoryCol, valueCol] = columns;
  const grouped = data.reduce<Record<string, { sum: number; count: number; min?: number; max?: number }>>((acc, row) => {
    const key = String(row[categoryCol] ?? "Unknown");
    const value = Number(row[valueCol]);
    if (isNaN(value)) return acc;

    if (!acc[key]) {
      acc[key] = { sum: 0, count: 0 };
      if (aggregation === "min" || aggregation === "max") {
        acc[key].min = value;
        acc[key].max = value;
      }
    }

    if (aggregation === "sum" || aggregation === "avg") {
      acc[key].sum += value;
      acc[key].count += 1;
    } else if (aggregation === "count") {
      acc[key].count += 1;
    } else if (aggregation === "min" && acc[key].min !== undefined) {
      acc[key].min = Math.min(acc[key].min, value);
    } else if (aggregation === "max" && acc[key].max !== undefined) {
      acc[key].max = Math.max(acc[key].max, value);
    }

    return acc;
  }, {});

  return Object.entries(grouped).map(([key, stats]) => {
    const result: Record<string, unknown> = {
      [categoryCol]: key,
    };

    if (aggregation === "avg") {
      result[valueCol] = stats.count > 0 ? stats.sum / stats.count : 0;
    } else if (aggregation === "sum") {
      result[valueCol] = stats.sum;
    } else if (aggregation === "count") {
      result[valueCol] = stats.count;
    } else if (aggregation === "min") {
      result[valueCol] = stats.min ?? 0;
    } else if (aggregation === "max") {
      result[valueCol] = stats.max ?? 0;
    } else {
      result[valueCol] = stats.count;
    }

    return result;
  });
}

/**
 * Parse and sort dates for time-series data
 */
export function parseAndSortDates(
  data: Array<{ x: string; y: number }>
): Array<{ x: string; y: number }> {
  return [...data].sort((a, b) => {
    // Try parsing as dates first
    const dateA = new Date(a.x);
    const dateB = new Date(b.x);
    
    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // Try as numbers
    const numA = Number(a.x);
    const numB = Number(b.x);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // Fallback to string comparison
    return a.x.localeCompare(b.x);
  });
}

/**
 * Validate columns exist in data
 */
export function validateColumns(
  data: CSVData,
  columns: string[]
): { valid: boolean; missing: string[] } {
  const missing = columns.filter((col) => !data.columns.includes(col));
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get error message component
 */
export function getErrorMessage(message: string) {
  return (
    <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}

/**
 * Extract data points from CSV files based on schema identifiers
 * Uses ALL data from the identified columns (unless specific rowIndex is provided)
 */
export function extractDataFromSchema(
  schema: VisualizationSchema,
  csvData: CSVData[]
): { rows: CSVData["rows"]; columns: string[] } {
  const rows: CSVData["rows"] = [];
  const columnSet = new Set<string>();

  // Group data points by file for efficient processing
  const fileMap = new Map<string, CSVData>();
  csvData.forEach((data) => {
    fileMap.set(data.fileName, data);
  });

  // Process each data point identifier
  schema.dataPoints.forEach((identifier: DataPointIdentifier) => {
    const file = fileMap.get(identifier.file);
    if (!file) {
      console.warn(`File not found: ${identifier.file}`);
      return;
    }

    if (!file.columns.includes(identifier.column)) {
      console.warn(`Column "${identifier.column}" not found in file "${identifier.file}"`);
      return;
    }

    columnSet.add(identifier.column);

    // If specific rowIndex is provided, only use that row
    if (identifier.rowIndex !== undefined && identifier.rowIndex !== null) {
      const row = file.rows[identifier.rowIndex];
      if (row) {
        // Check if this row already exists (avoid duplicates)
        const existingIndex = rows.findIndex((r) => r._raw === row._raw);
        if (existingIndex === -1) {
          rows.push(row);
        }
      }
    } else {
      // Use ALL rows from this column
      // Merge rows from different files, avoiding duplicates
      file.rows.forEach((row) => {
        const existingIndex = rows.findIndex((r) => r._raw === row._raw);
        if (existingIndex === -1) {
          rows.push(row);
        }
      });
    }
  });

  return {
    rows,
    columns: Array.from(columnSet),
  };
}

/**
 * Get data for a specific file and column combination
 */
export function getDataForFileColumn(
  file: string,
  column: string,
  csvData: CSVData[]
): { values: (string | number | boolean | null)[]; rows: CSVData["rows"] } {
  const fileData = csvData.find((data) => data.fileName === file);
  if (!fileData || !fileData.columns.includes(column)) {
    return { values: [], rows: [] };
  }

  const values = fileData.rows.map((row) => row[column] ?? null);
  return { values, rows: fileData.rows };
}

