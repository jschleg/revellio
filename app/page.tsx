"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileDrop } from "@/components/file-drop";
import { FileDisplay } from "@/components/file-display";
import { Visualizer } from "@/components/visualizer";
import { DataMeshVisualization } from "@/components/data-mesh-visualization";
import { Sidebar } from "@/components/sidebar";
import { CSVParser } from "@/lib/data/csv-parser";
import {
  Loader2,
  AlertCircle,
  Eye,
  Zap,
  ChevronDown,
  ChevronUp,
  Save,
  Menu,
} from "lucide-react";
import { MetadataExtractor } from "@/lib/analysis/metadata-extractor";
import type {
  CSVData,
  Metadata,
  UnifiedAIOutput,
  DataMeshOutput,
  DataMeshRelation,
} from "@/lib/types/data";
import { JsonTreeView } from "@/components/json-tree-view";

export default function Home() {
  // Session state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string>("Untitled Session");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Application state
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [metadataInput, setMetadataInput] = useState<Metadata[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDataMeshProcessing, setIsDataMeshProcessing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>("");
  const [dataMeshStep, setDataMeshStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<UnifiedAIOutput | null>(null);
  const [dataMeshOutput, setDataMeshOutput] = useState<DataMeshOutput | null>(null);
  const [currentRelations, setCurrentRelations] = useState<DataMeshRelation[]>([]);
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [dataMeshPrompt, setDataMeshPrompt] = useState<string>("");
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [showFileDisplay, setShowFileDisplay] = useState<boolean>(false);
  const [inputPayload, setInputPayload] = useState<{
    metadataArray: Metadata[];
    dataSlices?: CSVData[];
    userPrompt?: string;
    relations?: DataMeshRelation[];
  } | null>(null);

  // Auto-save function
  const saveSession = useCallback(async (sessionId: string | null) => {
    if (!sessionId) return;
    
    // Don't save during processing states
    if (isAnalyzing || isDataMeshProcessing) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName,
          csvData,
          dataMeshOutput,
          aiOutput,
          dataMeshPrompt,
          userPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save session");
      }
    } catch (err) {
      console.error("Error saving session:", err);
      setError(err instanceof Error ? err.message : "Failed to save session");
    } finally {
      setIsSaving(false);
    }
  }, [sessionName, csvData, dataMeshOutput, aiOutput, dataMeshPrompt, userPrompt, isAnalyzing, isDataMeshProcessing]);

  // Auto-save with debounce
  const triggerAutoSave = useCallback(() => {
    // Don't auto-save during processing
    if (isAnalyzing || isDataMeshProcessing) {
      return;
    }
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (currentSessionId) {
        saveSession(currentSessionId);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [currentSessionId, saveSession, isAnalyzing, isDataMeshProcessing]);

  // Create new session
  const handleNewSession = useCallback(async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Untitled Session",
          csvData: [],
        }),
      });

      if (response.ok) {
        const session = await response.json();
        setCurrentSessionId(session.id);
        setSessionName(session.name);
        // Reset all state
        setCsvData([]);
        setMetadataInput([]);
        setAiOutput(null);
        setDataMeshOutput(null);
        setCurrentRelations([]);
        setUserPrompt("");
        setDataMeshPrompt("");
        setInputPayload(null);
        setError(null);
      } else {
        const errorText = await response.text();
        console.error("Failed to create session:", errorText);
        setError(`Failed to create new session: ${errorText}`);
      }
    } catch (err) {
      console.error("Error creating session:", err);
      setError(err instanceof Error ? err.message : "Failed to create new session");
    }
  }, []);

  // Load session
  const handleLoadSession = useCallback(async (sessionId: string) => {
    setIsLoadingSession(true);
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const session = await response.json();
        setCurrentSessionId(session.id);
        setSessionName(session.name);
        setCsvData(session.csvData || []);
        setDataMeshOutput(session.dataMeshOutput || null);
        setAiOutput(session.aiOutput || null);
        setCurrentRelations(session.dataMeshOutput?.relations || []);
        setUserPrompt(session.userPrompt || "");
        setDataMeshPrompt(session.dataMeshPrompt || "");

        // Extract metadata if CSV data exists
        if (session.csvData && session.csvData.length > 0) {
          const metadataExtractor = new MetadataExtractor();
          const metadataArray = metadataExtractor.extractAll(session.csvData);
          setMetadataInput(metadataArray);
        }
      } else {
        setError("Failed to load session");
      }
    } catch (err) {
      console.error("Error loading session:", err);
      setError("Failed to load session");
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  // Delete session
  const handleDeleteSession = useCallback((sessionId: string) => {
    if (currentSessionId === sessionId) {
      handleNewSession();
    }
  }, [currentSessionId, handleNewSession]);

  // Initialize with new session on mount
  useEffect(() => {
    handleNewSession();
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (currentSessionId && (csvData.length > 0 || dataMeshOutput || aiOutput)) {
      triggerAutoSave();
    }
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [currentSessionId, csvData, dataMeshOutput, aiOutput, currentRelations, userPrompt, dataMeshPrompt, triggerAutoSave]);

  const generateSampleDataMesh = (): DataMeshOutput => {
    const relations: DataMeshRelation[] = [];
    
    // Generate relations between files
    for (let i = 0; i < csvData.length; i++) {
      for (let j = i + 1; j < csvData.length; j++) {
        const file1 = csvData[i];
        const file2 = csvData[j];
        
        // File-to-file relation
        relations.push({
          title: `File Relationship: ${file1.fileName} ↔ ${file2.fileName}`,
          elements: [
            { name: file1.fileName, source: { file: file1.fileName } },
            { name: file2.fileName, source: { file: file2.fileName } },
          ],
          relationExplanation: `These files are related and can be analyzed together. Both contain structured data that may share common patterns or themes.`,
        });

        // Column-to-column relations (find similar column names)
        file1.columns.forEach((col1) => {
          file2.columns.forEach((col2) => {
            const col1Lower = col1.toLowerCase();
            const col2Lower = col2.toLowerCase();
            
            // Check for similar column names
            if (col1Lower === col2Lower || 
                col1Lower.includes(col2Lower) || 
                col2Lower.includes(col1Lower) ||
                col1Lower.includes('date') && col2Lower.includes('date') ||
                col1Lower.includes('id') && col2Lower.includes('id')) {
              relations.push({
                title: `Column Match: ${col1} ↔ ${col2}`,
                elements: [
                  { name: col1, source: { file: file1.fileName, column: col1 } },
                  { name: col2, source: { file: file2.fileName, column: col2 } },
                ],
                relationExplanation: `Columns "${col1}" and "${col2}" appear to be related, possibly representing the same or similar data across different files.`,
              });
            }
          });
        });
      }
    }

    // Generate column relations within files
    csvData.forEach((file) => {
      if (file.columns.length > 1) {
        for (let i = 0; i < file.columns.length; i++) {
          for (let j = i + 1; j < file.columns.length; j++) {
            const col1 = file.columns[i];
            const col2 = file.columns[j];
            
            // Add relation between columns in same file
            relations.push({
              title: `Dataset Columns: ${col1} ↔ ${col2}`,
              elements: [
                { name: col1, source: { file: file.fileName, column: col1 } },
                { name: col2, source: { file: file.fileName, column: col2 } },
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
  };

  const useSampleDataMesh = () => {
    if (csvData.length === 0) {
      setError("Please upload files first before using sample data.");
      return;
    }

    setError(null);
    setIsDataMeshProcessing(true);
    setDataMeshStep("Generating sample data...");

    // Simulate processing delay
    setTimeout(() => {
      const metadataExtractor = new MetadataExtractor();
      const metadataArray = metadataExtractor.extractAll(csvData);
      setMetadataInput(metadataArray);

      const sampleDataMesh = generateSampleDataMesh();
      setDataMeshOutput(sampleDataMesh);
      setCurrentRelations(sampleDataMesh.relations);
      
      setInputPayload({
        metadataArray,
        dataSlices: csvData.map((data) => ({
          ...data,
          rows: data.rows.slice(0, 20),
        })),
        userPrompt: dataMeshPrompt || "",
      });

      setIsDataMeshProcessing(false);
      setDataMeshStep("");
    }, 500);
  };

  const startDataMesh = async () => {
    setError(null);
    setIsDataMeshProcessing(true);
    setDataMeshStep("");
    setDataMeshOutput(null);
    setInputPayload(null);

    try {
      const metadataExtractor = new MetadataExtractor();
      setDataMeshStep("Extracting metadata...");
      const metadataArray = metadataExtractor.extractAll(csvData);
      setMetadataInput(metadataArray);

      setDataMeshStep("Preparing data samples (20 rows per file)...");
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
        userPrompt: dataMeshPrompt || "",
      };
      setInputPayload(payload);

      setDataMeshStep("Analyzing data mesh network...");
      const dataMeshResponse = await fetch("/api/ai/data-mesh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!dataMeshResponse.ok) {
        const errorText = await dataMeshResponse.text();
        throw new Error(`Data mesh analysis failed: ${errorText}`);
      }

      const dataMesh: DataMeshOutput = await dataMeshResponse.json();
      setDataMeshOutput(dataMesh);
      setCurrentRelations(dataMesh.relations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsDataMeshProcessing(false);
      setDataMeshStep("");
    }
  }

  const startProcessing = async () => {
    if (!dataMeshOutput || currentRelations.length === 0) {
      setError("Please complete Data Mesh analysis first to define relations.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalyzingStep("");
    setAiOutput(null);
    setInputPayload(null);

    try {
      const metadataExtractor = new MetadataExtractor();
      setAnalyzingStep("Extracting metadata...");
      const metadataArray = metadataExtractor.extractAll(csvData);
      setMetadataInput(metadataArray);

      setAnalyzingStep("Preparing data samples...");
      const dataSlices: CSVData[] = csvData.map((data) => ({
        ...data,
        rows: data.rows.slice(0, 5),
      }));

      const payload = {
        metadataArray,
        dataSlices,
        userPrompt: userPrompt || "",
        relations: currentRelations,
      };
      setInputPayload(payload);

      setAnalyzingStep("AI is analyzing data and creating visualization strategy...");
      const analyzeResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        throw new Error(`AI analysis failed: ${errorText}`);
      }

      const unifiedOutput: UnifiedAIOutput = await analyzeResponse.json();
      setAiOutput(unifiedOutput);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsAnalyzing(false);
      setAnalyzingStep("");
    }
  }

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setError(null);
    setAiOutput(null);
    setDataMeshOutput(null);
    setMetadataInput([]);

    try {
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
        } catch (err) {
          // Silently skip invalid files
        }
      }

      setCsvData(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleManualSave = async () => {
    if (!currentSessionId) {
      // Try to create a session first if none exists
      await handleNewSession();
      // Wait a bit for session to be created
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!currentSessionId) {
        setError("Keine Session zum Speichern vorhanden. Bitte versuchen Sie es erneut.");
        return;
      }
    }
    
    if (isAnalyzing || isDataMeshProcessing) {
      setError("Bitte warten Sie, bis die Verarbeitung abgeschlossen ist");
      return;
    }
    
    await saveSession(currentSessionId);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-50/80 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950/80">
      {/* Sidebar */}
      <Sidebar
        currentSessionId={currentSessionId}
        onSessionSelect={handleLoadSession}
        onNewSession={handleNewSession}
        onSessionDelete={handleDeleteSession}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Header with Session Name */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {isSidebarCollapsed && (
                    <button
                      onClick={() => setIsSidebarCollapsed(false)}
                      className="flex items-center justify-center rounded-lg p-2 text-zinc-700 transition-colors hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                      title="Sidebar anzeigen"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  )}
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent dark:from-purple-400 dark:via-purple-300 dark:to-purple-400">
                    Revellio
                  </h1>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    onBlur={() => {
                      if (currentSessionId) {
                        triggerAutoSave();
                      }
                    }}
                    className="mt-2 rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-100"
                    placeholder="Session Name"
                  />
                  {isSaving && (
                    <span className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Speichere...
                    </span>
                  )}
                  <button
                    onClick={handleManualSave}
                    disabled={isSaving || isAnalyzing || isDataMeshProcessing}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-100 dark:hover:bg-zinc-800/80"
                    title={isAnalyzing || isDataMeshProcessing ? "Speichern während der Verarbeitung nicht möglich" : currentSessionId ? "Session speichern" : "Neue Session erstellen und speichern"}
                  >
                    <Save className="h-4 w-4" />
                    Speichern
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
              AI-powered analysis and visualization tool
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Upload CSV files and analyze them with AI
            </p>
          </div>

          {isLoadingSession ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
            </div>
          ) : (
            <>
              {/* File Upload Section */}
              <div className="mb-8 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Upload Files</h2>
                <FileDrop
                  onFilesSelected={handleFilesSelected}
                  accept=".csv"
                  maxFiles={10}
                />
              </div>

              {/* Step 1: Data Mesh Analysis */}
              {csvData.length > 0 && (
                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white dark:bg-indigo-500">
                      1
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Step 1: Data Mesh Analysis</h2>
                  </div>
                  <p className="ml-11 text-sm text-zinc-700 dark:text-zinc-300">
                    Analyze relationships between your data files. Edit and refine relations before proceeding to visualization analysis.
                  </p>

                  {/* Data Mesh Prompt Section */}
                  <div className="ml-11 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                    <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      Additional Context (optional)
                    </h3>
                    <textarea
                      value={dataMeshPrompt}
                      onChange={(e) => setDataMeshPrompt(e.target.value)}
                      placeholder="Describe what relationships you expect to find, specific connections to look for, or any domain-specific context..."
                      className="w-full rounded-lg border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                      rows={3}
                    />
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      This context helps the AI identify relevant relationships and connections in your data.
                    </p>
                  </div>
                  
                  {/* Data Mesh Buttons */}
                  <div className="ml-11 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={startDataMesh}
                      disabled={isAnalyzing || isDataMeshProcessing}
                      className="group relative rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:via-indigo-800 hover:to-indigo-900 hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 dark:from-indigo-500 dark:via-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-600 dark:hover:via-indigo-700 dark:hover:to-indigo-800"
                    >
                      {isDataMeshProcessing ? (
                        <span className="flex items-center justify-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing Data Mesh...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          <Zap className="h-5 w-5 transition-transform group-hover:scale-110" />
                          <span>Analyze Data Mesh</span>
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={useSampleDataMesh}
                      disabled={isAnalyzing || isDataMeshProcessing || csvData.length === 0}
                      className="group relative rounded-xl border-2 border-indigo-200 bg-indigo-50/80 px-6 py-4 font-semibold text-indigo-700 shadow-sm transition-all duration-200 hover:bg-indigo-100/80 hover:shadow-md hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>Use Sample Relations</span>
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Data Mesh Output */}
              {dataMeshOutput && (
                <div className="mb-8 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 to-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-indigo-800/80 dark:from-indigo-950/40 dark:to-zinc-900/60">
                  <div className="mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Data Mesh Network</h2>
                  </div>
                  <DataMeshVisualization
                    dataMeshOutput={dataMeshOutput}
                    csvData={csvData}
                    onUpdateRelations={setCurrentRelations}
                  />
                </div>
              )}

              {/* Step 2: Visualization Analysis */}
              {csvData.length > 0 && dataMeshOutput && currentRelations.length > 0 && (
                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white dark:bg-purple-500">
                      2
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Step 2: Visualization Analysis</h2>
                  </div>
                  <p className="ml-11 text-sm text-zinc-700 dark:text-zinc-300">
                    Based on the defined relations, AI will determine the best visualization methods for your data.
                  </p>

                  {/* User Prompt Section */}
                  <div className="ml-11 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                    <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      Additional Context (optional)
                    </h3>
                    <textarea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Describe what you want to learn from the data or what questions you have..."
                      className="w-full rounded-lg border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                      rows={3}
                    />
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      This context helps the AI create more appropriate visualizations.
                    </p>
                  </div>

                  {/* Analysis Button */}
                  <div className="ml-11">
                    <button
                      onClick={startProcessing}
                      disabled={isAnalyzing || isDataMeshProcessing || !dataMeshOutput || currentRelations.length === 0}
                      className="group relative rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 dark:from-purple-500 dark:via-purple-600 dark:to-purple-700 dark:hover:from-purple-600 dark:hover:via-purple-700 dark:hover:to-purple-800"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center justify-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Analyzing...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          <Zap className="h-5 w-5 transition-transform group-hover:scale-110" />
                          <span>Start Visualization Analysis</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-200/80 bg-red-50/80 backdrop-blur-sm p-4 text-red-800 shadow-sm dark:border-red-800/80 dark:bg-red-900/30 dark:text-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              {/* Processing Indicators */}
              {(isAnalyzing || isDataMeshProcessing) && (
                <div className="mb-6 space-y-3">
            {isAnalyzing && (
              <div className="rounded-xl border border-purple-200/80 bg-gradient-to-r from-purple-50/60 to-white/60 backdrop-blur-sm p-4 shadow-sm dark:border-purple-800/80 dark:from-purple-950/40 dark:to-zinc-900/60">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-purple-900 dark:text-purple-200">AI Analysis in Progress</p>
                    {analyzingStep && (
                      <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">{analyzingStep}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {isDataMeshProcessing && (
              <div className="rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/60 to-white/60 backdrop-blur-sm p-4 shadow-sm dark:border-indigo-800/80 dark:from-indigo-950/40 dark:to-zinc-900/60">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-indigo-900 dark:text-indigo-200">Data Mesh Analysis in Progress</p>
                    {dataMeshStep && (
                      <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">{dataMeshStep}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
                </div>
              )}

              {/* Results Overview - Compact Summary */}
              {aiOutput && (
                <div className="mb-8 rounded-lg border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-purple-100/30 p-6 dark:border-purple-800/50 dark:from-purple-950/30 dark:to-purple-900/20">
                  <div className="mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-xl font-semibold text-foreground">AI Analysis Overview</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {aiOutput.visualizations.length}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">Visualizations</div>
                    </div>
                    <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {aiOutput.relations.length}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">Relations</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Input/Output JSON Tree View */}
              {inputPayload && aiOutput && (
                <div className="mb-8 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <div className="mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Input / Output</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Input Section */}
                    <div className="rounded-lg border border-blue-200/80 bg-blue-50/60 backdrop-blur-sm p-4 shadow-sm dark:border-blue-800/80 dark:bg-blue-950/40">
                      <h3 className="mb-3 text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Input
                      </h3>
                      <div className="max-h-[600px] overflow-auto rounded bg-white/80 p-3 shadow-sm dark:bg-zinc-800/60">
                        <JsonTreeView data={inputPayload} />
                      </div>
                    </div>

                    {/* Output Section */}
                    <div className="rounded-lg border border-green-200/80 bg-green-50/60 backdrop-blur-sm p-4 shadow-sm dark:border-green-800/80 dark:bg-green-950/40">
                      <h3 className="mb-3 text-sm font-semibold text-green-700 dark:text-green-300">
                        Output
                      </h3>
                      <div className="max-h-[600px] overflow-auto rounded bg-white/80 p-3 shadow-sm dark:bg-zinc-800/60">
                        <JsonTreeView data={aiOutput} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Input: Metadata Display - Collapsible */}
              {metadataInput.length > 0 && (
                <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card dark:border-zinc-800/50">
                  <button
                    onClick={() => setShowMetadata(!showMetadata)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h2 className="text-xl font-semibold text-foreground">Input: Metadata</h2>
                      <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                        ({metadataInput.length} files)
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
                        {metadataInput.map((meta, index) => (
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

              {/* AI Output - Visualizer Component */}
              {aiOutput && <Visualizer aiOutput={aiOutput} csvData={csvData} />}

              {/* File Display with Tables - Collapsible */}
              {csvData.length > 0 && (
                <div className="mb-8 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
                  <button
                    onClick={() => setShowFileDisplay(!showFileDisplay)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">File Data Tables</h2>
                      <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                        ({csvData.length} file{csvData.length !== 1 ? "s" : ""})
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
                      <FileDisplay csvData={csvData} />
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
