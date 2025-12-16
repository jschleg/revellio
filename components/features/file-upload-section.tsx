"use client";

import { FileDrop } from "@/components/file-drop";

interface FileUploadSectionProps {
  onFilesSelected: (files: File[]) => Promise<void>;
}

export function FileUploadSection({ onFilesSelected }: FileUploadSectionProps) {
  return (
    <div className="mb-8 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
      <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Upload Files
      </h2>
      <FileDrop onFilesSelected={onFilesSelected} accept=".csv" maxFiles={10} />
    </div>
  );
}

