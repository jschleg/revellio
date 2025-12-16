"use client";

import { ResponsiveChord } from "@nivo/chord";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface ChordVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function ChordVisualization({ instruction, data }: ChordVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 3) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">
          Chord chart requires at least 3 columns (source, target, value)
        </p>
      </div>
    );
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

  return (
    <div className="h-[600px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveChord
        matrix={matrix}
        keys={nodes}
        margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
        valueFormat=" >-.2f"
        padAngle={0.02}
        innerRadiusRatio={0.96}
        innerRadiusOffset={0.02}
        colors={{ scheme: "nivo" }}
        theme={{
          background: "transparent",
          text: {
            fontSize: 11,
            fill: "currentColor",
            outlineWidth: 0,
            outlineColor: "transparent",
          },
        }}
        tooltip={({ id, value, formattedValue }) => (
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

