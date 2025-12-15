"use client";

import { useState } from "react";
import { FileDrop } from "@/components/file-drop";
import { FileDisplay } from "@/components/file-display";
import { Visualizer } from "@/components/visualizer";
import { CSVParser } from "@/lib/data/csv-parser";
import {
  Loader2,
  AlertCircle,
  Eye,
  Zap,
} from "lucide-react";
import { MetadataExtractor } from "@/lib/analysis/metadata-extractor";
import type {
  CSVData,
  Metadata,
  UnifiedAIOutput,
} from "@/lib/types/data";
import { JsonTreeView } from "@/components/json-tree-view";

export default function Home() {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [metadataInput, setMetadataInput] = useState<Metadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<UnifiedAIOutput | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [inputPayload, setInputPayload] = useState<{
    metadataArray: Metadata[];
    dataSlices: CSVData[];
    userPrompt: string;
  } | null>(null);

  const startProcessing = async () => {
    console.log("🚀 [DEBUG] startProcessing called");
    setError(null);
    setIsProcessing(true);
    setAiOutput(null);
    setMetadataInput([]);
    setInputPayload(null);

    try {
      console.log("📊 [DEBUG] CSV data count:", csvData.length);
      const metadataExtractor = new MetadataExtractor();
      // Extract metadata
      setProcessingStep("Extracting metadata...");
      console.log("🔍 [DEBUG] Extracting metadata...");
      const metadataArray = metadataExtractor.extractAll(csvData);
      console.log("✅ [DEBUG] Metadata extracted:", metadataArray.length, "files");
      setMetadataInput(metadataArray);

      // Prepare data slices (5 elements from each CSV)
      setProcessingStep("Preparing data samples...");
      console.log("🔍 [DEBUG] Preparing data slices...");
      const dataSlices: CSVData[] = csvData.map((data) => ({
        ...data,
        rows: data.rows.slice(0, 5), // Take first 5 rows
      }));
      console.log("✅ [DEBUG] Data slices prepared:", dataSlices.length);

      // Store input payload
      const payload = {
        metadataArray,
        dataSlices,
        userPrompt: userPrompt || "",
      };
      setInputPayload(payload);

      // Unified AI Analysis
      setProcessingStep("AI is analyzing data and creating visualization strategy...");
      console.log("🔍 [DEBUG] Starting unified AI analysis");
      console.log("📝 [DEBUG] User prompt:", userPrompt);
      console.log("📦 [DEBUG] Request payload:", {
        metadataCount: metadataArray.length,
        dataSlicesCount: dataSlices.length,
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
      setIsProcessing(false);
      setProcessingStep("");
    }
  }

  const handleFilesSelected = async (selectedFiles: File[]) => {
    console.log("📁 [DEBUG] handleFilesSelected called with", selectedFiles.length, "files");
    setError(null);
    setIsProcessing(true);
    setAiOutput(null);
    setMetadataInput([]);

    try {
      const parser = new CSVParser();
      const parsedData: CSVData[] = [];
      const metadataExtractor = new MetadataExtractor();

      // Step 1: Parse files
      setProcessingStep("Parsing files...");
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
      setIsProcessing(false);
      setProcessingStep("");
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

        {/* User Prompt Section */}
        <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Additional Context (optional)
          </h2>
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

        {/* Analyze Button */}
        {csvData.length > 0 && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={startProcessing}
              disabled={isProcessing}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-purple-900 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 dark:from-purple-500 dark:to-purple-700 dark:hover:from-purple-600 dark:hover:to-purple-800"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Start Analysis
                </span>
              )}
            </button>
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

        {/* Processing Indicator with Step */}
        {isProcessing && (
          <div className="mb-6 rounded-lg border border-zinc-200/50 bg-card p-4 dark:border-zinc-800/50">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
              <div>
                <p className="font-medium text-foreground">Processing...</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{processingStep}</p>
              </div>
            </div>
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

        {/* Input: Metadata Display - Compact */}
        {metadataInput.length > 0 && (
          <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-foreground">Input: Metadata</h2>
            </div>
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

        {/* AI Output - Visualizer Component */}
        {aiOutput && <Visualizer aiOutput={aiOutput} csvData={csvData} />}

        {/* File Display with Tables */}
        {csvData.length > 0 && (
          <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
            <FileDisplay csvData={csvData} />
          </div>
        )}
      </div>
    </div>
  );
}
