"use client";

import { ResponsivePie } from "@nivo/pie";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme, getColorFromString } from "./theme";
import { validateColumns, getErrorMessage, applyAggregation } from "./utils";

interface PieChartVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function PieChartVisualization({ instruction, data }: PieChartVisualizationProps) {
  const { columns = [] } = instruction.config;

  // Validation
  if (columns.length < 2) {
    return getErrorMessage("Pie chart requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [labelCol, valueCol] = columns;

  // Aggregate data
  const aggregated = data.rows.reduce<Record<string, number>>((acc, row) => {
    const label = String(row[labelCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;
    acc[label] = (acc[label] || 0) + value;
    return acc;
  }, {});

  const chartData = Object.entries(aggregated).map(([id, value]) => ({
    id,
    value: Math.max(value, 0),
    label: id,
  }));

  // Generate color scheme
  const getColor = (d: { id: string | number }) => getColorFromString(String(d.id));

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsivePie
        data={chartData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={2}
        cornerRadius={4}
        activeOuterRadiusOffset={8}
        colors={getColor}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.2]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="currentColor"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 2]],
        }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "currentColor",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "currentColor",
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
