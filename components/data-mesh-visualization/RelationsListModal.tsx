"use client";

import { X } from "lucide-react";
import type { DataMeshRelation } from "@/lib/types/data";
import { RelationsList } from "./RelationsList";

interface RelationsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  relations: DataMeshRelation[];
  selectedRelations: Set<number>;
  hoveredRelation: number | null;
  onRelationHover: (index: number | null) => void;
  onRelationClick: (index: number) => void;
  onToggleSelection: (index: number) => void;
  onRemove?: (index: number) => void;
  onRerollRelation?: (index: number, feedback: string) => Promise<void>;
}

export function RelationsListModal({
  isOpen,
  onClose,
  relations,
  selectedRelations,
  hoveredRelation,
  onRelationHover,
  onRelationClick,
  onToggleSelection,
  onRemove,
  onRerollRelation,
}: RelationsListModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-xl border-2 border-purple-500 bg-white shadow-2xl dark:border-purple-400 dark:bg-zinc-900 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-200/50 px-6 py-4 dark:border-purple-800/50">
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200">
            Relations List ({relations.length})
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-auto p-6">
          <RelationsList
            relations={relations}
            selectedRelations={selectedRelations}
            hoveredRelation={hoveredRelation}
            onRelationHover={onRelationHover}
            onRelationClick={onRelationClick}
            onToggleSelection={onToggleSelection}
            onRemove={onRemove}
            onRerollRelation={onRerollRelation}
          />
        </div>
      </div>
    </div>
  );
}

