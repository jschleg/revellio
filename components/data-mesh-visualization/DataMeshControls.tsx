"use client";

import { Plus, RefreshCw, Search, List } from "lucide-react";

interface DataMeshControlsProps {
  onAddRelation: () => void;
  onRegenerateRelations: () => void;
  onDetermineRelations: () => void;
  onShowRelations: () => void;
  hasRelations: boolean;
}

export function DataMeshControls({
  onAddRelation,
  onRegenerateRelations,
  onDetermineRelations,
  onShowRelations,
  hasRelations,
}: DataMeshControlsProps) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3 rounded-lg border border-purple-200/50 bg-white/80 p-4 dark:border-purple-800/50 dark:bg-zinc-900/80">
      {hasRelations && (
        <button
          onClick={onShowRelations}
          className="flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
        >
          <List className="h-4 w-4" />
          Show Relations
        </button>
      )}
      <button
        onClick={onAddRelation}
        className="flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
      >
        <Plus className="h-4 w-4" />
        Add Relation Manually
      </button>
      {hasRelations && (
        <button
          onClick={onRegenerateRelations}
          className="flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate Relations with AI
        </button>
      )}
      <button
        onClick={onDetermineRelations}
        className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        title="Coming soon"
      >
        <Search className="h-4 w-4" />
        Determine Relations Deterministically
      </button>
    </div>
  );
}

