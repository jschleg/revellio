"use client";

import { CheckCircle2, Circle, Edit2, Trash2 } from "lucide-react";
import type { DataMeshRelation } from "@/lib/types/data";

interface RelationsListProps {
  relations: DataMeshRelation[];
  selectedRelations: Set<number>;
  hoveredRelation: number | null;
  onRelationHover: (index: number | null) => void;
  onRelationClick: (index: number) => void;
  onToggleSelection: (index: number) => void;
  onRemove?: (index: number) => void;
}

export function RelationsList({
  relations,
  selectedRelations,
  hoveredRelation,
  onRelationHover,
  onRelationClick,
  onToggleSelection,
  onRemove,
}: RelationsListProps) {
  if (relations.length === 0) {
    return (
      <div className="rounded-lg border border-purple-200/50 bg-white/50 p-8 text-center dark:border-purple-800/50 dark:bg-zinc-900/50">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No relations found. Generate relations to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-purple-200/50 bg-white/50 p-4 dark:border-purple-800/50 dark:bg-zinc-900/50">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300">
          Relations ({relations.length})
        </h3>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {selectedRelations.size > 0 && `${selectedRelations.size} selected`}
        </div>
      </div>
      <div className="max-h-[600px] space-y-3 overflow-auto">
        {relations.map((relation, index) => {
          const isSelected = selectedRelations.has(index);
          const isHovered = hoveredRelation === index;

          return (
            <div
              key={index}
              className={`group relative rounded-lg border p-4 transition-all ${
                isSelected
                  ? "border-purple-500 bg-purple-50 shadow-sm dark:border-purple-400 dark:bg-purple-900/30"
                  : isHovered
                  ? "border-purple-300 bg-purple-50/50 dark:border-purple-700 dark:bg-purple-900/20"
                  : "border-purple-200/50 bg-white/50 dark:border-purple-800/50 dark:bg-zinc-900/50"
              }`}
              onMouseEnter={() => onRelationHover(index)}
              onMouseLeave={() => onRelationHover(null)}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelection(index);
                  }}
                  className="mt-0.5 flex-shrink-0"
                  title="Toggle selection"
                >
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h4
                      className="cursor-pointer text-sm font-semibold text-purple-900 dark:text-purple-200 hover:text-purple-700 dark:hover:text-purple-300"
                      onClick={() => onRelationClick(index)}
                    >
                      {relation.title}
                    </h4>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRelationClick(index);
                        }}
                        className="rounded p-1 text-zinc-500 transition-colors hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/50 dark:hover:text-purple-400"
                        title="Edit relation"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {onRemove && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(index);
                          }}
                          className="rounded p-1 text-zinc-500 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                          title="Remove relation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {relation.elements.map((element, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white dark:bg-purple-500">
                          {element.name}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          ({element.source.file}
                          {element.source.column && ` / ${element.source.column}`}
                          {element.source.rowIndex !== undefined &&
                            ` / Row ${element.source.rowIndex + 1}`}
                          )
                        </span>
                        {idx < relation.elements.length - 1 && (
                          <span className="mx-1 text-purple-600 dark:text-purple-400">↔</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {relation.relationExplanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

