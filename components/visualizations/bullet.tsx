"use client";

import { ResponsiveBullet } from "@nivo/bullet";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface BulletVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function BulletVisualization({ instruction, data }: BulletVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return getErrorMessage("Bullet chart requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [titleCol, valueCol] = columns;

  // Aggregate data
  const aggregated = data.rows.reduce<Record<string, number>>((acc, row) => {
    const title = String(row[titleCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;
    acc[title] = (acc[title] || 0) + value;
    return acc;
  }, {});

  const maxValue = Math.max(...Object.values(aggregated), 0);

  const chartData = Object.entries(aggregated).map(([id, value]) => ({
    id,
    ranges: [maxValue * 0.8, maxValue * 0.9, maxValue],
    measures: [value],
    markers: [maxValue * 0.95],
  }));

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveBullet
        data={chartData}
        margin={{ top: 50, right: 90, bottom: 50, left: 90 }}
        spacing={46}
        titleAlign="start"
        titleOffsetX={-70}
        measureSize={0.2}
        rangeColors="blues"
        measureColors="greens"
        markerColors="reds"
        theme={nivoTheme}
      />
    </div>
  );
}

