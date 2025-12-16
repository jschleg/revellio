"use client";


import { ResponsiveChord } from "@nivo/chord";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface ChordVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function ChordVisualization({ instruction, data }: ChordVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 3) {
    return getErrorMessage("Chord chart requires at least 3 columns (source, target, value)");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [sourceCol, targetCol, valueCol] = columns;

  // Build matrix
  const nodeSet = new Set<string>();
  const matrixMap = new Map<string, number>();

  data.rows.forEach((row) => {
    const source = String(row[sourceCol] ?? "Unknown");
    const target = String(row[targetCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;
    nodeSet.add(source);
    nodeSet.add(target);
    const key = `${source}::${target}`;
    matrixMap.set(key, (matrixMap.get(key) || 0) + value);
  });

  const nodes = Array.from(nodeSet);
  const matrix = nodes.map((source) =>
    nodes.map((target) => matrixMap.get(`${source}::${target}`) || 0)
  );

  // Convert matrix to Nivo format: array of objects
  const chordData = nodes.map((node, i) => {
    const row: Record<string, number | string> = { id: node };
    nodes.forEach((target, j) => {
      row[target] = matrix[i][j];
    });
    return row;
  });

  return (
    <div className="h-[600px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveChord
        {...({
          matrix,
          keys: nodes,
          margin: { top: 60, right: 60, bottom: 60, left: 60 },
          valueFormat: " >-.2f",
          padAngle: 0.02,
          innerRadiusRatio: 0.96,
          innerRadiusOffset: 0.02,
          colors: { scheme: "nivo" },
          theme: nivoTheme,
        } as any)}
        tooltip={({ id, value, formattedValue }: any) => (
          <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="font-semibold">{id}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Value: {formattedValue}
            </div>
          </div>
        )}
      />
    </div>
  );
}

