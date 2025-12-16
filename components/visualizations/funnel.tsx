"use client";

import { ResponsiveFunnel } from "@nivo/funnel";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface FunnelVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function FunnelVisualization({ instruction, data }: FunnelVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">Funnel chart requires at least 2 columns</p>
      </div>
    );
  }

  const [labelCol, valueCol] = columns;

  // Aggregate data
  const aggregated = data.rows.reduce<Record<string, number>>((acc, row) => {
    const label = String(row[labelCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;
    acc[label] = (acc[label] || 0) + value;
    return acc;
  }, {});

  const chartData = Object.entries(aggregated)
    .map(([id, value]) => ({
      id,
      value: Math.max(value, 0),
      label: id,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveFunnel
        data={chartData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        valueFormat=" >-.0f"
        colors={{ scheme: "nivo" }}
        borderWidth={20}
        borderColor={{ from: "color", modifiers: [["darker", 3]] }}
        labelColor={{ from: "color", modifiers: [["darker", 3]] }}
        beforeSeparatorLength={100}
        beforeSeparatorOffset={20}
        afterSeparatorLength={100}
        afterSeparatorOffset={20}
        currentPartSizeExtension={10}
        currentBorderWidth={40}
        motionConfig="wobbly"
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

