import { useCallback } from "react";
import { CSVParser } from "@/lib/data/csv-parser";
import type { CSVData } from "@/lib/types/data";

export function useFileHandling() {
  const handleFilesSelected = useCallback(
    async (selectedFiles: File[]): Promise<CSVData[]> => {
      const parser = new CSVParser();
      const parsedData: CSVData[] = [];

      for (const file of selectedFiles) {
        try {
          const content = await file.text();
          if (!parser.validate(content)) {
            continue;
          }
          const data = await parser.parse(file);
          parsedData.push(data);
        } catch {
          // Silently skip invalid files
        }
      }

      return parsedData;
    },
    []
  );

  return {
    handleFilesSelected,
  };
}

