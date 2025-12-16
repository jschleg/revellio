"use client";

import { ResponsiveStream } from "@nivo/stream";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface StreamVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function StreamVisualization({ instruction, data }: StreamVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">Stream chart requires at least 2 columns</p>
      </div>
    );
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
        data={chartData}
        keys={keys}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          orient: "bottom",
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
        theme={{
          background: "transparent",
          text: {
            fontSize: 11,
            fill: "currentColor",
            outlineWidth: 0,
            outlineColor: "transparent",
          },
        }}
      />
    </div>
  );
}

