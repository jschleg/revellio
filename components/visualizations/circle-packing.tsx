"use client";

import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface CirclePackingVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function CirclePackingVisualization({
  instruction,
  data,
}: CirclePackingVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">
          Circle packing requires at least 2 columns (category, value)
        </p>
      </div>
    );
  }

  const [categoryCol, valueCol] = columns;

  // Aggregate by category
  const aggregated = data.rows.reduce<Record<string, number>>((acc, row) => {
    const category = String(row[categoryCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;
    acc[category] = (acc[category] || 0) + value;
    return acc;
  }, {});

  const chartData = {
    name: "root",
    children: Object.entries(aggregated).map(([name, value]) => ({
      name,
      value: Math.max(value, 0),
    })),
  };

  return (
    <div className="h-[600px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveCirclePacking
        data={chartData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        id="name"
        value="value"
        colors={{ scheme: "nivo" }}
        colorBy="id"
        childColor={{
          from: "color",
          modifiers: [["brighter", 0.4]],
        }}
        padding={4}
        enableLabels={true}
        labelsSkipRadius={10}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 2]],
        }}
        borderWidth={1}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.5]],
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

