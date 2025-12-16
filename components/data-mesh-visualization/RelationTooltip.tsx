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
      className="pointer-events-none fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(10px, 10px)', // Small offset from cursor
      }}
    >
      <div
        className="rounded-xl border-2 border-purple-500 bg-white p-4 text-sm shadow-2xl dark:border-purple-400 dark:bg-zinc-900"
        style={{
          width: '320px',
          maxWidth: '90vw',
        }}
      >
        <div className="mb-2">
          <div className="mb-1 flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
            <p className="font-bold text-purple-900 dark:text-purple-200">
              {relation.title}
            </p>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {relation.elements.map((el, idx) => (
              <span key={idx}>
                {el.name}
                {idx < relation.elements.length - 1 && " ↔ "}
              </span>
            ))}
          </p>
        </div>
        <p className="text-zinc-700 dark:text-zinc-300">
          {relation.relationExplanation}
        </p>
      </div>
    </div>
  );
}

