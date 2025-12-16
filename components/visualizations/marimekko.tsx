"use client";

import { ResponsiveMarimekko } from "@nivo/marimekko";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface MarimekkoVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function MarimekkoVisualization({ instruction, data }: MarimekkoVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 3) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">
          Marimekko chart requires at least 3 columns (id, dimension, value)
        </p>
      </div>
    );
  }

  const [idCol, dimensionCol, valueCol] = columns;

  // Aggregate data
  const aggregated = data.rows.reduce<Record<string, Record<string, number>>>((acc, row) => {
    const id = String(row[idCol] ?? "Unknown");
    const dimension = String(row[dimensionCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;

    if (!acc[id]) acc[id] = {};
    acc[id][dimension] = (acc[id][dimension] || 0) + value;
    return acc;
  }, {});

  const chartData = Object.entries(aggregated).map(([id, dimensions]) => ({
    id,
    ...dimensions,
  }));

  const dimensions = Array.from(
    new Set(data.rows.map((row) => String(row[dimensionCol] ?? "")))
  ).filter(Boolean);

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveMarimekko
        data={chartData}
        id="id"
        value="value"
        dimensions={dimensions.map((dim) => ({
          id: dim,
          value: dim,
        }))}
        margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
        axisTop={{
          orient: "top",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "",
          legendOffset: 36,
        }}
        axisRight={{
          orient: "right",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: valueCol,
          legendPosition: "middle",
          legendOffset: 70,
        }}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: idCol,
          legendPosition: "middle",
          legendOffset: 36,
        }}
        axisLeft={null}
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
      />
    </div>
  );
}

