"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { Metadata } from "@/lib/types/data";

interface MetadataDisplaySectionProps {
  metadata: Metadata[];
  isOpen: boolean;
  onToggle: () => void;
}

export function MetadataDisplaySection({
  metadata,
  isOpen,
  onToggle,
}: MetadataDisplaySectionProps) {
  if (metadata.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <CollapsibleSection
        title="Input: Metadata"
        isOpen={isOpen}
        onToggle={onToggle}
        badge={`${metadata.length} files`}
        className="rounded-lg border border-zinc-200/50 bg-card dark:border-zinc-800/50"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {metadata.map((meta, index) => (
            <div
              key={index}
              className="rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50"
            >
              <h3 className="mb-2 font-medium text-foreground">{meta.fileName}</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  {meta.rowCount} Rows
                </span>
                <span className="rounded bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  {meta.columns.length} Columns
                </span>
                <span className="rounded bg-purple-100 px-2 py-1 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  {Array.from(new Set(meta.columnTypes)).join(", ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}

