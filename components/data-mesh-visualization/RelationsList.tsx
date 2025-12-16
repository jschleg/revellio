"use client";

import { CheckCircle2, Circle } from "lucide-react";
import type { DataMeshRelation } from "@/lib/types/data";

interface RelationsListProps {
  relations: DataMeshRelation[];
  selectedRelations: Set<number>;
  hoveredRelation: number | null;
  onRelationHover: (index: number | null) => void;
  onRelationClick: (index: number) => void;
  onToggleSelection: (index: number) => void;
}

export function RelationsList({
  relations,
  selectedRelations,
  hoveredRelation,
  onRelationHover,
  onRelationClick,
  onToggleSelection,
}: RelationsListProps) {
  return (
    <div className="rounded-lg border border-purple-200/50 bg-white/50 p-4 dark:border-purple-800/50 dark:bg-zinc-900/50">
      <h3 className="mb-4 text-sm font-semibold text-purple-700 dark:text-purple-300">
        Relations ({relations.length})
      </h3>
      <div className="max-h-[400px] space-y-2 overflow-auto">
        {relations.map((relation, index) => {
          const isSelected = selectedRelations.has(index);
          const isHovered = hoveredRelation === index;

          return (
            <div
              key={index}
              className={`cursor-pointer rounded-lg border p-3 transition-all ${
                isSelected
                  ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/30"
                  : isHovered
                  ? "border-purple-300 bg-purple-50/50 dark:border-purple-700 dark:bg-purple-900/20"
                  : "border-purple-200/50 bg-white/50 dark:border-purple-800/50 dark:bg-zinc-900/50"
              }`}
              onMouseEnter={() => onRelationHover(index)}
              onMouseLeave={() => onRelationHover(null)}
              onClick={() => onRelationClick(index)}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelection(index);
                  }}
                  className="mt-0.5"
                  title="Toggle selection"
                >
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white dark:bg-purple-500">
                        {relation.element1}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        ({relation.element1Source.file}
                        {relation.element1Source.column && ` / ${relation.element1Source.column}`}
                        {relation.element1Source.rowIndex !== undefined &&
                          ` / Row ${relation.element1Source.rowIndex + 1}`}
                        )
                      </span>
                    </div>
                    <span className="text-purple-600 dark:text-purple-400">↔</span>
                    <div className="flex items-center gap-1">
                      <span className="rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white dark:bg-purple-500">
                        {relation.element2}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        ({relation.element2Source.file}
                        {relation.element2Source.column && ` / ${relation.element2Source.column}`}
                        {relation.element2Source.rowIndex !== undefined &&
                          ` / Row ${relation.element2Source.rowIndex + 1}`}
                        )
                      </span>
                    </div>
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

