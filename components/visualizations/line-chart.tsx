"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface LineChartVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function LineChartVisualization({ instruction, data }: LineChartVisualizationProps) {
  const { columns = [] } = instruction.config;

  // Prepare chart data
  const chartData = data.rows.map((row) => {
    const entry: Record<string, unknown> = {};
    columns.forEach((col) => {
      entry[col] = row[col] ?? null;
    });
    return entry;
  });

  const colors = [
    "hsl(220, 70%, 50%)",
    "hsl(120, 70%, 50%)",
    "hsl(0, 70%, 50%)",
    "hsl(300, 70%, 50%)",
    "hsl(60, 70%, 50%)",
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={columns[0]} />
        <YAxis />
        <Tooltip />
        <Legend />
        {columns.slice(1).map((col, idx) => (
          <Line
            key={idx}
            type="monotone"
            dataKey={col}
            stroke={colors[idx % colors.length]}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

