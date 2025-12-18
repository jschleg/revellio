"use client";

import { Eye } from "lucide-react";
import type { UnifiedAIOutput } from "@/lib/types/data";

interface AIAnalysisOverviewProps {
  aiOutput: UnifiedAIOutput;
}

export function AIAnalysisOverview({ aiOutput }: AIAnalysisOverviewProps) {
  return (
    <div className="mb-8 rounded-lg border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-purple-100/30 p-6 dark:border-purple-800/50 dark:from-purple-950/30 dark:to-purple-900/20">
      <div className="mb-4 flex items-center gap-2">
        <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
            {aiOutput.metadata?.insights?.length || 0}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Insights</div>
        </div>
      </div>
    </div>
  );
}

