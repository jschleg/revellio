"use client";

import { useState } from "react";
import { Sidebar, type NavigationSection } from "@/components/sidebar";
import { SessionHeader } from "@/components/features/session-header";
import { MainContent } from "@/components/features/main-content";
import { useSession } from "./hooks/use-session";
import { useDataMesh } from "./hooks/use-data-mesh";
import { useVisualization } from "./hooks/use-visualization";
import { useFileHandling } from "./hooks/use-file-handling";

export default function Home() {
  const {
    session,
    setSession,
    isSaving,
    isLoadingSession,
    sidebarRefreshTrigger,
    saveSession,
    loadSession,
    deleteSession,
  } = useSession();

  const {
    isProcessing: isDataMeshProcessing,
    step: dataMeshStep,
    analyzeDataMesh,
  } = useDataMesh();

  const {
    isProcessing: isAnalyzing,
    step: analyzingStep,
    analyzeVisualization,
  } = useVisualization();

  const { handleFilesSelected: handleFiles } = useFileHandling();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<NavigationSection>("data");
  const [error, setError] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showFileDisplay, setShowFileDisplay] = useState(false);

  const isProcessing = isAnalyzing || isDataMeshProcessing;

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setError(null);
    try {
      const parsedData = await handleFiles(selectedFiles);
      setSession((prev) => ({
        ...prev,
        csvData: parsedData,
        metadataInput: [],
        aiOutput: null,
        meshOutput: null,
        meshRelations: [],
        meshInputPayload: null,
        aiInputPayload: null,
      }));
      if (parsedData.length > 0) {
        setShowFileDisplay(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleDataMeshAnalysis = async () => {
    if (session.csvData.length === 0) {
      setError("Please upload files first");
      return;
    }

    setError(null);
    try {
      const { metadataArray, payload, result } = await analyzeDataMesh(
        session.csvData,
        session.dataMeshPrompt
      );

      setSession((prev) => ({
        ...prev,
        metadataInput: metadataArray,
        meshOutput: result,
        meshRelations: result.relations,
        meshInputPayload: payload,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleDataMeshReroll = async (existingRelations: typeof session.meshRelations, feedback: string) => {
    if (session.csvData.length === 0) {
      setError("Please upload files first");
      return;
    }

    setError(null);
    try {
      const { metadataArray, payload, result } = await analyzeDataMesh(
        session.csvData,
        session.dataMeshPrompt,
        existingRelations,
        feedback
      );

      setSession((prev) => ({
        ...prev,
        metadataInput: metadataArray,
        meshOutput: result,
        meshRelations: result.relations,
        meshInputPayload: payload,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleDataMeshRerollRelation = async (index: number, feedback: string) => {
    if (session.csvData.length === 0 || !session.meshOutput) {
      setError("Please upload files and generate relations first");
      return;
    }

    const relationToUpdate = session.meshRelations[index];
    if (!relationToUpdate) {
      setError("Relation not found");
      return;
    }

    setError(null);
    try {
      const { metadataArray, payload, result } = await analyzeDataMesh(
        session.csvData,
        session.dataMeshPrompt,
        undefined,
        feedback,
        relationToUpdate
      );

      // Replace the specific relation at the given index
      const updatedRelations = [...session.meshRelations];
      if (result.relations.length > 0) {
        updatedRelations[index] = result.relations[0];
      }

      setSession((prev) => ({
        ...prev,
        metadataInput: metadataArray,
        meshOutput: {
          ...prev.meshOutput!,
          relations: updatedRelations,
        },
        meshRelations: updatedRelations,
        meshInputPayload: payload,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };


  const handleVisualizationAnalysis = async () => {
    if (session.csvData.length === 0) {
      setError("Please upload files first");
      return;
    }

    setError(null);
    try {
      const { metadataArray, payload, result } = await analyzeVisualization(
        session.csvData,
        session.userPrompt
      );

      setSession((prev) => ({
        ...prev,
        metadataInput: metadataArray,
        aiOutput: result,
        aiInputPayload: payload,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleVisualizationRegenerate = async (existingOutput: typeof session.aiOutput, feedback: string) => {
    if (session.csvData.length === 0) {
      setError("Please upload files first");
      return;
    }

    setError(null);
    try {
      const { metadataArray, payload, result } = await analyzeVisualization(
        session.csvData,
        session.userPrompt,
        existingOutput || undefined,
        feedback
      );

      setSession((prev) => ({
        ...prev,
        metadataInput: metadataArray,
        aiOutput: result,
        aiInputPayload: payload,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleManualSave = async () => {
    if (!session.id) {
      try {
        await saveSession(null, isProcessing);
      } catch {
        setError("Keine Session zum Speichern vorhanden. Bitte versuchen Sie es erneut.");
      }
      return;
    }

    if (isProcessing) {
      setError("Bitte warten Sie, bis die Verarbeitung abgeschlossen ist");
      return;
    }

    try {
      await saveSession(session.id, isProcessing);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save session");
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    setError(null);
    try {
      const hasFiles = await loadSession(sessionId);
      setShowFileDisplay(hasFiles);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load session");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch {
      setError("Fehler beim Löschen der Session");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-50/80 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950/80">
      <Sidebar
        currentSessionId={session.id}
        onSessionSelect={handleLoadSession}
        onNewSession={async () => {
          try {
            await saveSession(null, isProcessing);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create session");
          }
        }}
        onSessionDelete={handleDeleteSession}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        refreshTrigger={sidebarRefreshTrigger}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <SessionHeader
            sessionName={session.name}
            onSessionNameChange={(name) => setSession((prev) => ({ ...prev, name }))}
            isSaving={isSaving}
            onManualSave={handleManualSave}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isProcessing={isProcessing}
          />

          <MainContent
            activeSection={activeSection}
            isLoadingSession={isLoadingSession}
            error={error}
            csvData={session.csvData}
            metadataInput={session.metadataInput}
            dataMeshPrompt={session.dataMeshPrompt}
            userPrompt={session.userPrompt}
            meshOutput={session.meshOutput}
            meshRelations={session.meshRelations}
            aiOutput={session.aiOutput}
            meshInputPayload={session.meshInputPayload}
            aiInputPayload={session.aiInputPayload}
            showFileDisplay={showFileDisplay}
            showMetadata={showMetadata}
            isDataMeshProcessing={isDataMeshProcessing}
            dataMeshStep={dataMeshStep}
            isAnalyzing={isAnalyzing}
            analyzingStep={analyzingStep}
            onFilesSelected={handleFilesSelected}
            onDataMeshPromptChange={(prompt) =>
              setSession((prev) => ({ ...prev, dataMeshPrompt: prompt }))
            }
            onUserPromptChange={(prompt) =>
              setSession((prev) => ({ ...prev, userPrompt: prompt }))
            }
            onUpdateRelations={(relations) =>
              setSession((prev) => ({
                ...prev,
                meshRelations: relations,
                meshOutput: prev.meshOutput
                  ? { ...prev.meshOutput, relations }
                  : null,
              }))
            }
            onDataMeshAnalyze={handleDataMeshAnalysis}
            onDataMeshReroll={handleDataMeshReroll}
            onDataMeshRerollRelation={handleDataMeshRerollRelation}
            onVisualizationAnalyze={handleVisualizationAnalysis}
            onVisualizationRegenerate={handleVisualizationRegenerate}
            onToggleFileDisplay={() => setShowFileDisplay(!showFileDisplay)}
            onToggleMetadata={() => setShowMetadata(!showMetadata)}
          />
        </div>
      </div>
    </div>
  );
}
