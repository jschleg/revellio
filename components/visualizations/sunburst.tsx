"use client";


import { ResponsiveSunburst } from "@nivo/sunburst";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface SunburstVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function SunburstVisualization({ instruction, data }: SunburstVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return getErrorMessage("Sunburst chart requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [hierarchyCol, valueCol] = columns;

  // Build hierarchical structure
  // For simplicity, we'll create a two-level hierarchy
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
      <ResponsiveSunburst
        data={chartData}
        margin={{ top: 40, right: 20, bottom: 20, left: 20 }}
        id="name"
        value="value"
        cornerRadius={2}
        borderColor={{ theme: "background" }}
        colors={{ scheme: "nivo" }}
        theme={nivoTheme}
        tooltip={({ id, value, formattedValue }) => (
          <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="font-semibold">{id}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Value: {formattedValue}
            </div>
          </div>
        )}
      />
    </div>
  );
}

