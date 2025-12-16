"use client";

import { ResponsiveParallelCoordinates } from "@nivo/parallel-coordinates";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface ParallelCoordinatesVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function ParallelCoordinatesVisualization({
  instruction,
  data,
}: ParallelCoordinatesVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">
          Parallel coordinates requires at least 2 columns
        </p>
      </div>
    );
  }

  // Prepare data - all columns should be numeric
  const chartData = data.rows
    .map((row) => {
      const entry: Record<string, number> = {};
      let hasValidData = false;
      columns.forEach((col) => {
        const value = Number(row[col]);
        if (!isNaN(value)) {
          entry[col] = value;
          hasValidData = true;
        }
      });
      return hasValidData ? entry : null;
    })
    .filter((item): item is Record<string, number> => item !== null);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">No valid numeric data found</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveParallelCoordinates
        data={chartData}
        variables={columns.map((col) => ({
          key: col,
          type: "linear",
          min: "auto",
          max: "auto",
          ticksPosition: "before",
          legend: col,
          legendPosition: "start",
          legendOffset: 20,
        }))}
        margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
        curve="linear"
        colors={{ scheme: "nivo" }}
        strokeWidth={1}
        lineOpacity={0.3}
        axesPlan="foreground"
        axesTicksPosition="before"
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

