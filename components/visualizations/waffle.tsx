"use client";

import { ResponsiveWaffle } from "@nivo/waffle";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface WaffleVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function WaffleVisualization({ instruction, data }: WaffleVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return getErrorMessage("Waffle chart requires at least 2 columns");
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

  const total = Object.values(aggregated).reduce((sum, val) => sum + val, 0);
  const chartData = Object.entries(aggregated).map(([id, value]) => ({
    id,
    label: id,
    value: Math.max(value, 0),
  }));

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveWaffle
        data={chartData}
        total={total}
        rows={18}
        columns={14}
        padding={1}
        valueFormat=" >-.0f"
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        colors={{ scheme: "nivo" }}
        borderRadius={3}
        borderWidth={1}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.3]],
        }}
        animate={true}
        legends={[
          {
            anchor: "top-left",
            direction: "column",
            justify: false,
            translateX: -10,
            translateY: 0,
            itemsSpacing: 4,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 20,
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "currentColor",
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        theme={nivoTheme}
      />
    </div>
  );
}

