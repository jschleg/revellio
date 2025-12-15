"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface JsonTreeViewProps {
  data: unknown;
  level?: number;
  maxLevel?: number;
}

export function JsonTreeView({ data, level = 0, maxLevel = 10 }: JsonTreeViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const indent = level * 20;

  if (level > maxLevel) {
    return (
      <span className="text-xs text-zinc-500 dark:text-zinc-400">[Max depth reached]</span>
    );
  }

  if (data === null) {
    return <span className="text-xs text-purple-600 dark:text-purple-400">null</span>;
  }

  if (data === undefined) {
    return <span className="text-xs text-zinc-500 dark:text-zinc-400">undefined</span>;
  }

  if (typeof data === "string") {
    return (
      <span className="text-xs text-green-600 dark:text-green-400">
        "{String(data).slice(0, 100)}
        {String(data).length > 100 ? "..." : ""}"
      </span>
    );
  }

  if (typeof data === "number") {
    return <span className="text-xs text-blue-600 dark:text-blue-400">{data}</span>;
  }

  if (typeof data === "boolean") {
    return (
      <span className="text-xs text-orange-600 dark:text-orange-400">{String(data)}</span>
    );
  }

  if (Array.isArray(data)) {
    const key = `array-${level}`;
    const isExpanded = expanded[key];

    return (
      <div className="select-none">
        <button
          onClick={() => toggle(key)}
          className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400"
          style={{ paddingLeft: `${indent}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Array ({data.length})
          </span>
        </button>
        {isExpanded && (
          <div className="ml-2">
            {data.map((item, index) => (
              <div key={index} className="py-0.5">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">[{index}]</span>{" "}
                <JsonTreeView data={item} level={level + 1} maxLevel={maxLevel} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data);
    const key = `object-${level}`;
    const isExpanded = expanded[key];

    return (
      <div className="select-none">
        <button
          onClick={() => toggle(key)}
          className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400"
          style={{ paddingLeft: `${indent}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Object ({entries.length} keys)
          </span>
        </button>
        {isExpanded && (
          <div className="ml-2">
            {entries.map(([key, value]) => (
              <div key={key} className="py-0.5">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {key}:
                </span>{" "}
                <JsonTreeView data={value} level={level + 1} maxLevel={maxLevel} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span className="text-xs text-zinc-500 dark:text-zinc-400">{String(data)}</span>;
}

