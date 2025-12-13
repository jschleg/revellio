import type { CSVData, ValidationResult, QualityReport } from "@/lib/types/data";

/**
 * Data Validator - Validates CSV data quality and structure
 */
export class DataValidator {
  /**
   * Validate CSV data structure and content
   */
  validate(data: CSVData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if file has content
    if (data.rows.length === 0) {
      errors.push("File contains no data rows");
    }

    // Check column consistency
    const expectedColumnCount = data.columns.length;
    const inconsistentRows = data.rows.filter(
      (row) => row._raw.length !== expectedColumnCount
    );

    if (inconsistentRows.length > 0) {
      warnings.push(
        `${inconsistentRows.length} row(s) have inconsistent column count`
      );
    }

    // Check for empty columns
    const emptyColumns = data.columns.filter((colName) => {
      const hasData = data.rows.some(
        (row) => row[colName] !== null && row[colName] !== undefined && row[colName] !== ""
      );
      return !hasData;
    });

    if (emptyColumns.length > 0) {
      warnings.push(`${emptyColumns.length} column(s) appear to be empty`);
    }

    // Check for duplicate column names
    const duplicates = this.findDuplicates(data.columns);
    if (duplicates.length > 0) {
      errors.push(`Duplicate column names found: ${duplicates.join(", ")}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Assess data quality
   */
  checkQuality(data: CSVData): QualityReport {
    const issues: string[] = [];
    let completeness = 1;
    let consistency = 1;

    // Calculate completeness (non-null values)
    const totalCells = data.rows.length * data.columns.length;
    let nullCells = 0;

    data.rows.forEach((row) => {
      data.columns.forEach((colName) => {
        const value = row[colName];
        if (value === null || value === undefined || value === "") {
          nullCells++;
        }
      });
    });

    if (totalCells > 0) {
      completeness = 1 - nullCells / totalCells;
      if (completeness < 0.8) {
        issues.push(`Low data completeness: ${(completeness * 100).toFixed(1)}%`);
      }
    }

    // Calculate consistency (column count consistency)
    const expectedColumnCount = data.columns.length;
    const inconsistentRows = data.rows.filter(
      (row) => row._raw.length !== expectedColumnCount
    );

    if (data.rows.length > 0) {
      consistency = 1 - inconsistentRows.length / data.rows.length;
      if (consistency < 1) {
        issues.push(
          `${inconsistentRows.length} row(s) have inconsistent column counts`
        );
      }
    }

    // Check for suspicious patterns
    if (data.rows.length < 10) {
      issues.push("Very small dataset (less than 10 rows)");
    }

    return {
      completeness,
      consistency,
      issues,
    };
  }

  private findDuplicates(array: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    array.forEach((item) => {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    });

    return Array.from(duplicates);
  }
}

