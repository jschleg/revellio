"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface PieChartVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function PieChartVisualization({ instruction, data }: PieChartVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return <div className="text-sm text-zinc-500">Pie chart requires at least 2 columns</div>;
  }

  const [labelCol, valueCol] = columns;

  // Aggregate data
  const aggregated = data.rows.reduce<Record<string, number>>((acc, row) => {
    const label = String(row[labelCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;
    const currentValue: number = acc[label] ?? 0;
    acc[label] = currentValue + value;
    return acc;
  }, {});

  const chartData = Object.entries(aggregated).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    "hsl(220, 70%, 50%)",
    "hsl(120, 70%, 50%)",
    "hsl(0, 70%, 50%)",
    "hsl(300, 70%, 50%)",
    "hsl(60, 70%, 50%)",
    "hsl(180, 70%, 50%)",
    "hsl(30, 70%, 50%)",
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

