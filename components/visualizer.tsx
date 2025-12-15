"use client";

import type { UnifiedAIOutput, CSVData } from "@/lib/types/data";
import { BarChart3, GitBranch, Lightbulb, MessageSquare } from "lucide-react";
import { DynamicVisualization } from "./visualizations";

interface VisualizerProps {
  aiOutput: UnifiedAIOutput;
  csvData: CSVData[];
}

export function Visualizer({ aiOutput, csvData }: VisualizerProps) {
  const renderVisualization = (instruction: typeof aiOutput.visualizations[0], index: number) => {
    return (
      <div
        key={index}
        className="rounded-lg border border-purple-200/50 bg-gradient-to-r from-purple-50 to-purple-100/30 p-6 dark:border-purple-800/50 dark:from-purple-900/20 dark:to-purple-950/20"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white dark:bg-purple-500">
              {instruction.type}
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Modul: {instruction.module}
            </span>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-purple-300/50 bg-white/80 p-4 dark:border-purple-700 dark:bg-zinc-900/50">
          <h3 className="mb-2 font-semibold text-purple-900 dark:text-purple-200">
            Visualisierung: {instruction.type}
          </h3>
          <p className="mb-3 text-sm text-purple-800 dark:text-purple-300">
            <span className="font-medium">Begründung:</span> {instruction.reasoning}
          </p>
          <div className="text-xs text-purple-700 dark:text-purple-400">
            <p>
              <span className="font-medium">Datenquelle:</span> {instruction.config.dataSource}
            </p>
            {instruction.config.columns && instruction.config.columns.length > 0 && (
              <p>
                <span className="font-medium">Spalten:</span>{" "}
                {instruction.config.columns.join(", ")}
              </p>
            )}
            {instruction.config.aggregation && (
              <p>
                <span className="font-medium">Aggregation:</span> {instruction.config.aggregation}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic visualization rendering */}
        <div className="rounded-lg border border-zinc-200/50 bg-white/80 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/50">
          <DynamicVisualization
            instruction={instruction}
            csvData={csvData}
            relations={aiOutput.relations}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Reasoning */}
      {aiOutput.reasoning && (
        <div className="rounded-lg border border-blue-200/50 bg-gradient-to-r from-blue-50 to-blue-100/50 p-6 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-blue-950/20">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-foreground">Gesamtbegründung</h2>
          </div>
          <p className="text-sm text-blue-900 dark:text-blue-200">{aiOutput.reasoning}</p>
        </div>
      )}

      {/* Visualizations */}
      {aiOutput.visualizations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Visualisierungen</h2>
          {aiOutput.visualizations.map((viz, index) => renderVisualization(viz, index))}
        </div>
      )}

      {/* Relations */}
      {aiOutput.relations.length > 0 && (
        <div className="rounded-lg border border-zinc-200/50 bg-card p-6 dark:border-zinc-800/50">
          <div className="mb-4 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-foreground">Identifizierte Relationen</h2>
          </div>
          <div className="space-y-3">
            {aiOutput.relations.map((rel, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-purple-200/50 bg-purple-50/50 p-4 dark:border-purple-800/50 dark:bg-purple-900/20"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white dark:bg-purple-500">
                      {rel.type}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {rel.sourceColumn}
                    </span>
                    <span className="text-purple-600 dark:text-purple-400">→</span>
                    <span className="text-sm font-medium text-foreground">
                      {rel.targetColumn}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {rel.description}
                  </p>
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

      {/* Metadata: Insights and Assumptions */}
      {(aiOutput.metadata.insights.length > 0 || aiOutput.metadata.assumptions.length > 0) && (
        <div className="space-y-4">
          {aiOutput.metadata.insights.length > 0 && (
            <div className="rounded-lg border border-yellow-200/50 bg-gradient-to-r from-yellow-50 to-yellow-100/50 p-6 dark:border-yellow-800/50 dark:from-yellow-900/20 dark:to-yellow-950/20">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-xl font-semibold text-foreground">Erkenntnisse</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {aiOutput.metadata.insights.map((insight, index) => (
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

          {aiOutput.metadata.assumptions.length > 0 && (
            <div className="rounded-lg border border-blue-200/50 bg-gradient-to-r from-blue-50 to-blue-100/50 p-6 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-blue-950/20">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-foreground">Annahmen</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {aiOutput.metadata.assumptions.map((assumption, index) => (
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
    </div>
  );
}

