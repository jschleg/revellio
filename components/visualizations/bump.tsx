"use client";

import { ResponsiveBump } from "@nivo/bump";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface BumpVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function BumpVisualization({ instruction, data }: BumpVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 3) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">
          Bump chart requires at least 3 columns (x, series, value)
        </p>
      </div>
    );
  }

  const [xCol, seriesCol, valueCol] = columns;

  // Group data by series
  const seriesMap = new Map<string, Array<{ x: string; y: number }>>();

  data.rows.forEach((row) => {
    const x = String(row[xCol] ?? "");
    const series = String(row[seriesCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;

    if (!seriesMap.has(series)) {
      seriesMap.set(series, []);
    }
    seriesMap.get(series)!.push({ x, y: value });
  });

  const chartData = Array.from(seriesMap.entries()).map(([id, data]) => ({
    id,
    data: data.sort((a, b) => a.x.localeCompare(b.x)),
  }));

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveBump
        data={chartData}
        margin={{ top: 40, right: 100, bottom: 40, left: 60 }}
        colors={{ scheme: "nivo" }}
        lineWidth={3}
        activeLineWidth={6}
        inactiveLineWidth={3}
        inactiveOpacity={0.15}
        pointSize={10}
        activePointSize={16}
        inactivePointSize={0}
        pointColor={{ theme: "background" }}
        pointBorderWidth={3}
        pointBorderColor={{ from: "serie.color" }}
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "",
          legendPosition: "middle",
          legendOffset: -36,
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: xCol,
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Ranking",
          legendPosition: "middle",
          legendOffset: -40,
        }}
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

