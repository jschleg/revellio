"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface ScatterPlotVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function ScatterPlotVisualization({ instruction, data }: ScatterPlotVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return <div className="text-sm text-zinc-500">Scatter plot requires at least 2 columns</div>;
  }

  const [xCol, yCol] = columns;

  // Prepare chart data
  const chartData = data.rows
    .map((row) => {
      const x = Number(row[xCol]);
      const y = Number(row[yCol]);
      if (isNaN(x) || isNaN(y)) return null;
      return { x, y, name: `${row[xCol]}, ${row[yCol]}` };
    })
    .filter((item): item is { x: number; y: number; name: string } => item !== null);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="x" name={xCol} />
        <YAxis type="number" dataKey="y" name={yCol} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter dataKey="y" data={chartData} fill="hsl(220, 70%, 50%)" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

