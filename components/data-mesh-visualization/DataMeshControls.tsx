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
    <div className="flex flex-col gap-2">
      {hasRelations && (
        <button
          onClick={onShowRelations}
          className="rounded-lg border border-purple-200/50 bg-white/80 p-1.5 text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-800/50 dark:bg-zinc-900/80 dark:text-purple-300 dark:hover:bg-purple-900/50"
          title="Show Relations"
        >
          <List className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={onAddRelation}
        className="rounded-lg border border-purple-200/50 bg-white/80 p-1.5 text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-800/50 dark:bg-zinc-900/80 dark:text-purple-300 dark:hover:bg-purple-900/50"
        title="Add Relation Manually (Coming soon)"
      >
        <Plus className="h-4 w-4" />
      </button>
      {hasRelations && (
        <button
          onClick={onRegenerateRelations}
          className="rounded-lg border border-indigo-200/50 bg-white/80 p-1.5 text-indigo-700 transition-colors hover:bg-indigo-50 dark:border-indigo-800/50 dark:bg-zinc-900/80 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
          title="Regenerate Relations with AI"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={onDetermineRelations}
        className="rounded-lg border border-zinc-200/50 bg-white/80 p-1.5 text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800/50 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-700"
        title="Determine Relations Deterministically (Coming soon)"
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}

