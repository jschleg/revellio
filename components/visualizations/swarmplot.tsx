"use client";

import { ResponsiveSwarmPlot } from "@nivo/swarmplot";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface SwarmPlotVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function SwarmPlotVisualization({ instruction, data }: SwarmPlotVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">Swarm plot requires at least 2 columns</p>
      </div>
    );
  }

  const [groupCol, valueCol] = columns;

  // Prepare data
  const chartData = data.rows
    .map((row) => {
      const group = String(row[groupCol] ?? "Unknown");
      const value = Number(row[valueCol]);
      if (isNaN(value)) return null;
      return {
        id: `${group}-${Math.random()}`,
        group,
        value,
      };
    })
    .filter((item): item is { id: string; group: string; value: number } => item !== null);

  const groups = Array.from(new Set(chartData.map((d) => d.group)));

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveSwarmPlot
        data={chartData}
        groups={groups}
        identity="id"
        value="value"
        valueFormat=" >-.2f"
        valueScale={{ type: "linear", min: "auto", max: "auto", reverse: false }}
        size={{
          key: "value",
          values: [4, 20],
          sizes: [6, 20],
        }}
        forceStrength={4}
        simulationIterations={100}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.6], ["opacity", 0.5]],
        }}
        margin={{ top: 80, right: 100, bottom: 80, left: 100 }}
        axisTop={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: valueCol,
          legendPosition: "middle",
          legendOffset: -46,
        }}
        axisRight={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Groups",
          legendPosition: "middle",
          legendOffset: 76,
        }}
        axisBottom={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: valueCol,
          legendPosition: "middle",
          legendOffset: 46,
        }}
        axisLeft={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Groups",
          legendPosition: "middle",
          legendOffset: -76,
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

