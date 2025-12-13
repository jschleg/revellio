"use client";

import { useState } from "react";
import type { CSVData } from "@/lib/types/data";
import { FileText, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileDisplayProps {
  csvData: CSVData[];
  className?: string;
}

export function FileDisplay({ csvData, className }: FileDisplayProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (csvData.length === 0) {
    return null;
  }

  const activeData = csvData[activeTab];

  return (
    <div className={cn("w-full", className)}>
      {/* Overview Section */}
      <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 mb-3">
          <Table2 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Datenübersicht
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Dateien:</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {csvData.length}
            </p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Gesamt Zeilen:</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {csvData.reduce((sum, data) => sum + data.metadata.rowCount, 0)}
            </p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Gesamt Spalten:</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {csvData.reduce((sum, data) => sum + data.metadata.columns.length, 0)}
            </p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Aktive Datei:</span>
            <p className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
              {activeData.fileName}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-2 overflow-x-auto">
          {csvData.map((data, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === index
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <FileText className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{data.fileName}</span>
              <span className="ml-1 rounded-full bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
                {data.metadata.rowCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Display */}
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                {activeData.columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                  >
                    <div className="flex flex-col">
                      <span>{column}</span>
                      <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        {activeData.metadata.columns[index]?.type || "unknown"}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {activeData.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeData.columns.length}
                    className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    Keine Daten vorhanden
                  </td>
                </tr>
              ) : (
                activeData.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    {activeData.columns.map((column, colIndex) => {
                      const value = row[column];
                      return (
                        <td
                          key={colIndex}
                          className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50"
                        >
                          <div className="max-w-[300px] truncate" title={String(value ?? "")}>
                            {value === null || value === undefined ? (
                              <span className="text-zinc-400 dark:text-zinc-600 italic">
                                —
                              </span>
                            ) : typeof value === "number" ? (
                              <span className="font-mono">
                                {value.toLocaleString("de-DE")}
                              </span>
                            ) : typeof value === "boolean" ? (
                              <span
                                className={cn(
                                  "rounded px-2 py-0.5 text-xs",
                                  value
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                                )}
                              >
                                {value ? "Ja" : "Nein"}
                              </span>
                            ) : (
                              String(value)
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Info */}
        <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Zeige {activeData.rows.length} von {activeData.metadata.rowCount} Zeilen
            {activeData.rows.length < activeData.metadata.rowCount &&
              ` (nur erste ${activeData.rows.length} Zeilen angezeigt)`}
          </p>
        </div>
      </div>
    </div>
  );
}

