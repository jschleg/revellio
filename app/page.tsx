"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Visualizer } from "@/components/visualizer";
import { FileDisplay } from "@/components/file-display";
import { JsonTreeView } from "@/components/json-tree-view";
import { SessionHeader } from "@/components/features/session-header";
import { FileUploadSection } from "@/components/features/file-upload-section";
import { DataMeshSection } from "@/components/features/data-mesh-section";
import { VisualizationSection } from "@/components/features/visualization-section";
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
    triggerAutoSave,
  } = useSession();

  const {
    isProcessing: isDataMeshProcessing,
    step: dataMeshStep,
    analyzeDataMesh,
    generateSampleDataMesh,
  } = useDataMesh();

  const {
    isProcessing: isAnalyzing,
    step: analyzingStep,
    analyzeVisualization,
  } = useVisualization();

  const { handleFilesSelected: handleFiles } = useFileHandling();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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

  const handleUseSampleDataMesh = () => {
    if (session.csvData.length === 0) {
      setError("Please upload files first before using sample data.");
      return;
    }

    setError(null);
    const sampleDataMesh = generateSampleDataMesh(session.csvData);
    setSession((prev) => ({
      ...prev,
      meshOutput: sampleDataMesh,
      meshRelations: sampleDataMesh.relations,
      meshInputPayload: {
        metadataArray: [],
        dataSlices: session.csvData.map((data) => ({
          ...data,
          rows: data.rows.slice(0, 20),
        })),
        userPrompt: prev.dataMeshPrompt || "",
      },
    }));
  };

  const handleVisualizationAnalysis = async () => {
    if (!session.meshOutput || session.meshRelations.length === 0) {
      setError("Please complete Data Mesh analysis first to define relations.");
      return;
    }

    setError(null);
    try {
      const { metadataArray, payload, result } = await analyzeVisualization(
        session.csvData,
        session.userPrompt,
        session.meshRelations
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
      />

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <SessionHeader
            sessionName={session.name}
            onSessionNameChange={(name) => setSession((prev) => ({ ...prev, name }))}
            onSessionNameBlur={() => {
              if (session.id) {
                triggerAutoSave(isProcessing);
              }
            }}
            isSaving={isSaving}
            onManualSave={handleManualSave}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isProcessing={isProcessing}
          />

          {isLoadingSession ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 rounded-xl border border-red-200/80 bg-red-50/80 backdrop-blur-sm p-4 text-red-800 shadow-sm dark:border-red-800/80 dark:bg-red-900/30 dark:text-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              <FileUploadSection onFilesSelected={handleFilesSelected} />

              <DataMeshSection
                csvData={session.csvData}
                dataMeshPrompt={session.dataMeshPrompt}
                onDataMeshPromptChange={(prompt) =>
                  setSession((prev) => ({ ...prev, dataMeshPrompt: prompt }))
                }
                meshOutput={session.meshOutput}
                isProcessing={isDataMeshProcessing}
                step={dataMeshStep}
                onAnalyze={handleDataMeshAnalysis}
                onUseSample={handleUseSampleDataMesh}
                onUpdateRelations={(relations) =>
                  setSession((prev) => ({ ...prev, meshRelations: relations }))
                }
              />

              {session.meshInputPayload && session.meshOutput && (
                <div className="mb-8 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <div className="mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                      Data Mesh Input / Output
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-blue-200/80 bg-blue-50/60 backdrop-blur-sm p-4 shadow-sm dark:border-blue-800/80 dark:bg-blue-950/40">
                      <h3 className="mb-3 text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Input
                      </h3>
                      <div className="max-h-[600px] overflow-auto rounded bg-white/80 p-3 shadow-sm dark:bg-zinc-800/60">
                        <JsonTreeView data={session.meshInputPayload} />
                      </div>
                    </div>
                    <div className="rounded-lg border border-green-200/80 bg-green-50/60 backdrop-blur-sm p-4 shadow-sm dark:border-green-800/80 dark:bg-green-950/40">
                      <h3 className="mb-3 text-sm font-semibold text-green-700 dark:text-green-300">
                        Output
                      </h3>
                      <div className="max-h-[600px] overflow-auto rounded bg-white/80 p-3 shadow-sm dark:bg-zinc-800/60">
                        <JsonTreeView data={session.meshOutput} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <VisualizationSection
                csvDataCount={session.csvData.length}
                meshOutput={session.meshOutput}
                meshRelations={session.meshRelations}
                userPrompt={session.userPrompt}
                onUserPromptChange={(prompt) =>
                  setSession((prev) => ({ ...prev, userPrompt: prompt }))
                }
                isProcessing={isAnalyzing}
                step={analyzingStep}
                onAnalyze={handleVisualizationAnalysis}
              />

              {session.aiInputPayload && session.aiOutput && (
                <div className="mb-8 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <div className="mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                      AI Analysis Input / Output
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-blue-200/80 bg-blue-50/60 backdrop-blur-sm p-4 shadow-sm dark:border-blue-800/80 dark:bg-blue-950/40">
                      <h3 className="mb-3 text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Input
                      </h3>
                      <div className="max-h-[600px] overflow-auto rounded bg-white/80 p-3 shadow-sm dark:bg-zinc-800/60">
                        <JsonTreeView data={session.aiInputPayload} />
                      </div>
                    </div>
                    <div className="rounded-lg border border-green-200/80 bg-green-50/60 backdrop-blur-sm p-4 shadow-sm dark:border-green-800/80 dark:bg-green-950/40">
                      <h3 className="mb-3 text-sm font-semibold text-green-700 dark:text-green-300">
                        Output
                      </h3>
                      <div className="max-h-[600px] overflow-auto rounded bg-white/80 p-3 shadow-sm dark:bg-zinc-800/60">
                        <JsonTreeView data={session.aiOutput} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {session.aiOutput && (
                <div className="mb-8 rounded-lg border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-purple-100/30 p-6 dark:border-purple-800/50 dark:from-purple-950/30 dark:to-purple-900/20">
                  <div className="mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-xl font-semibold text-foreground">AI Analysis Overview</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {session.aiOutput.visualizations.length}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">Visualizations</div>
                    </div>
                    <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {session.aiOutput.relations.length}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">Relations</div>
                    </div>
                  </div>
                </div>
              )}

              {session.metadataInput.length > 0 && (
                <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card dark:border-zinc-800/50">
                  <button
                    onClick={() => setShowMetadata(!showMetadata)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h2 className="text-xl font-semibold text-foreground">Input: Metadata</h2>
                      <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                        ({session.metadataInput.length} files)
                      </span>
                    </div>
                    {showMetadata ? (
                      <ChevronUp className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    )}
                  </button>
                  {showMetadata && (
                    <div className="border-t border-zinc-200/50 p-6 dark:border-zinc-800/50">
                      <div className="grid gap-4 md:grid-cols-2">
                        {session.metadataInput.map((meta, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50"
                          >
                            <h3 className="mb-2 font-medium text-foreground">{meta.fileName}</h3>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="rounded bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                {meta.rowCount} Rows
                              </span>
                              <span className="rounded bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                {meta.columns.length} Columns
                              </span>
                              <span className="rounded bg-purple-100 px-2 py-1 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                {Array.from(new Set(meta.columnTypes)).join(", ")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {session.aiOutput && (
                <Visualizer aiOutput={session.aiOutput} csvData={session.csvData} />
              )}

              {session.csvData.length > 0 && (
                <div className="mb-8 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <button
                    onClick={() => setShowFileDisplay(!showFileDisplay)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                        File Data Tables
                      </h2>
                      <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                        ({session.csvData.length} file{session.csvData.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                    {showFileDisplay ? (
                      <ChevronUp className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    )}
                  </button>
                  {showFileDisplay && (
                    <div className="border-t border-zinc-200/80 p-6 dark:border-zinc-800/80">
                      <FileDisplay csvData={session.csvData} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
