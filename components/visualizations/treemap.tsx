"use client";


import { ResponsiveTreeMap } from "@nivo/treemap";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface TreemapVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function TreemapVisualization({ instruction, data }: TreemapVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return getErrorMessage("Treemap requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [categoryCol, valueCol] = columns;

  // Aggregate data
  const aggregated = data.rows.reduce<Record<string, number>>((acc, row) => {
    const category = String(row[categoryCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;
    acc[category] = (acc[category] || 0) + value;
    return acc;
  }, {});

  // Convert to hierarchical structure for Nivo
  const chartData = {
    name: "root",
    children: Object.entries(aggregated).map(([name, value]) => ({
      name,
      value: Math.max(value, 0), // Ensure non-negative
    })),
  };

  // Generate color scheme
  const getColor = (node: { data: { name: string } }) => {
    const hash = node.data.name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
  };

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveTreeMap
        data={chartData}
        identity="name"
        value="value"
        valueFormat=" >-.2f"
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        labelSkipSize={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.2]],
        }}
        parentLabelPosition="left"
        parentLabelTextColor={{
          from: "color",
          modifiers: [["darker", 2]],
        }}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.1]],
        }}
        colors={getColor}
        theme={nivoTheme}
        tooltip={({ node }) => (
          <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="font-semibold">{node.id}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Value: {node.formattedValue}
            </div>
          </div>
        )}
      />
    </div>
  );
}

