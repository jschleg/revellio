import { useState, useCallback } from "react";
import { MetadataExtractor } from "@/lib/analysis/metadata-extractor";
import type {
  CSVData,
  Metadata,
  UnifiedAIOutput,
  DataMeshRelation,
} from "@/lib/types/data";

export function useVisualization() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<string>("");

  const analyzeVisualization = useCallback(
    async (
      csvData: CSVData[],
      userPrompt: string,
      relations: DataMeshRelation[]
    ): Promise<{
      metadataArray: Metadata[];
      dataSlices: CSVData[];
      payload: {
        metadataArray: Metadata[];
        dataSlices: CSVData[];
        userPrompt: string;
        relations: DataMeshRelation[];
      };
      result: UnifiedAIOutput;
    }> => {
      setIsProcessing(true);
      setStep("");

      try {
        const metadataExtractor = new MetadataExtractor();
        setStep("Extracting metadata...");
        const metadataArray = metadataExtractor.extractAll(csvData);

        setStep("Preparing data samples...");
        const dataSlices: CSVData[] = csvData.map((data) => ({
          ...data,
          rows: data.rows.slice(0, 5),
        }));

        const payload = {
          metadataArray,
          dataSlices,
          userPrompt: userPrompt || "",
          relations,
        };

        setStep("AI is analyzing data and creating visualization strategy...");
        const response = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`AI analysis failed: ${errorText}`);
        }

        const result: UnifiedAIOutput = await response.json();

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
    analyzeVisualization,
  };
}

