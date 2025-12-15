"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface BarChartVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function BarChartVisualization({ instruction, data }: BarChartVisualizationProps) {
  const { columns = [], aggregation } = instruction.config;

  // Prepare chart data
  const chartData = data.rows.map((row) => {
    const entry: Record<string, unknown> = {};
    columns.forEach((col) => {
      entry[col] = row[col] ?? null;
    });
    return entry;
  });

  // Apply aggregation if specified
  let processedData = chartData;
  if (aggregation && columns.length >= 2) {
    const [categoryCol, valueCol] = columns;
    const grouped = chartData.reduce((acc, row) => {
      const key = String(row[categoryCol] ?? "Unknown");
      const value = Number(row[valueCol]) || 0;
      acc[key] = (acc[key] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    processedData = Object.entries(grouped).map(([key, value]) => ({
      [categoryCol]: key,
      [valueCol]: value,
    }));
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={columns[0]} />
        <YAxis />
        <Tooltip />
        <Legend />
        {columns.slice(1).map((col, idx) => (
          <Bar key={idx} dataKey={col} fill={`hsl(${(idx * 60) % 360}, 70%, 50%)`} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

