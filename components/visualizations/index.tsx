"use client";

import type { CSVData, VisualizationInstruction, Relation } from "@/lib/types/data";
import { BarChartVisualization } from "./bar-chart";
import { LineChartVisualization } from "./line-chart";
import { PieChartVisualization } from "./pie-chart";
import { ScatterPlotVisualization } from "./scatter-plot";
import { DataTableVisualization } from "./data-table";
import { RelationalViewVisualization } from "./relational-view";
import { AggregatedOverviewVisualization } from "./aggregated-overview";
import { TreemapVisualization } from "./treemap";
import { SankeyVisualization } from "./sankey";
import { HeatmapVisualization } from "./heatmap";
import { RadarVisualization } from "./radar";
import { StreamVisualization } from "./stream";
import { SunburstVisualization } from "./sunburst";
import { BumpVisualization } from "./bump";
import { ParallelCoordinatesVisualization } from "./parallel-coordinates";
import { NetworkVisualization } from "./network";
import { CalendarVisualization } from "./calendar";
import { ChordVisualization } from "./chord";
import { CirclePackingVisualization } from "./circle-packing";
import { FunnelVisualization } from "./funnel";
import { MarimekkoVisualization } from "./marimekko";
import { SwarmPlotVisualization } from "./swarmplot";
import { BoxPlotVisualization } from "./boxplot";
import { BulletVisualization } from "./bullet";
import { IcicleVisualization } from "./icicle";
import { RadialBarVisualization } from "./radial-bar";
import { TreeVisualization } from "./tree";
import { WaffleVisualization } from "./waffle";

interface DynamicVisualizationProps {
  instruction: VisualizationInstruction;
  csvData: CSVData[];
  relations?: Relation[];
}

/**
 * Dynamic visualization component that renders the appropriate
 * visualization based on the AI instruction type
 */
export function DynamicVisualization({
  instruction,
  csvData,
  relations = [],
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
          Datenquelle "{instruction.config.dataSource}" nicht gefunden
        </p>
      </div>
    );
  }

  // Map visualization types to components
  switch (instruction.type) {
    case "bar-chart":
      return <BarChartVisualization instruction={instruction} data={data} />;
    
    case "line-chart":
      return <LineChartVisualization instruction={instruction} data={data} />;
    
    case "pie-chart":
      return <PieChartVisualization instruction={instruction} data={data} />;
    
    case "scatter-plot":
      return <ScatterPlotVisualization instruction={instruction} data={data} />;
    
    case "table":
      return <DataTableVisualization instruction={instruction} data={data} />;
    
    case "relational-view":
      return (
        <RelationalViewVisualization
          instruction={instruction}
          data={csvData}
          relations={relations}
        />
      );
    
    case "aggregated-overview":
      return <AggregatedOverviewVisualization instruction={instruction} data={data} />;
    
    case "treemap":
      return <TreemapVisualization instruction={instruction} data={data} />;
    
    case "sankey":
      return <SankeyVisualization instruction={instruction} data={data} />;
    
    case "heatmap":
      return <HeatmapVisualization instruction={instruction} data={data} />;
    
    case "radar":
      return <RadarVisualization instruction={instruction} data={data} />;
    
    case "stream":
      return <StreamVisualization instruction={instruction} data={data} />;
    
    case "sunburst":
      return <SunburstVisualization instruction={instruction} data={data} />;
    
    case "bump":
      return <BumpVisualization instruction={instruction} data={data} />;
    
    case "parallel-coordinates":
      return <ParallelCoordinatesVisualization instruction={instruction} data={data} />;
    
    case "network":
      return <NetworkVisualization instruction={instruction} data={data} />;
    
    case "calendar":
      return <CalendarVisualization instruction={instruction} data={data} />;
    
    case "chord":
      return <ChordVisualization instruction={instruction} data={data} />;
    
    case "circle-packing":
      return <CirclePackingVisualization instruction={instruction} data={data} />;
    
    case "funnel":
      return <FunnelVisualization instruction={instruction} data={data} />;
    
    case "marimekko":
      return <MarimekkoVisualization instruction={instruction} data={data} />;
    
    case "swarmplot":
      return <SwarmPlotVisualization instruction={instruction} data={data} />;
    
    case "boxplot":
      return <BoxPlotVisualization instruction={instruction} data={data} />;
    
    case "bullet":
      return <BulletVisualization instruction={instruction} data={data} />;
    
    case "icicle":
      return <IcicleVisualization instruction={instruction} data={data} />;
    
    case "radial-bar":
      return <RadialBarVisualization instruction={instruction} data={data} />;
    
    case "tree":
      return <TreeVisualization instruction={instruction} data={data} />;
    
    case "waffle":
      return <WaffleVisualization instruction={instruction} data={data} />;
    
    default:
      return (
        <div className="rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Unbekannter Visualisierungstyp: {instruction.type}
          </p>
        </div>
      );
  }
}

