"use client";

import { ResponsiveSankey } from "@nivo/sankey";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface SankeyVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function SankeyVisualization({ instruction, data }: SankeyVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 3) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">
          Sankey diagram requires at least 3 columns (source, target, value)
        </p>
      </div>
    );
  }

  const [sourceCol, targetCol, valueCol] = columns;

  // Aggregate flows
  const flowsMap = new Map<string, number>();
  const nodesSet = new Set<string>();

  data.rows.forEach((row) => {
    const source = String(row[sourceCol] ?? "Unknown");
    const target = String(row[targetCol] ?? "Unknown");
    const value = Number(row[valueCol]) || 0;

    if (value > 0) {
      nodesSet.add(source);
      nodesSet.add(target);
      const key = `${source}->${target}`;
      flowsMap.set(key, (flowsMap.get(key) || 0) + value);
    }
  });

  // Convert to Nivo format
  const nodes = Array.from(nodesSet).map((id) => ({ id }));
  const links = Array.from(flowsMap.entries()).map(([key, value]) => {
    const [source, target] = key.split("->");
    return { source, target, value };
  });

  const chartData = {
    nodes,
    links,
  };

  // Generate color scheme
  const getNodeColor = (node: { id: string }) => {
    const hash = node.id.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
  };

  return (
    <div className="h-[600px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveSankey
        data={chartData}
        margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
        align="justify"
        colors={getNodeColor}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderColor={{
          from: "color",
          modifiers: [["darker", 0.8]],
        }}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="vertical"
        labelPadding={16}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1]],
        }}
        theme={{
          background: "transparent",
          text: {
            fontSize: 11,
            fill: "currentColor",
            outlineWidth: 0,
            outlineColor: "transparent",
          },
        }}
        tooltip={({ link }) => (
          <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="font-semibold">
              {link.source.label} → {link.target.label}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Value: {link.value}
            </div>
          </div>
        )}
      />
    </div>
  );
}

