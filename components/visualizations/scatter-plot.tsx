"use client";

import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage, extractDataFromSchema, getDataForFileColumn } from "./utils";

interface ScatterPlotVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
  csvData: CSVData[];
}

export function ScatterPlotVisualization({ instruction, data, csvData }: ScatterPlotVisualizationProps) {
  // Use schema if available, otherwise fall back to config (backward compatibility)
  const schema = instruction.schema;
  let xCol: string;
  let yCol: string;
  let dataPoints: Array<{ x: number; y: number }>;

  if (schema && schema.structure.xAxis && schema.structure.yAxis && schema.structure.yAxis.columns.length > 0) {
    // Use schema to get exact data points from original files
    const xAxis = schema.structure.xAxis;
    const yAxis = schema.structure.yAxis.columns[0];
    
    xCol = xAxis.column;
    yCol = yAxis.column;

    // Get data from the exact files specified in schema
    const xData = getDataForFileColumn(xAxis.file, xAxis.column, csvData);
    const yData = getDataForFileColumn(yAxis.file, yAxis.column, csvData);

    // Match rows by index (assuming same file or matching row indices)
    // If from same file, use that file's rows directly
    if (xAxis.file === yAxis.file) {
      const fileData = csvData.find((d) => d.fileName === xAxis.file);
      if (fileData) {
        dataPoints = fileData.rows
          .map((row) => {
            const x = Number(row[xCol]);
            const y = Number(row[yCol]);
            if (isNaN(x) || isNaN(y)) return null;
            return { x, y };
          })
          .filter((point): point is { x: number; y: number } => point !== null);
      } else {
        dataPoints = [];
      }
    } else {
      // Different files - match by row index
      const minLength = Math.min(xData.values.length, yData.values.length);
      dataPoints = Array.from({ length: minLength }, (_, i) => {
        const x = Number(xData.values[i]);
        const y = Number(yData.values[i]);
        if (isNaN(x) || isNaN(y)) return null;
        return { x, y };
      }).filter((point): point is { x: number; y: number } => point !== null);
    }
  } else {
    // Fallback to config (backward compatibility)
    const { columns = [] } = instruction.config;

    if (columns.length < 2) {
      return getErrorMessage("Scatter plot requires at least 2 columns");
    }

    const validation = validateColumns(data, columns);
    if (!validation.valid) {
      return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
    }

    [xCol, yCol] = columns;

    dataPoints = data.rows
      .map((row) => {
        const x = Number(row[xCol]);
        const y = Number(row[yCol]);
        if (isNaN(x) || isNaN(y)) return null;
        return { x, y };
      })
      .filter((point): point is { x: number; y: number } => point !== null);
  }

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
