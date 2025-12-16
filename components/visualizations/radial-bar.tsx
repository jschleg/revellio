"use client";

import { ResponsiveRadialBar } from "@nivo/radial-bar";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface RadialBarVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function RadialBarVisualization({ instruction, data }: RadialBarVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return getErrorMessage("Radial bar chart requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [categoryCol, valueCol] = columns;

  // Aggregate data
  const aggregated = data.rows.reduce<Record<string, number>>((acc, row) => {
    const category = String(row[categoryCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;
    acc[category] = (acc[category] || 0) + value;
    return acc;
  }, {});

  const chartData = Object.entries(aggregated).map(([id, value]) => ({
    id,
    data: [{ x: id, y: Math.max(value, 0) }],
  }));

  return (
    <div className="h-[600px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveRadialBar
        data={chartData}
        valueFormat=" >-.2f"
        padding={0.4}
        cornerRadius={2}
        margin={{ top: 40, right: 120, bottom: 40, left: 40 }}
        radialAxisStart={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        circularAxisOuter={{ tickSize: 12, tickPadding: 12, tickRotation: 0 }}
        colors={{ scheme: "nivo" }}
        fill={[
          {
            match: {
              id: "A",
            },
            id: "dots",
          },
        ]}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        theme={nivoTheme}
      />
    </div>
  );
}

