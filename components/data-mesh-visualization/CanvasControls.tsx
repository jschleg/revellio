"use client";

import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface CanvasControlsProps {
  zoomLevel: number;
  isFullscreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
}

export function CanvasControls({
  zoomLevel,
  isFullscreen,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleFullscreen,
}: CanvasControlsProps) {
  return (
    <div className="mb-2 flex items-center justify-end gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-purple-200/50 bg-white/80 px-2 py-1 text-xs dark:border-purple-800/50 dark:bg-zinc-900/80">
        <span className="text-zinc-600 dark:text-zinc-400">Zoom:</span>
        <span className="font-mono font-medium text-purple-700 dark:text-purple-300">
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>
      <button
        onClick={onZoomOut}
        className="rounded-lg border border-purple-200/50 bg-white/80 p-1.5 text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-800/50 dark:bg-zinc-900/80 dark:text-purple-300 dark:hover:bg-purple-900/50"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        onClick={onZoomIn}
        className="rounded-lg border border-purple-200/50 bg-white/80 p-1.5 text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-800/50 dark:bg-zinc-900/80 dark:text-purple-300 dark:hover:bg-purple-900/50"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        onClick={onReset}
        className="rounded-lg border border-purple-200/50 bg-white/80 p-1.5 text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-800/50 dark:bg-zinc-900/80 dark:text-purple-300 dark:hover:bg-purple-900/50"
        title="Reset View"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <button
        onClick={onToggleFullscreen}
        className="rounded-lg border border-purple-200/50 bg-white/80 p-1.5 text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-800/50 dark:bg-zinc-900/80 dark:text-purple-300 dark:hover:bg-purple-900/50"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

