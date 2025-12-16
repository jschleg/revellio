"use client";

import { ResponsiveBoxPlot } from "@nivo/boxplot";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface BoxPlotVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function BoxPlotVisualization({ instruction, data }: BoxPlotVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return getErrorMessage("Box plot requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [groupCol, valueCol] = columns;

  // Calculate box plot statistics for each group
  const groupData = new Map<string, number[]>();

  data.rows.forEach((row) => {
    const group = String(row[groupCol] ?? "Unknown");
    const value = Number(row[valueCol]);
    if (!isNaN(value)) {
      if (!groupData.has(group)) {
        groupData.set(group, []);
      }
      groupData.get(group)!.push(value);
    }
  });

  const calculateBoxPlot = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const medianIndex = Math.floor(sorted.length * 0.5);
    const q3Index = Math.floor(sorted.length * 0.75);

    return {
      group: "",
      subGroup: "",
      q1: sorted[q1Index] || 0,
      q2: sorted[medianIndex] || 0,
      q3: sorted[q3Index] || 0,
      min: sorted[0] || 0,
      max: sorted[sorted.length - 1] || 0,
    };
  };

  const chartData = Array.from(groupData.entries()).map(([group, values]) => ({
    ...calculateBoxPlot(values),
    group,
    subGroup: group,
  }));

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveBoxPlot
        data={chartData}
        groupBy="group"
        subGroupBy="subGroup"
        value="value"
        margin={{ top: 60, right: 140, bottom: 60, left: 60 }}
        padding={0.12}
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "",
          legendOffset: 36,
        }}
        axisRight={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "",
          legendOffset: 0,
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: groupCol,
          legendPosition: "middle",
          legendOffset: 46,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: valueCol,
          legendPosition: "middle",
          legendOffset: -50,
        }}
        colors={{ scheme: "nivo" }}
        borderRadius={2}
        borderWidth={2}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.3]],
        }}
        medianWidth={2}
        medianColor={{
          from: "color",
          modifiers: [["darker", 0.5]],
        }}
        whiskerEndSize={0.6}
        whiskerColor={{
          from: "color",
          modifiers: [["darker", 0.3]],
        }}
        theme={nivoTheme as any}
      />
    </div>
  );
}

