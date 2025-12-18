"use client";

import { Loader2 } from "lucide-react";
import type { NavigationSection } from "@/components/sidebar";
import { FileUploadSection } from "@/components/features/file-upload-section";
import { FileDisplaySection } from "@/components/features/file-display-section";
import { MetadataDisplaySection } from "@/components/features/metadata-display-section";
import { DataMeshSection } from "@/components/features/data-mesh-section";
import { VisualizationSection } from "@/components/features/visualization-section";
import { AIAnalysisOverview } from "@/components/features/ai-analysis-overview";
import { TechnicalDetailsSection } from "@/components/features/technical-details-section";
import { Visualizer } from "@/components/visualizer";
import { ErrorDisplay } from "@/components/ui/error-display";
import type {
  CSVData,
  Metadata,
  DataMeshOutput,
  DataMeshRelation,
  UnifiedAIOutput,
} from "@/lib/types/data";

interface MainContentProps {
  activeSection: NavigationSection;
  isLoadingSession: boolean;
  error: string | null;
  // Session data
  csvData: CSVData[];
  metadataInput: Metadata[];
  dataMeshPrompt: string;
  userPrompt: string;
  meshOutput: DataMeshOutput | null;
  meshRelations: DataMeshRelation[];
  selectedRelationsForVisualization: number[];
  onSelectedRelationsChange: (selected: number[]) => void;
  aiOutput: UnifiedAIOutput | null;
  meshInputPayload: unknown;
  aiInputPayload: unknown;
  // UI state
  showFileDisplay: boolean;
  showMetadata: boolean;
  // Processing state
  isDataMeshProcessing: boolean;
  dataMeshStep: string;
  isAnalyzing: boolean;
  analyzingStep: string;
  // Handlers
  onFilesSelected: (files: File[]) => Promise<void>;
  onDataMeshPromptChange: (prompt: string) => void;
  onUserPromptChange: (prompt: string) => void;
  onUpdateRelations: (relations: DataMeshRelation[]) => void;
  onDataMeshAnalyze: () => Promise<void>;
  onDataMeshReroll: (existingRelations: DataMeshRelation[], feedback: string) => Promise<void>;
  onDataMeshRerollRelation: (index: number, feedback: string) => Promise<void>;
  onVisualizationAnalyze: () => Promise<void>;
  onVisualizationRegenerate: (existingOutput: UnifiedAIOutput, feedback: string) => Promise<void>;
  onToggleFileDisplay: () => void;
  onToggleMetadata: () => void;
}

export function MainContent({
  activeSection,
  isLoadingSession,
  error,
  csvData,
  metadataInput,
  dataMeshPrompt,
  userPrompt,
  meshOutput,
  meshRelations,
  selectedRelationsForVisualization,
  onSelectedRelationsChange,
  aiOutput,
  meshInputPayload,
  aiInputPayload,
  showFileDisplay,
  showMetadata,
  isDataMeshProcessing,
  dataMeshStep,
  isAnalyzing,
  analyzingStep,
  onFilesSelected,
  onDataMeshPromptChange,
  onUserPromptChange,
  onUpdateRelations,
  onDataMeshAnalyze,
  onDataMeshReroll,
  onDataMeshRerollRelation,
  onVisualizationAnalyze,
  onVisualizationRegenerate,
  onToggleFileDisplay,
  onToggleMetadata,
}: MainContentProps) {
  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
      </div>
    );
  }

  return (
    <>
      {error && <ErrorDisplay error={error} />}

      {/* Data & Files Section */}
      {activeSection === "data" && (
        <>
          <FileUploadSection onFilesSelected={onFilesSelected} />
          <FileDisplaySection
            csvData={csvData}
            isOpen={showFileDisplay}
            onToggle={onToggleFileDisplay}
          />
          <MetadataDisplaySection
            metadata={metadataInput}
            isOpen={showMetadata}
            onToggle={onToggleMetadata}
          />
        </>
      )}

      {/* Data Mesh Section */}
      {activeSection === "data-mesh" && (
        <DataMeshSection
          csvData={csvData}
          dataMeshPrompt={dataMeshPrompt}
          onDataMeshPromptChange={onDataMeshPromptChange}
          meshOutput={meshOutput}
          isProcessing={isDataMeshProcessing}
          step={dataMeshStep}
          onAnalyze={onDataMeshAnalyze}
          onUpdateRelations={onUpdateRelations}
          onReroll={onDataMeshReroll}
          onRerollRelation={onDataMeshRerollRelation}
        />
      )}

      {/* Visualizations Section */}
      {activeSection === "visualizations" && (
        <>
          <VisualizationSection
            csvDataCount={csvData.length}
            meshOutput={meshOutput}
            meshRelations={meshRelations}
            selectedRelationsForVisualization={new Set(selectedRelationsForVisualization)}
            onSelectedRelationsChange={(selected) =>
              onSelectedRelationsChange(Array.from(selected))
            }
            userPrompt={userPrompt}
            onUserPromptChange={onUserPromptChange}
            isProcessing={isAnalyzing}
            step={analyzingStep}
            onAnalyze={onVisualizationAnalyze}
            onRegenerate={onVisualizationRegenerate}
            existingOutput={aiOutput}
          />

          {aiOutput && (
            <>
              <AIAnalysisOverview aiOutput={aiOutput} />
              <Visualizer
                aiOutput={aiOutput}
                csvData={csvData}
                onRegenerate={onVisualizationRegenerate}
              />
            </>
          )}
        </>
      )}

      {/* Technical Details Section */}
      {activeSection === "technical" && (
        <TechnicalDetailsSection
          meshInputPayload={meshInputPayload}
          meshOutput={meshOutput}
          aiInputPayload={aiInputPayload}
          aiOutput={aiOutput}
        />
      )}
    </>
  );
}

