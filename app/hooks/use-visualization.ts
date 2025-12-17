import { useState, useCallback } from "react";
import { MetadataExtractor } from "@/lib/analysis/metadata-extractor";
import type {
  CSVData,
  Metadata,
  UnifiedAIOutput,
} from "@/lib/types/data";
import type { VisualizationConfig } from "@/lib/ai/ai-service";

export function useVisualization() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<string>("");

  const analyzeVisualization = useCallback(
    async (
      csvData: CSVData[],
      userPrompt: string,
      config: VisualizationConfig = {}
    ): Promise<{
      metadataArray: Metadata[];
      dataSlices: Array<{ fileName: string; rows: typeof csvData[0]["rows"] }>;
      payload: {
        metadataArray: Metadata[];
        dataSlices: Array<{ fileName: string; rows: typeof csvData[0]["rows"] }>;
        userPrompt: string;
        config: VisualizationConfig;
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
        // Optimized: only send fileName and rows (no rawContent, no relations)
        const dataSlices = csvData.map((data) => ({
          fileName: data.fileName,
          rows: data.rows.slice(0, 5),
        }));

        const payload = {
          metadataArray,
          dataSlices,
          userPrompt: userPrompt || "",
          config,
        };

        setStep("AI is analyzing data and creating visualization strategy...");
        const response = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMessage = `AI analysis failed: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
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

