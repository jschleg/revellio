/**
 * Data extraction utilities for precise data point references
 * Extracts data from CSV files based on DataPointReference specifications
 */

import type { CSVData, DataPointReference, Row } from "@/lib/types/data";

/**
 * Extract data values from a specific data point reference
 * Returns all values from the referenced column, optionally filtered by rowIndex
 */
export function extractDataPoint(
  csvDataArray: CSVData[],
  reference: DataPointReference
): (string | number | boolean | null)[] {
  const file = csvDataArray.find((d) => d.fileName === reference.file);
  if (!file) {
    throw new Error(`File not found: ${reference.file}`);
  }

  if (!file.columns.includes(reference.column)) {
    throw new Error(
      `Column "${reference.column}" not found in file "${reference.file}"`
    );
  }

  // If rowIndex is specified, return only that row's value
  if (reference.rowIndex !== undefined) {
    if (reference.rowIndex < 0 || reference.rowIndex >= file.rows.length) {
      throw new Error(
        `Row index ${reference.rowIndex} out of bounds for file "${reference.file}"`
      );
    }
    const value = file.rows[reference.rowIndex][reference.column];
    return [value ?? null];
  }

  // Otherwise, return all values from the column
  return file.rows.map((row) => row[reference.column] ?? null);
}

/**
 * Extract data for multiple references, returning a combined dataset
 * Each row contains values from all referenced columns
 */
export function extractMultipleDataPoints(
  csvDataArray: CSVData[],
  references: DataPointReference[]
): Array<Record<string, string | number | boolean | null>> {
  if (references.length === 0) {
    return [];
  }

  // Get all files involved
  const files = new Set(references.map((ref) => ref.file));
  const fileMap = new Map<string, CSVData>();
  for (const fileName of files) {
    const file = csvDataArray.find((d) => d.fileName === fileName);
    if (!file) {
      throw new Error(`File not found: ${fileName}`);
    }
    fileMap.set(fileName, file);
  }

  // Determine the maximum number of rows across all referenced files
  const maxRows = Math.max(
    ...Array.from(files).map((fileName) => fileMap.get(fileName)!.rows.length)
  );

  // Extract data row by row
  const result: Array<Record<string, string | number | boolean | null>> = [];

  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    const row: Record<string, string | number | boolean | null> = {};

    for (const ref of references) {
      const file = fileMap.get(ref.file)!;
      const key = `${ref.file}::${ref.column}`;

      // If specific rowIndex is provided, use it; otherwise use current rowIndex
      const actualRowIndex =
        ref.rowIndex !== undefined ? ref.rowIndex : rowIndex;

      if (actualRowIndex < file.rows.length) {
        row[key] = file.rows[actualRowIndex][ref.column] ?? null;
      } else {
        row[key] = null;
      }
    }

    result.push(row);
  }

  return result;
}

/**
 * Extract data with row metadata (original row index and file)
 * Useful for maintaining traceability back to source data
 */
export function extractDataWithMetadata(
  csvDataArray: CSVData[],
  references: DataPointReference[]
): Array<
  Record<string, string | number | boolean | null> & {
    _metadata: {
      rowIndex: number;
      sourceFile: string;
    };
  }
> {
  const data = extractMultipleDataPoints(csvDataArray, references);
  const primaryFile = references[0]?.file;

  return data.map((row, index) => ({
    ...row,
    _metadata: {
      rowIndex: index,
      sourceFile: primaryFile || "",
    },
  }));
}

/**
 * Get all unique values from a data point reference
 * Useful for categorical data
 */
export function extractUniqueValues(
  csvDataArray: CSVData[],
  reference: DataPointReference
): (string | number | boolean)[] {
  const values = extractDataPoint(csvDataArray, reference);
  const unique = Array.from(new Set(values.filter((v) => v !== null)));
  return unique as (string | number | boolean)[];
}

/**
 * Validate that all references point to valid files and columns
 */
export function validateDataPointReferences(
  csvDataArray: CSVData[],
  references: DataPointReference[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const ref of references) {
    const file = csvDataArray.find((d) => d.fileName === ref.file);
    if (!file) {
      errors.push(`File not found: ${ref.file}`);
      continue;
    }

    if (!file.columns.includes(ref.column)) {
      errors.push(
        `Column "${ref.column}" not found in file "${ref.file}". Available columns: ${file.columns.join(", ")}`
      );
      continue;
    }

    if (ref.rowIndex !== undefined) {
      if (ref.rowIndex < 0 || ref.rowIndex >= file.rows.length) {
        errors.push(
          `Row index ${ref.rowIndex} out of bounds for file "${ref.file}" (has ${file.rows.length} rows)`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

