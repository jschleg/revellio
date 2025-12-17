"use client";

import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { BarChartVisualization } from "./bar-chart";
import { LineChartVisualization } from "./line-chart";
import { PieChartVisualization } from "./pie-chart";
import { ScatterPlotVisualization } from "./scatter-plot";
import { DataTableVisualization } from "./data-table";

interface DynamicVisualizationProps {
  instruction: VisualizationInstruction;
  csvData: CSVData[];
}

/**
 * Dynamic visualization component that renders the appropriate
 * visualization based on the AI instruction type
 */
export function DynamicVisualization({
  instruction,
  csvData,
}: DynamicVisualizationProps) {
  // Get the data source for this visualization
  const getDataForVisualization = (): CSVData | null => {
    if (instruction.config.dataSource === "combined") {
      // For combined visualizations, return first file for now
      // TODO: Implement proper data merging
      return csvData[0] || null;
    }
    return csvData.find((data) => data.fileName === instruction.config.dataSource) || null;
  };

  const data = getDataForVisualization();

  if (!data) {
    return (
      <div className="rounded-lg border border-yellow-200/50 bg-yellow-50/50 p-4 dark:border-yellow-800/50 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Datenquelle &quot;{instruction.config.dataSource}&quot; nicht gefunden
        </p>
      </div>
    );
  }

  // Map visualization types to components (only 5 supported types)
  switch (instruction.type) {
    case "bar-chart":
      return <BarChartVisualization instruction={instruction} data={data} csvData={csvData} />;
    
    case "line-chart":
      return <LineChartVisualization instruction={instruction} data={data} csvData={csvData} />;
    
    case "pie-chart":
      return <PieChartVisualization instruction={instruction} data={data} csvData={csvData} />;
    
    case "scatter-plot":
      return <ScatterPlotVisualization instruction={instruction} data={data} csvData={csvData} />;
    
    case "table":
      return <DataTableVisualization instruction={instruction} data={data} csvData={csvData} />;
    
    default:
      return (
        <div className="rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Nicht unterstützter Visualisierungstyp: {instruction.type}. Unterstützte Typen: bar-chart, line-chart, pie-chart, scatter-plot, table
          </p>
        </div>
      );
  }
}

