"use client";


import { ResponsiveHeatMap } from "@nivo/heatmap";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface HeatmapVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function HeatmapVisualization({ instruction, data }: HeatmapVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 3) {
    return getErrorMessage("Heatmap requires at least 3 columns (row, column, value)");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [rowCol, colCol, valueCol] = columns;

  // Aggregate data into matrix format
  const rowSet = new Set<string>();
  const colSet = new Set<string>();
  const valueMap = new Map<string, number>();

  data.rows.forEach((row) => {
    const rowKey = String(row[rowCol] ?? "Unknown");
    const colKey = String(row[colCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;

    rowSet.add(rowKey);
    colSet.add(colKey);
    const key = `${rowKey}::${colKey}`;
    valueMap.set(key, (valueMap.get(key) || 0) + value);
  });

  // Convert to Nivo format: array of objects with id and data properties
  const chartData = Array.from(rowSet).map((id) => {
    const data = Array.from(colSet).map((col) => {
      const key = `${id}::${col}`;
      return {
        x: col,
        y: valueMap.get(key) || 0,
      };
    });
    return {
      id,
      data,
    };
  });

  const keys = Array.from(colSet);

  return (
    <div className="h-[600px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveHeatMap
        data={chartData}
        margin={{ top: 100, right: 90, bottom: 60, left: 90 }}
        forceSquare={false}
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -90,
          legend: colCol,
          legendOffset: 72,
          legendPosition: "middle",
        }}
        axisRight={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: valueCol,
          legendPosition: "middle",
          legendOffset: 70,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: rowCol,
          legendPosition: "middle",
          legendOffset: -72,
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -90,
          legend: "",
          legendPosition: "middle",
          legendOffset: 0,
        }}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.4]],
        }}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.8]],
        }}
        colors={{
          type: "sequential",
          scheme: "blues",
          minValue: 0,
          maxValue: "auto" as any,
        }}
        theme={{
          background: "transparent",
          text: {
            fontSize: 11,
            fill: "currentColor",
            outlineWidth: 0,
            outlineColor: "transparent",
          },
          axis: {
            domain: {
              line: {
                stroke: "currentColor",
                strokeWidth: 1,
                strokeOpacity: 0.3,
              },
            },
            legend: {
              text: {
                fontSize: 12,
                fill: "currentColor",
                outlineWidth: 0,
                outlineColor: "transparent",
              },
            },
            ticks: {
              line: {
                stroke: "currentColor",
                strokeWidth: 1,
                strokeOpacity: 0.3,
              },
              text: {
                fontSize: 11,
                fill: "currentColor",
                outlineWidth: 0,
                outlineColor: "transparent",
              },
            },
          },
        }}
        tooltip={({ cell }) => (
          <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="font-semibold">
              {cell.serieId} × {cell.data.x}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Value: {cell.formattedValue}
            </div>
          </div>
        )}
      />
    </div>
  );
}

