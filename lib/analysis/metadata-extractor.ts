import type { CSVData, Metadata, ColumnType, SampleData } from "@/lib/types/data";

/**
 * Metadata Extractor - Extracts metadata and samples from CSV data
 */
export class MetadataExtractor {
  /**
   * Extract metadata from CSV data
   */
  extract(csvData: CSVData): Metadata {
    return csvData.metadata;
  }

  /**
   * Get column types for a CSV file
   */
  getColumnTypes(csvData: CSVData): ColumnType[] {
    return csvData.metadata.columnTypes;
  }

  /**
   * Get a sample of data rows
   */
  getSample(csvData: CSVData, count: number = 5): SampleData {
    const sampleRows = csvData.rows.slice(0, Math.min(count, csvData.rows.length));
    
    return {
      rows: sampleRows,
      totalRows: csvData.rows.length,
    };
  }

  /**
   * Extract all metadata from multiple CSV files
   */
  extractAll(csvDataArray: CSVData[]): Metadata[] {
    return csvDataArray.map((data) => this.extract(data));
  }

  /**
   * Get unique column names across all files
   */
  getUniqueColumns(metadataArray: Metadata[]): string[] {
    const columnSet = new Set<string>();
    metadataArray.forEach((metadata) => {
      metadata.columns.forEach((col) => columnSet.add(col.name));
    });
    return Array.from(columnSet);
  }

  /**
   * Check if metadata structures are similar (homogeneous)
   */
  areHomogeneous(metadataArray: Metadata[]): boolean {
    if (metadataArray.length <= 1) {
      return true;
    }

    const firstColumns = metadataArray[0].columns.map((col) => col.name).sort();
    
    return metadataArray.every((metadata) => {
      const columns = metadata.columns.map((col) => col.name).sort();
      return (
        columns.length === firstColumns.length &&
        columns.every((col, index) => col === firstColumns[index])
      );
    });
  }
}

