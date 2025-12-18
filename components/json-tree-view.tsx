"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface JsonTreeViewProps {
  data: unknown;
  level?: number;
  maxLevel?: number;
  path?: string;
}

export function JsonTreeView({ data, level = 0, maxLevel = 10, path = "" }: JsonTreeViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getKey = (suffix: string) => `${path}-${suffix}-${level}`;

  if (level > maxLevel) {
    return (
      <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
        [Max depth reached]
      </span>
    );
  }

  // Null
  if (data === null) {
    return (
      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">null</span>
    );
  }

  // Undefined
  if (data === undefined) {
    return (
      <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">undefined</span>
    );
  }

  // String
  if (typeof data === "string") {
    const str = String(data);
    const truncated = str.length > 150 ? str.slice(0, 150) + "..." : str;
    return (
      <span className="text-xs">
        <span className="text-green-600 dark:text-green-400">&quot;</span>
        <span className="font-mono text-green-700 dark:text-green-300">{truncated}</span>
        <span className="text-green-600 dark:text-green-400">&quot;</span>
      </span>
    );
  }

  // Number
  if (typeof data === "number") {
    return (
      <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400">
        {data}
      </span>
    );
  }

  // Boolean
  if (typeof data === "boolean") {
    return (
      <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
        {String(data)}
      </span>
    );
  }

  // Array
  if (Array.isArray(data)) {
    const key = getKey("array");
    const isExpanded = expanded[key] ?? level < 2; // Auto-expand first 2 levels

    return (
      <div className="group">
        <button
          onClick={() => toggle(key)}
          className="flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          type="button"
        >
          <span className="flex-shrink-0 text-zinc-400 dark:text-zinc-500">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">[</span>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Array ({data.length})
          </span>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">]</span>
        </button>
        {isExpanded && (
          <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
            {data.length === 0 ? (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">(empty)</span>
            ) : (
              data.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-xs font-mono font-medium text-zinc-400 dark:text-zinc-500">
                    {index}:
                  </span>
                  <div className="flex-1 min-w-0">
                    <JsonTreeView
                      data={item}
                      level={level + 1}
                      maxLevel={maxLevel}
                      path={`${path}[${index}]`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // Object
  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data);
    const key = getKey("object");
    const isExpanded = expanded[key] ?? level < 2; // Auto-expand first 2 levels

    return (
      <div className="group">
        <button
          onClick={() => toggle(key)}
          className="flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          type="button"
        >
          <span className="flex-shrink-0 text-zinc-400 dark:text-zinc-500">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{"{"}</span>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Object ({entries.length} {entries.length === 1 ? "key" : "keys"})
          </span>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{"}"}</span>
        </button>
        {isExpanded && (
          <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
            {entries.length === 0 ? (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">(empty)</span>
            ) : (
              entries.map(([key, value]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {key}:
                  </span>
                  <div className="flex-1 min-w-0">
                    <JsonTreeView
                      data={value}
                      level={level + 1}
                      maxLevel={maxLevel}
                      path={`${path}.${key}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback
  return (
    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{String(data)}</span>
  );
}
