"use client";

import { useState } from "react";
import { FileDrop } from "@/components/file-drop";
import { FileDisplay } from "@/components/file-display";
import { Visualizer } from "@/components/visualizer";
import { DataMeshVisualization } from "@/components/data-mesh-visualization";
import { CSVParser } from "@/lib/data/csv-parser";
import {
  Loader2,
  AlertCircle,
  Eye,
  Zap,
  ChevronDown,
  ChevronUp,
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
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [showFileDisplay, setShowFileDisplay] = useState<boolean>(false);
  const [inputPayload, setInputPayload] = useState<{
    metadataArray: Metadata[];
    dataSlices?: CSVData[];
    userPrompt?: string;
    relations?: DataMeshRelation[];
  } | null>(null);


  const startDataMesh = async () => {
    console.log("🚀 [DEBUG] startDataMesh called");
    setError(null);
    setIsDataMeshProcessing(true);
    setDataMeshStep("");
    setDataMeshOutput(null);
    setInputPayload(null);

    try {
      console.log("📊 [DEBUG] CSV data count:", csvData.length);
      const metadataExtractor = new MetadataExtractor();
      // Extract metadata
      setDataMeshStep("Extracting metadata...");
      console.log("🔍 [DEBUG] Extracting metadata...");
      const metadataArray = metadataExtractor.extractAll(csvData);
      console.log("✅ [DEBUG] Metadata extracted:", metadataArray.length, "files");
      setMetadataInput(metadataArray);

      // Use 20 data points from each file for mesh analysis (only for determining relations)
      setDataMeshStep("Preparing data samples (20 rows per file)...");
      console.log("🔍 [DEBUG] Preparing data slices (20 rows per file)...");
      const dataSlices: CSVData[] = csvData.map((data) => {
        const slicedRows = data.rows.slice(0, 20);
        return {
          ...data,
          rows: slicedRows, // Take first 20 rows
          rawContent: "", // Don't send full rawContent to reduce payload size
          metadata: {
            ...data.metadata,
            rowCount: Math.min(20, data.metadata.rowCount), // Update row count to match slice
            sample: {
              rows: slicedRows, // Update sample rows
              totalRows: slicedRows.length, // Update total rows in sample
            },
          },
        };
      });
      console.log("✅ [DEBUG] Data slices prepared:", dataSlices.length, "files");
      console.log("✅ [DEBUG] Total rows in slices:", dataSlices.reduce((sum, data) => sum + data.rows.length, 0));

      // Store input payload (for data mesh, we send 20 rows per file)
      const payload = {
        metadataArray,
        dataSlices, // Send 20 rows per file, not all data
      };
      setInputPayload(payload);

      // Data Mesh Analysis
      setDataMeshStep("Analyzing data mesh network...");
      console.log("🔍 [DEBUG] Starting data mesh analysis");
      console.log("📦 [DEBUG] Request payload:", {
        metadataCount: metadataArray.length,
        dataSlicesCount: dataSlices.length,
        totalRowsInSlices: dataSlices.reduce((sum, data) => sum + data.rows.length, 0),
      });

      const dataMeshResponse = await fetch("/api/ai/data-mesh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📡 [DEBUG] Fetch response received, status:", dataMeshResponse.status);

      if (!dataMeshResponse.ok) {
        const errorText = await dataMeshResponse.text();
        console.error("❌ [DEBUG] Data mesh analysis failed:", dataMeshResponse.status, errorText);
        throw new Error(`Data mesh analysis failed: ${errorText}`);
      }

      console.log("📥 [DEBUG] Parsing response JSON...");
      const dataMesh: DataMeshOutput = await dataMeshResponse.json();
      console.log("✅ [DEBUG] Data mesh output received:", {
        relations: dataMesh.relations?.length || 0,
      });
      console.log("✅ [DEBUG] Full data mesh output:", dataMesh);
      setDataMeshOutput(dataMesh);
      setCurrentRelations(dataMesh.relations); // Store relations for use in analysis

    } catch (err) {
      console.error("💥 [DEBUG] Error in startDataMesh:", err);
      console.error("💥 [DEBUG] Error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      console.log("🏁 [DEBUG] startDataMesh finished");
      setIsDataMeshProcessing(false);
      setDataMeshStep("");
    }
  }


  const startProcessing = async () => {
    if (!dataMeshOutput || currentRelations.length === 0) {
      setError("Please complete Data Mesh analysis first to define relations.");
      return;
    }

    console.log("🚀 [DEBUG] startProcessing called");
    setError(null);
    setIsAnalyzing(true);
    setAnalyzingStep("");
    setAiOutput(null);
    setInputPayload(null);

    try {
      console.log("📊 [DEBUG] CSV data count:", csvData.length);
      const metadataExtractor = new MetadataExtractor();
      // Extract metadata
      setAnalyzingStep("Extracting metadata...");
      console.log("🔍 [DEBUG] Extracting metadata...");
      const metadataArray = metadataExtractor.extractAll(csvData);
      console.log("✅ [DEBUG] Metadata extracted:", metadataArray.length, "files");
      setMetadataInput(metadataArray);

      // Prepare data slices (5 elements from each CSV)
      setAnalyzingStep("Preparing data samples...");
      console.log("🔍 [DEBUG] Preparing data slices...");
      const dataSlices: CSVData[] = csvData.map((data) => ({
        ...data,
        rows: data.rows.slice(0, 5), // Take first 5 rows
      }));
      console.log("✅ [DEBUG] Data slices prepared:", dataSlices.length);

      // Store input payload with relations from Data Mesh
      const payload = {
        metadataArray,
        dataSlices,
        userPrompt: userPrompt || "",
        relations: currentRelations, // Pass Data Mesh relations to analysis
      };
      setInputPayload(payload);

      // Unified AI Analysis
      setAnalyzingStep("AI is analyzing data and creating visualization strategy...");
      console.log("🔍 [DEBUG] Starting unified AI analysis");
      console.log("📝 [DEBUG] User prompt:", userPrompt);
      console.log("📦 [DEBUG] Request payload:", {
        metadataCount: metadataArray.length,
        dataSlicesCount: dataSlices.length,
        relationsCount: currentRelations.length,
        userPrompt: userPrompt || "(empty)",
      });

      const analyzeResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📡 [DEBUG] Fetch response received, status:", analyzeResponse.status);

      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        console.error("❌ [DEBUG] AI analysis failed:", analyzeResponse.status, errorText);
        throw new Error(`AI analysis failed: ${errorText}`);
      }

      console.log("📥 [DEBUG] Parsing response JSON...");
      const unifiedOutput: UnifiedAIOutput = await analyzeResponse.json();
      console.log("✅ [DEBUG] Unified AI output received:", {
        visualizations: unifiedOutput.visualizations?.length || 0,
        relations: unifiedOutput.relations?.length || 0,
        insights: unifiedOutput.metadata?.insights?.length || 0,
      });
      console.log("✅ [DEBUG] Full unified AI output:", unifiedOutput);
      setAiOutput(unifiedOutput);

    } catch (err) {
      console.error("💥 [DEBUG] Error in startProcessing:", err);
      console.error("💥 [DEBUG] Error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      console.log("🏁 [DEBUG] startProcessing finished");
      setIsAnalyzing(false);
      setAnalyzingStep("");
    }
  }

  const handleFilesSelected = async (selectedFiles: File[]) => {
    console.log("📁 [DEBUG] handleFilesSelected called with", selectedFiles.length, "files");
    setError(null);
    setAiOutput(null);
    setDataMeshOutput(null);
    setMetadataInput([]);

    try {
      const parser = new CSVParser();
      const parsedData: CSVData[] = [];

      // Step 1: Parse files
      console.log("🔍 [DEBUG] Parsing", selectedFiles.length, "files...");
      for (const file of selectedFiles) {
        try {
          console.log("📄 [DEBUG] Parsing file:", file.name);
          const content = await file.text();
          if (!parser.validate(content)) {
            console.warn("⚠️ [DEBUG] File validation failed:", file.name);
            continue;
          }
          const data = await parser.parse(file);
          parsedData.push(data);
          console.log("✅ [DEBUG] File parsed successfully:", file.name);
        } catch (err) {
          console.error(`❌ [DEBUG] Error parsing ${file.name}:`, err);
        }
      }

      console.log("✅ [DEBUG] All files parsed. Total:", parsedData.length);
      setCsvData(parsedData);

    } catch (err) {
      console.error("💥 [DEBUG] Error in handleFilesSelected:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      console.log("🏁 [DEBUG] handleFilesSelected finished");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-purple-50/30 to-zinc-50 dark:from-zinc-950 dark:via-purple-950/20 dark:to-zinc-950">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent dark:from-purple-400 dark:to-purple-300">
            Revellio
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            AI-powered analysis and visualization tool
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Upload CSV files and analyze them with AI
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Upload Files</h2>
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
              <h2 className="text-2xl font-bold text-foreground">Step 1: Data Mesh Analysis</h2>
            </div>
            <p className="ml-11 text-sm text-zinc-600 dark:text-zinc-400">
              Analyze relationships between your data files. Edit and refine relations before proceeding to visualization analysis.
            </p>
            
            {/* Data Mesh Button */}
            <div className="ml-11">
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
            </div>
          </div>
        )}

        {/* Data Mesh Output */}
        {dataMeshOutput && (
          <div className="mb-8 rounded-lg border border-indigo-200/50 bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 p-6 dark:border-indigo-800/50 dark:from-indigo-950/30 dark:to-indigo-900/20">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-foreground">Data Mesh Network</h2>
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
              <h2 className="text-2xl font-bold text-foreground">Step 2: Visualization Analysis</h2>
            </div>
            <p className="ml-11 text-sm text-zinc-600 dark:text-zinc-400">
              Based on the defined relations, AI will determine the best visualization methods for your data.
            </p>

            {/* User Prompt Section */}
            <div className="ml-11 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Additional Context (optional)
              </h3>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Describe what you want to learn from the data or what questions you have..."
                className="w-full rounded-lg border border-zinc-300/50 bg-background px-4 py-3 text-sm text-foreground placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700/50 dark:placeholder:text-zinc-400"
                rows={3}
              />
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
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
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
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
              <div className="rounded-lg border border-purple-200/50 bg-gradient-to-r from-purple-50/50 to-purple-100/30 p-4 dark:border-purple-800/50 dark:from-purple-950/30 dark:to-purple-900/20">
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
              <div className="rounded-lg border border-indigo-200/50 bg-gradient-to-r from-indigo-50/50 to-indigo-100/30 p-4 dark:border-indigo-800/50 dark:from-indigo-950/30 dark:to-indigo-900/20">
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {aiOutput.metadata.insights.length}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Insights</div>
              </div>
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
              <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {aiOutput.metadata.assumptions.length}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Assumptions</div>
              </div>
            </div>
          </div>
        )}


        {/* Input/Output JSON Tree View */}
        {inputPayload && aiOutput && (
          <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-foreground">Input / Output</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Input Section */}
              <div className="rounded-lg border border-blue-200/50 bg-blue-50/30 p-4 dark:border-blue-800/50 dark:bg-blue-950/20">
                <h3 className="mb-3 text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Input
                </h3>
                <div className="max-h-[600px] overflow-auto rounded bg-white/50 p-3 dark:bg-zinc-900/50">
                  <JsonTreeView data={inputPayload} />
                </div>
              </div>

              {/* Output Section */}
              <div className="rounded-lg border border-green-200/50 bg-green-50/30 p-4 dark:border-green-800/50 dark:bg-green-950/20">
                <h3 className="mb-3 text-sm font-semibold text-green-700 dark:text-green-300">
                  Output
                </h3>
                <div className="max-h-[600px] overflow-auto rounded bg-white/50 p-3 dark:bg-zinc-900/50">
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
          <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card dark:border-zinc-800/50">
            <button
              onClick={() => setShowFileDisplay(!showFileDisplay)}
              className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            >
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-semibold text-foreground">File Data Tables</h2>
                <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                  ({csvData.length} file{csvData.length !== 1 ? "s" : ""})
                </span>
              </div>
              {showFileDisplay ? (
                <ChevronUp className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
              )}
            </button>
            {showFileDisplay && (
              <div className="border-t border-zinc-200/50 p-6 dark:border-zinc-800/50">
                <FileDisplay csvData={csvData} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
