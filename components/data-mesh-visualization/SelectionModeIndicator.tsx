"use client";

interface SelectionModeIndicatorProps {
  connectionPoint: "element1" | "element2";
  onCancel: () => void;
}

export function SelectionModeIndicator({ connectionPoint, onCancel }: SelectionModeIndicatorProps) {
  return (
    <div className="fixed top-4 left-1/2 z-[102] -translate-x-1/2 rounded-lg border-2 border-purple-500 bg-purple-600 px-6 py-3 text-sm font-medium text-white shadow-2xl dark:bg-purple-500">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
        <span>
          Selection Mode: Click on any element to set the{" "}
          {connectionPoint === "element1" ? "source" : "target"} connection point
        </span>
        <button
          onClick={onCancel}
          className="ml-2 rounded px-2 py-1 text-xs hover:bg-purple-700 dark:hover:bg-purple-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

