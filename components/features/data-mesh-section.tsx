"use client";

import { useRef } from "react";
import { Loader2, Zap, RefreshCw, MessageSquare } from "lucide-react";
import type { DataMeshOutput, DataMeshRelation, CSVData } from "@/lib/types/data";
import { DataMeshVisualization } from "@/components/data-mesh-visualization";
import { FeedbackPanel } from "@/components/data-mesh-visualization/FeedbackPanel";

interface DataMeshSectionProps {
  csvData: CSVData[];
  dataMeshPrompt: string;
  onDataMeshPromptChange: (prompt: string) => void;
  meshOutput: DataMeshOutput | null;
  isProcessing: boolean;
  step: string;
  onAnalyze: () => Promise<void>;
  onUpdateRelations: (relations: DataMeshRelation[]) => void;
  onReroll?: (existingRelations: DataMeshRelation[], feedback: string) => Promise<void>;
}

export function DataMeshSection({
  csvData,
  dataMeshPrompt,
  onDataMeshPromptChange,
  meshOutput,
  isProcessing,
  step,
  onAnalyze,
  onUpdateRelations,
  onReroll,
}: DataMeshSectionProps) {
  const feedbackSectionRef = useRef<HTMLDivElement>(null);
  const rerollSectionRef = useRef<HTMLDivElement>(null);

  if (csvData.length === 0) {
    return null;
  }

  const scrollToFeedback = () => {
    feedbackSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToReroll = () => {
    rerollSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    if (onReroll && meshOutput) {
      await onReroll(meshOutput.relations, feedback);
    }
  };

  const handleRerollSubmit = async (feedback: string) => {
    if (onReroll && meshOutput) {
      await onReroll(meshOutput.relations, feedback);
    }
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white dark:bg-indigo-500">
          1
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Step 1: Data Mesh Analysis
        </h2>
      </div>
      <p className="ml-11 text-sm text-zinc-700 dark:text-zinc-300">
        Analyze relationships between your data files. Edit and refine relations before
        proceeding to visualization analysis.
      </p>

      <div className="ml-11 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Additional Context (optional)
        </h3>
        <textarea
          value={dataMeshPrompt}
          onChange={(e) => onDataMeshPromptChange(e.target.value)}
          placeholder="Describe what relationships you expect to find, specific connections to look for, or any domain-specific context..."
          className="w-full rounded-lg border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          rows={3}
        />
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          This context helps the AI identify relevant relationships and connections in your
          data.
        </p>
      </div>

      <div className="ml-11">
        <button
          onClick={onAnalyze}
          disabled={isProcessing}
          className="group relative rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:via-indigo-800 hover:to-indigo-900 hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 dark:from-indigo-500 dark:via-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-600 dark:hover:via-indigo-700 dark:hover:to-indigo-800"
        >
          {isProcessing ? (
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

      {meshOutput && (
        <div className="mb-8 space-y-4">
          <div className="rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 to-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-indigo-800/80 dark:from-indigo-950/40 dark:to-zinc-900/60">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Data Mesh Network
                </h2>
                <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                  ({meshOutput.relations.length} relations)
                </span>
              </div>
              {onReroll && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={scrollToFeedback}
                    className="flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Feedback
                  </button>
                  <button
                    onClick={scrollToReroll}
                    className="flex items-center gap-2 rounded-lg border border-indigo-500 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:border-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reroll Relations
                  </button>
                </div>
              )}
            </div>
            <DataMeshVisualization
              dataMeshOutput={meshOutput}
              csvData={csvData}
              onUpdateRelations={onUpdateRelations}
            />
          </div>

          {/* Feedback Section - Always Visible */}
          {onReroll && (
            <>
              <div ref={feedbackSectionRef} className="scroll-mt-4">
                <FeedbackPanel
                  onSubmit={handleFeedbackSubmit}
                  onCancel={() => {}}
                  placeholder="Provide feedback to improve the relations. The AI will consider your feedback along with the current relations..."
                  title="Provide Feedback for Relations"
                />
              </div>

              {/* Reroll Feedback Section - Always Visible */}
              <div ref={rerollSectionRef} className="scroll-mt-4">
                <FeedbackPanel
                  onSubmit={handleRerollSubmit}
                  onCancel={() => {}}
                  placeholder="Describe what additional relations you'd like to see. Current relations will be kept, and new ones will be generated based on your input..."
                  title="Reroll Relations - Generate More"
                />
              </div>
            </>
          )}
        </div>
      )}

      {isProcessing && step && (
        <div className="ml-11 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/60 to-white/60 backdrop-blur-sm p-4 shadow-sm dark:border-indigo-800/80 dark:from-indigo-950/40 dark:to-zinc-900/60">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            <div className="flex-1">
              <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                Data Mesh Analysis in Progress
              </p>
              <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">{step}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

