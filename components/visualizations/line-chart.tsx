"use client";

import { ResponsiveLine } from "@nivo/line";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme, colorSchemes } from "./theme";
import { validateColumns, getErrorMessage, parseAndSortDates } from "./utils";

interface LineChartVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
  csvData: CSVData[];
}

export function LineChartVisualization({ instruction, data, csvData }: LineChartVisualizationProps) {
  // Use schema if available, otherwise fall back to config (backward compatibility)
  const schema = instruction.schema;
  let xCol: string;
  let yCols: string[];
  let seriesData: Array<{ id: string; data: Array<{ x: string; y: number }> }>;

  if (schema && schema.structure.xAxis && schema.structure.yAxis) {
    // Use schema to get exact data points from original files
    const xAxis = schema.structure.xAxis;
    const yAxis = schema.structure.yAxis;
    
    xCol = xAxis.column;
    yCols = yAxis.columns.map((col) => col.column);

    // Get the file data - prefer xAxis file, or use first available
    const primaryFile = csvData.find((d) => d.fileName === xAxis.file) || csvData[0];
    
    if (!primaryFile) {
      return getErrorMessage("No data file found");
    }

    // Prepare chart data - Nivo expects array of { id, data: [{ x, y }] }
    seriesData = yAxis.columns.map((yColConfig) => {
      const yCol = yColConfig.column;
      // Use data from the file specified in schema, or primary file
      const fileData = csvData.find((d) => d.fileName === yColConfig.file) || primaryFile;
      
      const dataPoints = fileData.rows
        .map((row) => {
          const x = row[xCol];
          const y = Number(row[yCol]);
          if (x === null || x === undefined || isNaN(y)) return null;
          return { x: String(x), y };
        })
        .filter((point): point is { x: string; y: number } => point !== null);

      return {
        id: yColConfig.label || yCol,
        data: parseAndSortDates(dataPoints),
      };
    });
  } else {
    // Fallback to config (backward compatibility)
    const { columns = [] } = instruction.config;

    if (columns.length < 2) {
      return getErrorMessage("Line chart requires at least 2 columns");
    }

    const validation = validateColumns(data, columns);
    if (!validation.valid) {
      return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
    }

    [xCol, ...yCols] = columns;

    // Prepare chart data - Nivo expects array of { id, data: [{ x, y }] }
    seriesData = yCols.map((yCol) => {
      const dataPoints = data.rows
        .map((row) => {
          const x = row[xCol];
          const y = Number(row[yCol]);
          if (x === null || x === undefined || isNaN(y)) return null;
          return { x: String(x), y };
        })
        .filter((point): point is { x: string; y: number } => point !== null);

      return {
        id: yCol,
        data: parseAndSortDates(dataPoints),
      };
    });
  }

  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveLine
        data={seriesData}
        margin={{ top: 50, right: 110, bottom: 80, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        yFormat=" >-.2f"
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: xCol,
          legendOffset: 60,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: yCols.length === 1 ? yCols[0] : "Value",
          legendOffset: -50,
          legendPosition: "middle",
        }}
        pointSize={8}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        colors={[...colorSchemes.categorical]}
        theme={nivoTheme}
      />
    </div>
  );
}
