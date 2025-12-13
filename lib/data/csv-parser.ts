import type { CSVData, Row, Metadata, Column, ColumnType } from "@/lib/types/data";

/**
 * CSV Parser - Handles parsing and basic validation of CSV files
 */
export class CSVParser {
  /**
   * Parse a CSV file into structured data
   */
  async parse(file: File): Promise<CSVData> {
    const content = await file.text();
    const fileName = file.name;

    // Detect delimiter (comma, semicolon, tab)
    const delimiter = this.detectDelimiter(content);
    
    // Split into lines
    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    
    if (lines.length === 0) {
      throw new Error("CSV file is empty");
    }

    // Parse header
    const headerLine = lines[0];
    const columns = this.parseLine(headerLine, delimiter);
    const hasHeader = this.looksLikeHeader(columns);

    // Use first line as header or generate column names
    const columnNames = hasHeader ? columns : this.generateColumnNames(columns.length);
    const dataStartIndex = hasHeader ? 1 : 0;

    // Parse data rows
    const rows: Row[] = [];
    for (let i = dataStartIndex; i < lines.length; i++) {
      const values = this.parseLine(lines[i], delimiter);
      const row: Row = { _raw: values };
      
      // Map values to column names
      columnNames.forEach((colName, index) => {
        row[colName] = this.parseValue(values[index] || "");
      });
      
      rows.push(row);
    }

    // Extract metadata
    const metadata = this.extractMetadata(fileName, columnNames, rows, hasHeader);

    return {
      fileName,
      columns: columnNames,
      rows,
      rawContent: content,
      metadata,
    };
  }

  /**
   * Validate CSV content before parsing
   */
  validate(content: string): boolean {
    if (!content || content.trim().length === 0) {
      return false;
    }

    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    return lines.length > 0;
  }

  private detectDelimiter(content: string): string {
    const firstLine = content.split(/\r?\n/)[0];
    const delimiters = [",", ";", "\t"];
    
    let maxCount = 0;
    let detectedDelimiter = ",";

    for (const delim of delimiters) {
      const count = (firstLine.match(new RegExp(`\\${delim}`, "g")) || []).length;
      if (count > maxCount) {
        maxCount = count;
        detectedDelimiter = delim;
      }
    }

    return detectedDelimiter;
  }

  private parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private parseValue(value: string): string | number | boolean | null {
    if (value === "" || value === null || value === undefined) {
      return null;
    }

    // Try boolean
    const lower = value.toLowerCase();
    if (lower === "true" || lower === "false") {
      return lower === "true";
    }

    // Try number
    const num = Number(value);
    if (!isNaN(num) && isFinite(num) && value.trim() !== "") {
      return num;
    }

    return value;
  }

  private looksLikeHeader(columns: string[]): boolean {
    // Simple heuristic: header usually contains text, not numbers
    const textColumns = columns.filter((col) => {
      const num = Number(col);
      return isNaN(num) || !isFinite(num);
    });
    return textColumns.length > columns.length / 2;
  }

  private generateColumnNames(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `Column ${i + 1}`);
  }

  private extractMetadata(
    fileName: string,
    columns: string[],
    rows: Row[],
    hasHeader: boolean
  ): Metadata {
    const columnTypes = this.detectColumnTypes(columns, rows);
    const typedColumns: Column[] = columns.map((name, index) => ({
      name,
      type: columnTypes[index],
      index,
    }));

    // Get sample (first 5 rows or all if less)
    const sampleSize = Math.min(5, rows.length);
    const sampleRows = rows.slice(0, sampleSize);

    return {
      fileName,
      columns: typedColumns,
      columnTypes,
      sample: {
        rows: sampleRows,
        totalRows: rows.length,
      },
      rowCount: rows.length,
      hasHeader,
    };
  }

  private detectColumnTypes(columns: string[], rows: Row[]): ColumnType[] {
    if (rows.length === 0) {
      return columns.map(() => "unknown");
    }

    return columns.map((colName) => {
      const values = rows
        .map((row) => row[colName])
        .filter((val) => val !== null && val !== undefined);

      if (values.length === 0) {
        return "unknown";
      }

      // Check for numbers
      const numbers = values.filter((val) => typeof val === "number");
      if (numbers.length === values.length) {
        return "number";
      }

      // Check for booleans
      const booleans = values.filter((val) => typeof val === "boolean");
      if (booleans.length === values.length) {
        return "boolean";
      }

      // Check for dates (simple heuristic)
      const datePattern = /^\d{4}-\d{2}-\d{2}/;
      const dates = values.filter(
        (val) => typeof val === "string" && datePattern.test(val)
      );
      if (dates.length > values.length * 0.8) {
        return "date";
      }

      return "string";
    });
  }
}

