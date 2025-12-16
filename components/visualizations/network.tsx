"use client";

import { ResponsiveNetwork } from "@nivo/network";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface NetworkVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function NetworkVisualization({ instruction, data }: NetworkVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">
          Network chart requires at least 2 columns (source, target)
        </p>
      </div>
    );
  }

  const [sourceCol, targetCol] = columns;

  // Build nodes and links
  const nodeSet = new Set<string>();
  const linkMap = new Map<string, number>();

  data.rows.forEach((row) => {
    const source = String(row[sourceCol] ?? "Unknown");
    const target = String(row[targetCol] ?? "Unknown");
    nodeSet.add(source);
    nodeSet.add(target);
    const key = `${source}->${target}`;
    linkMap.set(key, (linkMap.get(key) || 0) + 1);
  });

  const nodes = Array.from(nodeSet).map((id, index) => ({
    id,
    radius: 8 + Math.random() * 4,
  }));

  const links = Array.from(linkMap.entries()).map(([key, value]) => {
    const [source, target] = key.split("->");
    return { source, target, distance: 50, value };
  });

  return (
    <div className="h-[600px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveNetwork
        data={{ nodes, links }}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        linkDistance={(e) => e.distance}
        centeringStrength={0.3}
        repulsivity={6}
        nodeSize={(n) => n.radius}
        activeNodeSize={(n) => n.radius * 1.5}
        nodeColor={(e) => e.color}
        nodeBorderWidth={1}
        nodeBorderColor={{
          from: "color",
          modifiers: [["darker", 0.8]],
        }}
        linkThickness={(n) => 2 + n.value * 2}
        linkBlendMode="multiply"
        motionConfig="wobbly"
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

