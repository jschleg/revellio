"use client";

import { FileText, Columns, FileCheck } from "lucide-react";
import type { CSVData } from "@/lib/types/data";

interface DataHierarchyProps {
  files: string[];
  csvData: CSVData[];
  editingConnectionPoint: number | null;
  onElementClick: (file: string, column?: string, rowIndex?: number, e?: React.MouseEvent) => void;
  getElementId: (file: string, column?: string, rowIndex?: number) => string;
  getColumnsForFile: (fileName: string) => string[];
  getRowsForFile: (fileName: string) => number[];
  getRowValue: (fileName: string, column: string, rowIndex: number) => string;
}

export function DataHierarchy({
  files,
  csvData,
  editingConnectionPoint,
  onElementClick,
  getElementId,
  getColumnsForFile,
  getRowsForFile,
  getRowValue,
}: DataHierarchyProps) {
  const selectionModeClass = editingConnectionPoint
    ? "cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
    : "";

  const handleElementInteraction = (
    file: string,
    column?: string,
    rowIndex?: number,
    e?: React.MouseEvent
  ) => {
    if (editingConnectionPoint) {
      onElementClick(file, column, rowIndex, e);
    } else if (e) {
      e.stopPropagation();
    }
  };

  return (
    <div className="relative z-10 flex flex-wrap gap-10 select-none">
      {files.map((file) => {
        const columns = getColumnsForFile(file);
        const baseWidth = 320;
        const calculatedWidth = Math.min(baseWidth + columns.length * 20, 600);

        return (
          <div
            key={file}
            className="flex-shrink-0"
            style={{
              minWidth: `${baseWidth}px`,
              width: `${calculatedWidth}px`,
              maxWidth: "600px",
            }}
          >
            {/* File Level */}
            <div
              data-element-id={getElementId(file)}
              className={`mb-5 flex items-center gap-3 rounded-xl border-2 border-blue-400 bg-blue-50 px-5 py-3 shadow-sm dark:border-blue-600 dark:bg-blue-900/40 ${selectionModeClass}`}
              onMouseDown={(e) => handleElementInteraction(file, undefined, undefined, e)}
              onClick={(e) => handleElementInteraction(file, undefined, undefined, e)}
            >
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-base font-semibold text-blue-900 dark:text-blue-200">
                {file}
              </span>
            </div>

            {/* Columns Level */}
            <div className="ml-5 space-y-4">
              {columns.map((column) => {
                const rows = getRowsForFile(file);

                return (
                  <div key={column} className="mb-5">
                    <div
                      data-element-id={getElementId(file, column)}
                      className={`flex items-center gap-2 rounded-lg border-2 border-green-400 bg-green-50 px-4 py-2.5 shadow-sm dark:border-green-600 dark:bg-green-900/40 ${selectionModeClass}`}
                      onMouseDown={(e) => handleElementInteraction(file, column, undefined, e)}
                      onClick={(e) => handleElementInteraction(file, column, undefined, e)}
                    >
                      <Columns className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-semibold text-green-900 dark:text-green-200">
                        {column}
                      </span>
                    </div>

                    {/* Rows Level */}
                    {rows.length > 0 && (
                      <div className="ml-5 mt-3 flex flex-wrap gap-2">
                        {rows.map((rowIndex) => {
                          const displayValue = getRowValue(file, column, rowIndex);
                          const truncatedValue =
                            displayValue.length > 40
                              ? displayValue.substring(0, 37) + "..."
                              : displayValue;

                          return (
                            <div
                              key={rowIndex}
                              data-element-id={getElementId(file, column, rowIndex)}
                              className={`relative flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-xs shadow-sm dark:border-zinc-600 dark:bg-zinc-800/60 ${selectionModeClass}`}
                              title={`Row ${rowIndex + 1}: ${displayValue || "(empty)"}`}
                              style={{ maxWidth: "200px" }}
                              onMouseDown={(e) => handleElementInteraction(file, column, rowIndex, e)}
                              onClick={(e) => handleElementInteraction(file, column, rowIndex, e)}
                            >
                              <FileCheck className="h-3 w-3 flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                              <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
                                {truncatedValue || "(empty)"}
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
  );
}

