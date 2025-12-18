"use client";

import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="mb-6 rounded-xl border border-red-200/80 bg-red-50/80 backdrop-blur-sm p-4 text-red-800 shadow-sm dark:border-red-800/80 dark:bg-red-900/30 dark:text-red-200">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">Error</span>
      </div>
      <p className="mt-1">{error}</p>
    </div>
  );
}

