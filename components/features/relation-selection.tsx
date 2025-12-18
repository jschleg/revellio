"use client";

import { useState, useCallback } from "react";
import { Check, X, Info } from "lucide-react";
import type { DataMeshRelation } from "@/lib/types/data";

interface RelationSelectionProps {
  relations: DataMeshRelation[];
  selectedRelations: Set<number>;
  onSelectionChange: (selected: Set<number>) => void;
}

export function RelationSelection({
  relations,
  selectedRelations,
  onSelectionChange,
}: RelationSelectionProps) {
  const [expandedRelation, setExpandedRelation] = useState<number | null>(null);

  const handleToggleRelation = useCallback(
    (index: number) => {
      const newSelection = new Set(selectedRelations);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      onSelectionChange(newSelection);
    },
    [selectedRelations, onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    const allSelected = new Set(relations.map((_, index) => index));
    onSelectionChange(allSelected);
  }, [relations, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    onSelectionChange(new Set());
  }, [onSelectionChange]);

  if (relations.length === 0) {
    return null;
  }

  const getRelationColor = (index: number, isSelected: boolean): string => {
    if (isSelected) return "rgb(147, 51, 234)";
    
    const colors = [
      "rgb(59, 130, 246)",   // blue-500
      "rgb(34, 197, 94)",    // green-500
      "rgb(239, 68, 68)",    // red-500
      "rgb(251, 146, 60)",   // orange-500
      "rgb(168, 85, 247)",   // purple-400
      "rgb(236, 72, 153)",   // pink-500
      "rgb(139, 92, 246)",   // violet-500
      "rgb(20, 184, 166)",   // teal-500
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="ml-11 space-y-4">
      <div className="rounded-xl border border-purple-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-purple-800/80 dark:bg-zinc-900/60">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Select Relations for Visualization
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Choose which relations should be visualized. Each selected relation will get its own
              fitting visualization.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-900/50"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-lg border border-purple-200/50 bg-purple-50/50 p-3 dark:border-purple-800/50 dark:bg-purple-950/30">
          <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <p className="text-xs text-purple-700 dark:text-purple-300">
            <strong>{selectedRelations.size}</strong> of <strong>{relations.length}</strong> relations
            selected. Only selected relations will be used for visualization generation.
          </p>
        </div>

        <div className="space-y-2">
          {relations.map((relation, index) => {
            const isSelected = selectedRelations.has(index);
            const isExpanded = expandedRelation === index;
            const color = getRelationColor(index, isSelected);

            return (
              <div
                key={index}
                className={`group relative rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-purple-500 bg-purple-50/50 shadow-md dark:border-purple-400 dark:bg-purple-950/30"
                    : "border-zinc-200 bg-white/50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:border-zinc-600"
                }`}
              >
                <div
                  className="flex cursor-pointer items-center gap-3 p-4"
                  onClick={() => handleToggleRelation(index)}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      isSelected
                        ? "border-purple-500 bg-purple-500"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {isSelected && (
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {relation.title}
                      </h4>
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {relation.relationExplanation}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {relation.elements.map((element, elemIndex) => (
                        <span
                          key={elemIndex}
                          className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300"
                        >
                          {element.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedRelation(isExpanded ? null : index);
                    }}
                    className="shrink-0 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Info className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/30">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                          Detailed Explanation
                        </p>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                          {relation.relationExplanation}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                          Connected Elements ({relation.elements.length})
                        </p>
                        <div className="mt-2 space-y-1">
                          {relation.elements.map((element, elemIndex) => (
                            <div
                              key={elemIndex}
                              className="rounded-md border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                            >
                              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                {element.name}
                              </p>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                {element.source.file}
                                {element.source.column && ` → ${element.source.column}`}
                                {element.source.rowIndex !== undefined &&
                                  ` (Row ${element.source.rowIndex + 1})`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

