"use client";

import type { DataMeshRelation } from "@/lib/types/data";

interface RelationTooltipProps {
  relation: DataMeshRelation;
  position: { x: number; y: number };
  color: string;
}

export function RelationTooltip({ relation, position, color }: RelationTooltipProps) {
  return (
    <div
      className="pointer-events-none absolute z-50"
      style={{
        left: `${position.x + 15}px`,
        top: `${position.y + 15}px`,
      }}
    >
      <div
        className="rounded-xl border-2 border-purple-500 bg-white p-4 text-sm shadow-2xl dark:border-purple-400 dark:bg-zinc-900"
        style={{
          width: '320px',
          maxWidth: '90vw',
        }}
      >
        <div className="mb-2 flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          ></div>
          <p className="font-bold text-purple-900 dark:text-purple-200">
            {relation.element1} ↔ {relation.element2}
          </p>
        </div>
        <p className="text-zinc-700 dark:text-zinc-300">
          {relation.relationExplanation}
        </p>
      </div>
    </div>
  );
}

