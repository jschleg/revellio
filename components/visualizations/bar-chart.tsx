"use client";

import { ResponsiveBar } from "@nivo/bar";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme, getColorFromString } from "./theme";
import { applyAggregation, validateColumns, getErrorMessage } from "./utils";

interface BarChartVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function BarChartVisualization({ instruction, data }: BarChartVisualizationProps) {
  const { columns = [], aggregation } = instruction.config;

  // Validation
  if (columns.length < 2) {
    return getErrorMessage("Bar chart requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  // Apply aggregation
  const processedData = applyAggregation(data.rows, columns, aggregation ?? null);

  const indexBy = columns[0];
  const keys = columns.slice(1);

  // Generate color scheme
  const getColor = (bar: { data: Record<string, unknown> }) => {
    return getColorFromString(String(bar.data[indexBy]));
  };

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveBar
        data={processedData as Record<string, string | number>[]}
        keys={keys}
        indexBy={indexBy}
        margin={{ top: 50, right: 130, bottom: 80, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={getColor}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: indexBy,
          legendPosition: "middle",
          legendOffset: 60,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: keys.length === 1 ? keys[0] : "Value",
          legendPosition: "middle",
          legendOffset: -50,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        role="application"
        ariaLabel={instruction.reasoning || "Bar chart visualization"}
        barAriaLabel={(e) => `${e.id}: ${e.formattedValue} in ${indexBy}: ${e.indexValue}`}
        theme={nivoTheme}
      />
    </div>
  );
}
