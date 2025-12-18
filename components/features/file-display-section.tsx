"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { FileDisplay } from "@/components/file-display";
import type { CSVData } from "@/lib/types/data";

interface FileDisplaySectionProps {
  csvData: CSVData[];
  isOpen: boolean;
  onToggle: () => void;
}

export function FileDisplaySection({
  csvData,
  isOpen,
  onToggle,
}: FileDisplaySectionProps) {
  if (csvData.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <CollapsibleSection
        title="File Data Tables"
        isOpen={isOpen}
        onToggle={onToggle}
        badge={`${csvData.length} file${csvData.length !== 1 ? "s" : ""}`}
      >
        <FileDisplay csvData={csvData} />
      </CollapsibleSection>
    </div>
  );
}

