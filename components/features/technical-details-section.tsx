"use client";

import { Eye } from "lucide-react";
import { JsonTreeView } from "@/components/json-tree-view";

interface TechnicalDetailsSectionProps {
  meshInputPayload: unknown;
  meshOutput: unknown;
  aiInputPayload: unknown;
  aiOutput: unknown;
}

export function TechnicalDetailsSection({
  meshInputPayload,
  meshOutput,
  aiInputPayload,
  aiOutput,
}: TechnicalDetailsSectionProps) {
  return (
    <>
      {meshInputPayload && meshOutput && (
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
                <JsonTreeView data={meshInputPayload} />
              </div>
            </div>
            <div className="rounded-lg border border-green-200/80 bg-green-50/60 backdrop-blur-sm p-4 shadow-sm dark:border-green-800/80 dark:bg-green-950/40">
              <h3 className="mb-3 text-sm font-semibold text-green-700 dark:text-green-300">
                Output
              </h3>
              <div className="max-h-[600px] overflow-auto rounded bg-white/80 p-3 shadow-sm dark:bg-zinc-800/60">
                <JsonTreeView data={meshOutput} />
              </div>
            </div>
          </div>
        </div>
      )}

      {aiInputPayload && aiOutput && (
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
                <JsonTreeView data={aiInputPayload} />
              </div>
            </div>
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
    </>
  );
}

