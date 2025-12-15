"use client";

import type { CSVData, VisualizationInstruction, Relation } from "@/lib/types/data";
import { ArrowRight } from "lucide-react";

interface RelationalViewVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData[];
  relations: Relation[];
}

export function RelationalViewVisualization({
  instruction,
  data,
  relations,
}: RelationalViewVisualizationProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((file, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50"
          >
            <h3 className="mb-2 font-semibold text-foreground">{file.fileName}</h3>
            <div className="flex flex-wrap gap-2">
              {file.columns.map((col) => (
                <span
                  key={col}
                  className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {relations.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-foreground">Beziehungen:</h4>
          {relations.map((rel, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-lg border border-purple-200/50 bg-purple-50/50 p-3 dark:border-purple-800/50 dark:bg-purple-900/20"
            >
              <span className="rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white dark:bg-purple-500">
                {rel.type}
              </span>
              <span className="text-sm font-medium text-foreground">{rel.sourceColumn}</span>
              <ArrowRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-foreground">{rel.targetColumn}</span>
              <span className="ml-auto text-xs text-zinc-500">
                {(rel.confidence * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

