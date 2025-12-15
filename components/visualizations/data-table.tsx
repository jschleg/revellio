"use client";

import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface DataTableVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function DataTableVisualization({ instruction, data }: DataTableVisualizationProps) {
  const { columns = [] } = instruction.config;
  const displayColumns = columns.length > 0 ? columns : data.columns;
  const displayRows = data.rows.slice(0, 100); // Limit to 100 rows for performance

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            {displayColumns.map((col) => (
              <th
                key={col}
                className="px-4 py-2 text-left font-semibold text-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            >
              {displayColumns.map((col) => (
                <td key={col} className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
                  {String(row[col] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.rows.length > 100 && (
        <p className="mt-2 text-xs text-zinc-500">
          Zeige 100 von {data.rows.length} Zeilen
        </p>
      )}
    </div>
  );
}

