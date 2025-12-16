import { useState, useCallback } from "react";
import { MetadataExtractor } from "@/lib/analysis/metadata-extractor";
import type {
  CSVData,
  Metadata,
  DataMeshOutput,
  DataMeshRelation,
} from "@/lib/types/data";

export function useDataMesh() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<string>("");

  const analyzeDataMesh = useCallback(
    async (
      csvData: CSVData[],
      userPrompt: string
    ): Promise<{
      metadataArray: Metadata[];
      dataSlices: CSVData[];
      payload: {
        metadataArray: Metadata[];
        dataSlices: CSVData[];
        userPrompt: string;
      };
      result: DataMeshOutput;
    }> => {
      setIsProcessing(true);
      setStep("");

      try {
        const metadataExtractor = new MetadataExtractor();
        setStep("Extracting metadata...");
        const metadataArray = metadataExtractor.extractAll(csvData);

        setStep("Preparing data samples (20 rows per file)...");
        const dataSlices: CSVData[] = csvData.map((data) => {
          const slicedRows = data.rows.slice(0, 20);
          return {
            ...data,
            rows: slicedRows,
            rawContent: "",
            metadata: {
              ...data.metadata,
              rowCount: Math.min(20, data.metadata.rowCount),
              sample: {
                rows: slicedRows,
                totalRows: slicedRows.length,
              },
            },
          };
        });

        const payload = {
          metadataArray,
          dataSlices,
          userPrompt: userPrompt || "",
        };

        setStep("Analyzing data mesh network...");
        const response = await fetch("/api/ai/data-mesh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Data mesh analysis failed: ${errorText}`);
        }

        const result: DataMeshOutput = await response.json();

        return {
          metadataArray,
          dataSlices,
          payload,
          result,
        };
      } finally {
        setIsProcessing(false);
        setStep("");
      }
    },
    []
  );

  const generateSampleDataMesh = useCallback(
    (csvData: CSVData[]): DataMeshOutput => {
      const relations: DataMeshRelation[] = [];

      for (let i = 0; i < csvData.length; i++) {
        for (let j = i + 1; j < csvData.length; j++) {
          const file1 = csvData[i];
          const file2 = csvData[j];

          relations.push({
            title: `File Relationship: ${file1.fileName} ↔ ${file2.fileName}`,
            elements: [
              { name: file1.fileName, source: { file: file1.fileName } },
              { name: file2.fileName, source: { file: file2.fileName } },
            ],
            relationExplanation: `These files are related and can be analyzed together. Both contain structured data that may share common patterns or themes.`,
          });

          file1.columns.forEach((col1) => {
            file2.columns.forEach((col2) => {
              const col1Lower = col1.toLowerCase();
              const col2Lower = col2.toLowerCase();

              if (
                col1Lower === col2Lower ||
                col1Lower.includes(col2Lower) ||
                col2Lower.includes(col1Lower) ||
                (col1Lower.includes("date") && col2Lower.includes("date")) ||
                (col1Lower.includes("id") && col2Lower.includes("id"))
              ) {
                relations.push({
                  title: `Column Match: ${col1} ↔ ${col2}`,
                  elements: [
                    {
                      name: col1,
                      source: { file: file1.fileName, column: col1 },
                    },
                    {
                      name: col2,
                      source: { file: file2.fileName, column: col2 },
                    },
                  ],
                  relationExplanation: `Columns "${col1}" and "${col2}" appear to be related, possibly representing the same or similar data across different files.`,
                });
              }
            });
          });
        }
      }

      csvData.forEach((file) => {
        if (file.columns.length > 1) {
          for (let i = 0; i < file.columns.length; i++) {
            for (let j = i + 1; j < file.columns.length; j++) {
              const col1 = file.columns[i];
              const col2 = file.columns[j];

              relations.push({
                title: `Dataset Columns: ${col1} ↔ ${col2}`,
                elements: [
                  {
                    name: col1,
                    source: { file: file.fileName, column: col1 },
                  },
                  {
                    name: col2,
                    source: { file: file.fileName, column: col2 },
                  },
                ],
                relationExplanation: `Columns "${col1}" and "${col2}" are part of the same dataset and may have contextual relationships.`,
              });
            }
          }
        }
      });

      const summary = `Sample data mesh network with ${relations.length} detected relations across ${csvData.length} file(s). This is sample data for development purposes.`;

      return {
        relations,
        summary,
      };
    },
    []
  );

  return {
    isProcessing,
    step,
    analyzeDataMesh,
    generateSampleDataMesh,
  };
}

