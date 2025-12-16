"use client";

import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface ScatterPlotVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function ScatterPlotVisualization({ instruction, data }: ScatterPlotVisualizationProps) {
  const { columns = [] } = instruction.config;

  // Validation
  if (columns.length < 2) {
    return getErrorMessage("Scatter plot requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [xCol, yCol] = columns;

  // Prepare chart data - Nivo expects array of { id, data: [{ x, y }] }
  const dataPoints = data.rows
    .map((row) => {
      const x = Number(row[xCol]);
      const y = Number(row[yCol]);
      if (isNaN(x) || isNaN(y)) return null;
      return { x, y };
    })
    .filter((point): point is { x: number; y: number } => point !== null);

  const chartData = [
    {
      id: `${xCol} vs ${yCol}`,
      data: dataPoints,
    },
  ];

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveScatterPlot
        data={chartData}
        margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
        xScale={{ type: "linear", min: "auto", max: "auto" }}
        xFormat=" >-.2f"
        yScale={{ type: "linear", min: "auto", max: "auto" }}
        yFormat=" >-.2f"
        blendMode="normal"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: xCol,
          legendPosition: "middle",
          legendOffset: 46,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: yCol,
          legendPosition: "middle",
          legendOffset: -60,
        }}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 130,
            translateY: 0,
            itemWidth: 100,
            itemHeight: 12,
            itemsSpacing: 5,
            itemDirection: "left-to-right",
            symbolSize: 12,
            symbolShape: "circle",
          },
        ]}
        colors={{ scheme: "nivo" }}
        theme={nivoTheme}
      />
    </div>
  );
}
