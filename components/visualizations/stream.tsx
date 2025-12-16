"use client";


import { ResponsiveStream } from "@nivo/stream";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface StreamVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function StreamVisualization({ instruction, data }: StreamVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return getErrorMessage("Stream chart requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [xCol, ...yCols] = columns;

  // Prepare data - Nivo stream expects array of { x, [key]: value }
  const chartData = data.rows.map((row) => {
    const entry: Record<string, unknown> = { x: String(row[xCol] ?? "") };
    yCols.forEach((col) => {
      entry[col] = Number(row[col]) || 0;
    });
    return entry;
  });

  const keys = yCols;

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveStream
        data={chartData as any}
        keys={keys}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: xCol,
          legendOffset: 36,
        }}
        axisLeft={null}
        offsetType="silhouette"
        colors={{ scheme: "nivo" }}
        fillOpacity={0.85}
        borderColor={{ theme: "background" }}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            translateX: 100,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: "currentColor",
            symbolSize: 12,
            symbolShape: "circle",
          },
        ]}
        theme={nivoTheme}
      />
    </div>
  );
}

