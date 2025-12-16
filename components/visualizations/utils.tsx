"use client";

import type { CSVData } from "@/lib/types/data";

/**
 * Apply aggregation to data based on instruction config
 */
export function applyAggregation(
  data: CSVData["rows"],
  columns: string[],
  aggregation: "sum" | "avg" | "count" | null | undefined
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
  const grouped = data.reduce<Record<string, { sum: number; count: number }>>((acc, row) => {
    const key = String(row[categoryCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;

    if (!acc[key]) {
      acc[key] = { sum: 0, count: 0 };
    }

    if (aggregation === "sum" || aggregation === "avg") {
      acc[key].sum += value;
      acc[key].count += 1;
    } else if (aggregation === "count") {
      acc[key].count += 1;
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

