"use client";

import { useState, useRef, useEffect } from "react";
import type { DataMeshOutput, DataMeshRelation, CSVData } from "@/lib/types/data";
import { FileText, Columns, FileCheck, CheckCircle2, Circle } from "lucide-react";

interface DataMeshVisualizationProps {
  dataMeshOutput: DataMeshOutput;
  csvData: CSVData[];
}

interface ElementPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SelectedRelation {
  relationIndex: number;
  isSelected: boolean;
}

export function DataMeshVisualization({
  dataMeshOutput,
  csvData,
}: DataMeshVisualizationProps) {
  const [selectedRelations, setSelectedRelations] = useState<Set<number>>(new Set());
  const [hoveredRelation, setHoveredRelation] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const elementPositionsRef = useRef<Map<string, ElementPosition>>(new Map());

  // Toggle selection for a relation
  const toggleRelation = (index: number) => {
    setSelectedRelations((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Get unique files from relations and csvData
  const getFiles = (): string[] => {
    const fileSet = new Set<string>();
    dataMeshOutput.relations.forEach((rel) => {
      fileSet.add(rel.element1Source.file);
      fileSet.add(rel.element2Source.file);
    });
    csvData.forEach((data) => fileSet.add(data.fileName));
    return Array.from(fileSet);
  };

  const files = getFiles();

  // Get columns for a specific file
  const getColumnsForFile = (fileName: string): string[] => {
    const data = csvData.find((d) => d.fileName === fileName);
    return data?.columns || [];
  };

  // Get rows for a specific file (limited to first 10 for visualization)
  const getRowsForFile = (fileName: string): number[] => {
    const data = csvData.find((d) => d.fileName === fileName);
    if (!data) return [];
    const maxRows = Math.min(10, data.rows.length);
    return Array.from({ length: maxRows }, (_, i) => i);
  };

  // Generate element ID
  const getElementId = (
    file: string,
    column?: string,
    rowIndex?: number
  ): string => {
    if (rowIndex !== undefined && column) {
      return `${file}::${column}::row${rowIndex}`;
    }
    if (column) {
      return `${file}::${column}`;
    }
    return file;
  };

  // Calculate positions for elements using refs after render
  useEffect(() => {
    if (!containerRef.current) return;

    const updatePositions = () => {
      const positions = new Map<string, ElementPosition>();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      // Find all elements by their data attributes
      files.forEach((file) => {
        const fileEl = containerRef.current?.querySelector(
          `[data-element-id="${getElementId(file)}"]`
        ) as HTMLElement;
        if (fileEl) {
          const rect = fileEl.getBoundingClientRect();
          positions.set(getElementId(file), {
            id: getElementId(file),
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height,
          });
        }

        const columns = getColumnsForFile(file);
        columns.forEach((column) => {
          const colEl = containerRef.current?.querySelector(
            `[data-element-id="${getElementId(file, column)}"]`
          ) as HTMLElement;
          if (colEl) {
            const rect = colEl.getBoundingClientRect();
            positions.set(getElementId(file, column), {
              id: getElementId(file, column),
              x: rect.left - containerRect.left,
              y: rect.top - containerRect.top,
              width: rect.width,
              height: rect.height,
            });
          }

          const rows = getRowsForFile(file).slice(0, 5);
          rows.forEach((rowIndex) => {
            const rowEl = containerRef.current?.querySelector(
              `[data-element-id="${getElementId(file, column, rowIndex)}"]`
            ) as HTMLElement;
            if (rowEl) {
              const rect = rowEl.getBoundingClientRect();
              positions.set(getElementId(file, column, rowIndex), {
                id: getElementId(file, column, rowIndex),
                x: rect.left - containerRect.left,
                y: rect.top - containerRect.top,
                width: rect.width,
                height: rect.height,
              });
            }
          });
        });
      });

      elementPositionsRef.current = positions;
    };

    // Initial update
    updatePositions();

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      updatePositions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also update after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(updatePositions, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [files, csvData]);

  // Get position for an element
  const getElementPosition = (
    file: string,
    column?: string,
    rowIndex?: number
  ): ElementPosition | null => {
    const id = getElementId(file, column, rowIndex);
    return elementPositionsRef.current.get(id) || null;
  };

  // Calculate line path for a relation
  const getRelationPath = (relation: DataMeshRelation): string | null => {
    const pos1 = getElementPosition(
      relation.element1Source.file,
      relation.element1Source.column,
      relation.element1Source.rowIndex
    );
    const pos2 = getElementPosition(
      relation.element2Source.file,
      relation.element2Source.column,
      relation.element2Source.rowIndex
    );

    if (!pos1 || !pos2) return null;

    const x1 = pos1.x + pos1.width / 2;
    const y1 = pos1.y + pos1.height / 2;
    const x2 = pos2.x + pos2.width / 2;
    const y2 = pos2.y + pos2.height / 2;

    // Simple bezier curve
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} Q ${midX} ${y1} ${midX} ${(y1 + y2) / 2} T ${x2} ${y2}`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Summary */}
      <div className="rounded-lg border border-purple-200/50 bg-white/50 p-4 dark:border-purple-800/50 dark:bg-zinc-900/50">
        <h3 className="mb-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
          Summary
        </h3>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {dataMeshOutput.summary}
        </p>
      </div>

      {/* Visualization Container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-auto rounded-lg border border-purple-200/50 bg-gradient-to-br from-purple-50/30 to-purple-100/20 p-8 dark:border-purple-800/50 dark:from-purple-950/20 dark:to-purple-900/10"
        style={{ minHeight: "600px" }}
      >
        {/* SVG Overlay for Relations */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: "100%", height: "100%" }}
        >
          {dataMeshOutput.relations.map((relation, index) => {
            const path = getRelationPath(relation);
            if (!path) return null;

            const isSelected = selectedRelations.has(index);
            const isHovered = hoveredRelation === index;

            return (
              <g key={index} className="pointer-events-auto">
                <path
                  d={path}
                  fill="none"
                  stroke={
                    isSelected
                      ? "rgb(147, 51, 234)" // purple-600
                      : isHovered
                      ? "rgb(168, 85, 247)" // purple-400
                      : "rgb(192, 132, 252)" // purple-300
                  }
                  strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
                  strokeDasharray={isSelected ? "0" : "5,5"}
                  opacity={isSelected ? 1 : isHovered ? 0.8 : 0.5}
                  onMouseEnter={() => setHoveredRelation(index)}
                  onMouseLeave={() => setHoveredRelation(null)}
                  onClick={() => toggleRelation(index)}
                  className="cursor-pointer transition-all"
                />
                {/* Relation Note/Label */}
                {isHovered && (() => {
                  const pos1 = getElementPosition(
                    relation.element1Source.file,
                    relation.element1Source.column,
                    relation.element1Source.rowIndex
                  );
                  const pos2 = getElementPosition(
                    relation.element2Source.file,
                    relation.element2Source.column,
                    relation.element2Source.rowIndex
                  );
                  
                  if (!pos1 || !pos2) return null;
                  
                  const x = (pos1.x + pos2.x) / 2;
                  const y = Math.min(pos1.y, pos2.y) - 60;
                  
                  return (
                    <foreignObject
                      x={x}
                      y={y}
                      width="200"
                      height="100"
                    >
                      <div className="rounded-lg border border-purple-300 bg-white p-2 text-xs shadow-lg dark:border-purple-700 dark:bg-zinc-800">
                        <p className="font-medium text-purple-900 dark:text-purple-200">
                          {relation.element1} ↔ {relation.element2}
                        </p>
                        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                          {relation.relationExplanation}
                        </p>
                      </div>
                    </foreignObject>
                  );
                })()}
              </g>
            );
          })}
        </svg>

        {/* Hierarchical Structure */}
        <div className="relative z-10 flex flex-wrap gap-8">
          {files.map((file) => {
            const columns = getColumnsForFile(file);

            return (
              <div
                key={file}
                className="min-w-[250px] flex-shrink-0"
              >
                {/* File Level */}
                <div
                  data-element-id={getElementId(file)}
                  className="mb-4 flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 dark:border-blue-700 dark:bg-blue-900/30"
                >
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-blue-900 dark:text-blue-200">
                    {file}
                  </span>
                </div>

                {/* Columns Level */}
                <div className="ml-4 space-y-3">
                  {columns.map((column) => {
                    const rows = getRowsForFile(file).slice(0, 5);

                    return (
                      <div key={column} className="mb-4">
                        <div
                          data-element-id={getElementId(file, column)}
                          className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 dark:border-green-700 dark:bg-green-900/30"
                        >
                          <Columns className="h-3 w-3 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-green-900 dark:text-green-200">
                            {column}
                          </span>
                        </div>

                        {/* Rows Level */}
                        {rows.length > 0 && (
                          <div className="ml-4 mt-2 space-y-1">
                            {rows.map((rowIndex) => {
                              return (
                                <div
                                  key={rowIndex}
                                  data-element-id={getElementId(file, column, rowIndex)}
                                  className="flex items-center gap-2 rounded border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800/50"
                                >
                                  <FileCheck className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                                  <span className="text-zinc-700 dark:text-zinc-300">
                                    Row {rowIndex + 1}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relations List with Checkboxes */}
      <div className="rounded-lg border border-purple-200/50 bg-white/50 p-4 dark:border-purple-800/50 dark:bg-zinc-900/50">
        <h3 className="mb-4 text-sm font-semibold text-purple-700 dark:text-purple-300">
          Relations ({dataMeshOutput.relations.length})
        </h3>
        <div className="max-h-[400px] space-y-2 overflow-auto">
          {dataMeshOutput.relations.map((relation, index) => {
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
                onMouseEnter={() => setHoveredRelation(index)}
                onMouseLeave={() => setHoveredRelation(null)}
                onClick={() => toggleRelation(index)}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRelation(index);
                    }}
                    className="mt-0.5"
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
                          {relation.element1Source.column &&
                            ` / ${relation.element1Source.column}`}
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
                          {relation.element2Source.column &&
                            ` / ${relation.element2Source.column}`}
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
    </div>
  );
}

