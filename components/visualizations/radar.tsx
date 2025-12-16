"use client";

import { ResponsiveRadar } from "@nivo/radar";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface RadarVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function RadarVisualization({ instruction, data }: RadarVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">Radar chart requires at least 2 columns</p>
      </div>
    );
  }

  const [categoryCol, ...valueCols] = columns;

  // Aggregate data by category
  const aggregated = data.rows.reduce<Record<string, Record<string, number>>>((acc, row) => {
    const category = String(row[categoryCol] ?? "Unknown");
    if (!acc[category]) acc[category] = {};
    valueCols.forEach((col) => {
      const value = Number(row[col]) || 0;
      acc[category][col] = (acc[category][col] || 0) + value;
    });
    return acc;
  }, {});

  const chartData = Object.entries(aggregated).map(([key, values]) => ({
    category: key,
    ...values,
  }));

  const keys = valueCols;

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveRadar
        data={chartData}
        keys={keys}
        indexBy="category"
        valueFormat=" >-.2f"
        margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
        borderColor={{ from: "color" }}
        gridLabelOffset={36}
        dotSize={10}
        dotColor={{ theme: "background" }}
        dotBorderWidth={2}
        colors={{ scheme: "nivo" }}
        fillOpacity={0.25}
        blendMode="multiply"
        motionConfig="wobbly"
        legends={[
          {
            anchor: "top-left",
            direction: "column",
            translateX: -50,
            translateY: -40,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: "currentColor",
            symbolSize: 12,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "currentColor",
                },
              },
            ],
          },
        ]}
        theme={{
          background: "transparent",
          text: {
            fontSize: 11,
            fill: "currentColor",
            outlineWidth: 0,
            outlineColor: "transparent",
          },
        }}
      />
    </div>
  );
}

