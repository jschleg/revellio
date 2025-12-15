"use client";

import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface AggregatedOverviewVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function AggregatedOverviewVisualization({
  instruction,
  data,
}: AggregatedOverviewVisualizationProps) {
  const { columns = [], aggregation } = instruction.config;

  // Calculate basic statistics
  const numericColumns = columns.filter((col) => {
    const sample = data.rows.slice(0, 10).map((row) => row[col]);
    return sample.some((val) => typeof val === "number");
  });

  const stats = numericColumns.map((col) => {
    const values = data.rows
      .map((row) => Number(row[col]))
      .filter((val) => !isNaN(val));
    
    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      column: col,
      sum: aggregation === "sum" ? sum : undefined,
      avg: aggregation === "avg" ? avg : undefined,
      min,
      max,
      count: values.length,
    };
  }).filter((stat): stat is NonNullable<typeof stat> => stat !== null);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-zinc-200/50 bg-card p-4 dark:border-zinc-800/50"
        >
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-foreground">{stat.column}</h4>
          </div>
          <div className="space-y-1 text-sm">
            {stat.sum !== undefined && (
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Summe:</span>
                <span className="font-medium">{stat.sum.toLocaleString()}</span>
              </div>
            )}
            {stat.avg !== undefined && (
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Durchschnitt:</span>
                <span className="font-medium">{stat.avg.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Min:</span>
              <span className="font-medium">{stat.min.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Max:</span>
              <span className="font-medium">{stat.max.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Anzahl:</span>
              <span className="font-medium">{stat.count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

