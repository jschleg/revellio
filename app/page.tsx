"use client";

import { useState } from "react";
import { FileDrop } from "@/components/file-drop";
import { FileDisplay } from "@/components/file-display";
import { CSVParser } from "@/lib/data/csv-parser";
import {
  Loader2,
  AlertCircle,
  Sparkles,
  Lightbulb,
  Eye,
  BarChart3,
  CheckCircle2,
  GitBranch,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Zap,
} from "lucide-react";
import { MetadataExtractor } from "@/lib/analysis/metadata-extractor";
import type {
  CSVData,
  VisualizationSuggestion,
  AIAnalysis,
  Metadata,
  Relation,
  Explanation,
  Decision,
} from "@/lib/types/data";

export default function Home() {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [metadataInput, setMetadataInput] = useState<Metadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [visualizations, setVisualizations] = useState<VisualizationSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [vizExplanations, setVizExplanations] = useState<Record<number, string>>({});

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setError(null);
    setIsProcessing(true);
    setAnalysis(null);
    setVisualizations([]);
    setMetadataInput([]);
    setRelations([]);
    setExplanations([]);
    setVizExplanations({});

    try {
      const parser = new CSVParser();
      const parsedData: CSVData[] = [];
      const metadataExtractor = new MetadataExtractor();

      // Step 1: Parse files
      setProcessingStep("Dateien werden geparst...");
      for (const file of selectedFiles) {
        try {
          const content = await file.text();
          if (!parser.validate(content)) {
            continue;
          }
          const data = await parser.parse(file);
          parsedData.push(data);
        } catch (err) {
          console.error(`Error parsing ${file.name}:`, err);
        }
      }

      setCsvData(parsedData);

      // Step 2: Extract metadata
      setProcessingStep("Metadaten werden extrahiert...");
      const metadataArray = metadataExtractor.extractAll(parsedData);
      setMetadataInput(metadataArray);

      // Step 3: AI Analysis (via API)
      setProcessingStep("KI analysiert die Datenstruktur...");
      console.log("🔍 [DEBUG] Starting AI analysis with metadata:", metadataArray);
      const analyzeResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadataArray }),
      });
      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        console.error("❌ [DEBUG] AI analysis failed:", analyzeResponse.status, errorText);
        throw new Error(`AI analysis failed: ${errorText}`);
      }
      const aiAnalysis: AIAnalysis = await analyzeResponse.json();
      console.log("✅ [DEBUG] AI analysis result:", aiAnalysis);
      setAnalysis(aiAnalysis);

      // Step 4: Identify Relations (via API)
      setProcessingStep("KI identifiziert Beziehungen zwischen Datensätzen...");
      console.log("🔍 [DEBUG] Identifying relations...");
      const relationsResponse = await fetch("/api/ai/relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadataArray }),
      });
      if (relationsResponse.ok) {
        const relationsData = await relationsResponse.json();
        console.log("✅ [DEBUG] Relations found:", relationsData.relations);
        setRelations(relationsData.relations || []);
      } else {
        const errorText = await relationsResponse.text();
        console.warn("⚠️ [DEBUG] Relations API failed:", relationsResponse.status, errorText);
      }

      // Step 5: Get visualization suggestions (via API)
      setProcessingStep("KI schlägt Visualisierungen vor...");
      console.log("🔍 [DEBUG] Getting visualization suggestions...");
      const vizResponse = await fetch("/api/ai/visualizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ structure: aiAnalysis.structure }),
      });
      if (vizResponse.ok) {
        const vizData = await vizResponse.json();
        const visualizationSuggestions = vizData.visualizations || [];
        console.log("✅ [DEBUG] Visualizations:", visualizationSuggestions);
        setVisualizations(visualizationSuggestions);

        // Step 6: Generate explanations for visualizations (via API)
        setProcessingStep("KI generiert Erklärungen für Visualisierungen...");
        const explanationsMap: Record<number, string> = {};
        for (let i = 0; i < visualizationSuggestions.length; i++) {
          try {
            const explainResponse = await fetch("/api/ai/generate-explanation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                visualizationType: visualizationSuggestions[i].type,
                data: visualizationSuggestions[i],
              }),
            });
            if (explainResponse.ok) {
              const explainData = await explainResponse.json();
              explanationsMap[i] = explainData.explanation || "";
            }
          } catch (err) {
            console.error(`Error generating explanation for viz ${i}:`, err);
          }
        }
        setVizExplanations(explanationsMap);

        // Step 7: Explain decisions (via API)
        setProcessingStep("KI erklärt Entscheidungen...");
        const decisionExplanations: Explanation[] = [];
        for (const viz of visualizationSuggestions.slice(0, 3)) {
          try {
            const decision: Decision = {
              type: "visualization",
              data: viz,
              reasoning: viz.reasoning,
            };
            const decisionResponse = await fetch("/api/ai/explain", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ decision }),
            });
            if (decisionResponse.ok) {
              const explanation = await decisionResponse.json();
              decisionExplanations.push(explanation);
            }
          } catch (err) {
            console.error("Error explaining decision:", err);
          }
        }
        setExplanations(decisionExplanations);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
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
            KI-gestütztes Analyse- und Visualisierungstool
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Lade CSV-Dateien hoch und analysiere sie mit KI
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Dateien hochladen</h2>
          <FileDrop
            onFilesSelected={handleFilesSelected}
            accept=".csv"
            maxFiles={10}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Fehler</span>
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
                <p className="font-medium text-foreground">Verarbeitung läuft...</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{processingStep}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Overview - Compact Summary */}
        {(analysis || visualizations.length > 0 || relations.length > 0) && (
          <div className="mb-8 rounded-lg border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-purple-100/30 p-6 dark:border-purple-800/50 dark:from-purple-950/30 dark:to-purple-900/20">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-foreground">KI-Analyse Übersicht</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {analysis?.insights.length || 0}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Erkenntnisse</div>
              </div>
              <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {visualizations.length}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Visualisierungen</div>
              </div>
              <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {relations.length}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Relationen</div>
              </div>
              <div className="rounded-lg bg-white/50 p-3 dark:bg-zinc-900/50">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {explanations.length}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Erklärungen</div>
              </div>
            </div>
          </div>
        )}

        {/* Input: Metadata Display - Compact */}
        {metadataInput.length > 0 && (
          <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-foreground">Eingabe: Metadaten</h2>
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
                      {meta.rowCount} Zeilen
                    </span>
                    <span className="rounded bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                      {meta.columns.length} Spalten
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

        {/* AI Analysis Results - Compact Cards */}
        {analysis && (
          <div className="mb-8 space-y-6">
            {/* Insights */}
            {analysis.insights.length > 0 && (
              <div className="rounded-lg border border-yellow-200/50 bg-gradient-to-r from-yellow-50 to-yellow-100/50 p-6 dark:border-yellow-800/50 dark:from-yellow-900/20 dark:to-yellow-950/20">
                <div className="mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <h2 className="text-xl font-semibold text-foreground">Erkenntnisse</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {analysis.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-yellow-300 bg-white/80 p-3 text-sm text-yellow-900 dark:border-yellow-700 dark:bg-zinc-900/50 dark:text-yellow-200"
                    >
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assumptions */}
            {analysis.assumptions.length > 0 && (
              <div className="rounded-lg border border-blue-200/50 bg-gradient-to-r from-blue-50 to-blue-100/50 p-6 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-blue-950/20">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-foreground">Annahmen</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {analysis.assumptions.map((assumption, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-blue-300 bg-white/80 p-3 text-sm text-blue-900 dark:border-blue-700 dark:bg-zinc-900/50 dark:text-blue-200"
                    >
                      {assumption}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Relations - Visual Flow */}
        {relations.length > 0 && (
          <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
            <div className="mb-4 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-foreground">Identifizierte Relationen</h2>
            </div>
            <div className="space-y-3">
              {relations.map((rel, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-purple-200/50 bg-purple-50/50 p-4 dark:border-purple-800/50 dark:bg-purple-900/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white dark:bg-purple-500">
                        {rel.type}
                      </span>
                      <span className="text-sm font-medium text-foreground">{rel.sourceColumn}</span>
                      <ArrowRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-foreground">{rel.targetColumn}</span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{rel.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {(rel.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Confidence</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visualization Suggestions with Explanations */}
        {visualizations.length > 0 && (
          <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-foreground">Visualisierungsvorschläge</h2>
            </div>
            <div className="space-y-4">
              {visualizations.map((viz, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-purple-200/50 bg-gradient-to-r from-purple-50 to-purple-100/30 p-5 dark:border-purple-800/50 dark:from-purple-900/20 dark:to-purple-950/20"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white dark:bg-purple-500">
                      {viz.type}
                    </span>
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="mb-2 font-semibold text-purple-900 dark:text-purple-200">
                    {viz.explanation}
                  </h3>
                  <p className="mb-3 text-sm text-purple-800 dark:text-purple-300">
                    <span className="font-medium">Begründung:</span> {viz.reasoning}
                  </p>
                  {vizExplanations[index] && (
                    <div className="rounded-lg border border-purple-300/50 bg-white/80 p-3 text-sm text-purple-900 dark:border-purple-700 dark:bg-zinc-900/50 dark:text-purple-200">
                      <span className="font-medium">KI-Erklärung:</span> {vizExplanations[index]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision Explanations */}
        {explanations.length > 0 && (
          <div className="mb-8 rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-foreground">Entscheidungserklärungen</h2>
            </div>
            <div className="space-y-4">
              {explanations.map((explanation, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Entscheidung #{index + 1}: {explanation.decision.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {(explanation.confidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Confidence</div>
                      </div>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-foreground">{explanation.rationale}</p>
                  {explanation.alternatives && explanation.alternatives.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Alternativen:
                      </span>
                      <ul className="mt-1 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {explanation.alternatives.map((alt, altIndex) => (
                          <li key={altIndex} className="flex items-start gap-2">
                            <span className="text-purple-600 dark:text-purple-400">•</span>
                            {alt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
