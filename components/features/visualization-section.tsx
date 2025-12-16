"use client";

import { Loader2, Zap } from "lucide-react";
import type { DataMeshOutput, DataMeshRelation } from "@/lib/types/data";

interface VisualizationSectionProps {
  csvDataCount: number;
  meshOutput: DataMeshOutput | null;
  meshRelations: DataMeshRelation[];
  userPrompt: string;
  onUserPromptChange: (prompt: string) => void;
  isProcessing: boolean;
  step: string;
  onAnalyze: () => Promise<void>;
}

export function VisualizationSection({
  csvDataCount,
  meshOutput,
  meshRelations,
  userPrompt,
  onUserPromptChange,
  isProcessing,
  step,
  onAnalyze,
}: VisualizationSectionProps) {
  if (csvDataCount === 0 || !meshOutput || meshRelations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white dark:bg-purple-500">
          2
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Step 2: Visualization Analysis
        </h2>
      </div>
      <p className="ml-11 text-sm text-zinc-700 dark:text-zinc-300">
        Based on the defined relations, AI will determine the best visualization methods for
        your data.
      </p>

      <div className="ml-11 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Additional Context (optional)
        </h3>
        <textarea
          value={userPrompt}
          onChange={(e) => onUserPromptChange(e.target.value)}
          placeholder="Describe what you want to learn from the data or what questions you have..."
          className="w-full rounded-lg border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          rows={3}
        />
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          This context helps the AI create more appropriate visualizations.
        </p>
      </div>

      <div className="ml-11">
        <button
          onClick={onAnalyze}
          disabled={isProcessing || !meshOutput || meshRelations.length === 0}
          className="group relative rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 dark:from-purple-500 dark:via-purple-600 dark:to-purple-700 dark:hover:from-purple-600 dark:hover:via-purple-700 dark:hover:to-purple-800"
        >
          {isProcessing ? (
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

      {isProcessing && step && (
        <div className="ml-11 rounded-xl border border-purple-200/80 bg-gradient-to-r from-purple-50/60 to-white/60 backdrop-blur-sm p-4 shadow-sm dark:border-purple-800/80 dark:from-purple-950/40 dark:to-zinc-900/60">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
            <div className="flex-1">
              <p className="font-semibold text-purple-900 dark:text-purple-200">
                AI Analysis in Progress
              </p>
              <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">{step}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

