import { useState, useCallback } from "react";
import { MetadataExtractor } from "@/lib/analysis/metadata-extractor";
import type {
  CSVData,
  Metadata,
  DataMeshOutput,
  DataMeshRelation,
} from "@/lib/types/data";
import type { DataMeshConfig } from "@/lib/ai/ai-service";

export function useDataMesh() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<string>("");

  const analyzeDataMesh = useCallback(
    async (
      csvData: CSVData[],
      userPrompt: string,
      config: DataMeshConfig = {}
    ): Promise<{
      metadataArray: Metadata[];
      dataSlices: Array<{ fileName: string; rows: typeof csvData[0]["rows"] }>;
      payload: {
        metadataArray: Metadata[];
        dataSlices: Array<{ fileName: string; rows: typeof csvData[0]["rows"] }>;
        userPrompt: string;
        config: DataMeshConfig;
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
        // Optimized: only send fileName and rows (no rawContent, minimal metadata)
        const dataSlices = csvData.map((data) => ({
          fileName: data.fileName,
          rows: data.rows.slice(0, 20),
        }));

        const payload = {
          metadataArray,
          dataSlices,
          userPrompt: userPrompt || "",
          config,
        };

        setStep("Analyzing data mesh network...");
        const response = await fetch("/api/ai/data-mesh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMessage = `Data mesh analysis failed: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
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

  return {
    isProcessing,
    step,
    analyzeDataMesh,
  };
}

