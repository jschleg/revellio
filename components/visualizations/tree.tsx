"use client";

import { ResponsiveTreeMapHtml } from "@nivo/treemap";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface TreeVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function TreeVisualization({ instruction, data }: TreeVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return getErrorMessage("Tree visualization requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [hierarchyCol, valueCol] = columns;

  // Build hierarchical structure
  const aggregated = data.rows.reduce<Record<string, Record<string, number>>>((acc, row) => {
    const hierarchy = String(row[hierarchyCol] ?? "Unknown");
    const parts = hierarchy.split(/[\/\\\-_]/).filter(Boolean);
    if (parts.length === 0) return acc;

    const level1 = parts[0];
    const level2 = parts.length > 1 ? parts.slice(1).join(" ") : "Other";
    const value = Number(row[valueCol]) || 0;

    if (!acc[level1]) acc[level1] = {};
    acc[level1][level2] = (acc[level1][level2] || 0) + value;
    return acc;
  }, {});

  const chartData = {
    name: "root",
    children: Object.entries(aggregated).map(([name, children]) => ({
      name,
      children: Object.entries(children).map(([childName, value]) => ({
        name: childName,
        value: Math.max(value, 0),
      })),
    })),
  };

  return (
    <div className="h-[600px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveTreeMapHtml
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
        colors={{ scheme: "nivo" }}
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

