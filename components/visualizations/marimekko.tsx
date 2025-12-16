"use client";

import { ResponsiveMarimekko } from "@nivo/marimekko";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface MarimekkoVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function MarimekkoVisualization({ instruction, data }: MarimekkoVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 3) {
    return getErrorMessage("Marimekko chart requires at least 3 columns (id, dimension, value)");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
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
          legend: valueCol,
          legendPosition: "middle",
          legendOffset: 70,
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: idCol,
          legendPosition: "middle",
          legendOffset: 36,
        }}
        axisLeft={null}
        colors={{ scheme: "nivo" }}
        theme={nivoTheme}
      />
    </div>
  );
}

