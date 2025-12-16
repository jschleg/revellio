/**
 * Shared Nivo theme configuration for all visualizations
 * Ensures consistent styling across all charts with dark mode support
 */
export const nivoTheme = {
  background: "transparent",
  text: {
    fontSize: 11,
    fill: "currentColor",
    outlineWidth: 0,
    outlineColor: "transparent",
  },
  axis: {
    domain: {
      line: {
        stroke: "currentColor",
        strokeWidth: 1,
        strokeOpacity: 0.3,
      },
    },
    legend: {
      text: {
        fontSize: 12,
        fill: "currentColor",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
    ticks: {
      line: {
        stroke: "currentColor",
        strokeWidth: 1,
        strokeOpacity: 0.3,
      },
      text: {
        fontSize: 11,
        fill: "currentColor",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
  },
  grid: {
    line: {
      stroke: "currentColor",
      strokeWidth: 1,
      strokeOpacity: 0.1,
    },
  },
  tooltip: {
    container: {
      background: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.5rem",
      padding: "0.5rem",
      fontSize: "0.875rem",
    },
  },
} as const;

/**
 * Shared color schemes for consistent visualization colors
 */
export const colorSchemes = {
  default: { scheme: "nivo" as const },
  categorical: [
    "hsl(220, 70%, 50%)",
    "hsl(120, 70%, 50%)",
    "hsl(0, 70%, 50%)",
    "hsl(300, 70%, 50%)",
    "hsl(60, 70%, 50%)",
    "hsl(180, 70%, 50%)",
    "hsl(30, 70%, 50%)",
    "hsl(270, 70%, 50%)",
    "hsl(150, 70%, 50%)",
    "hsl(10, 70%, 50%)",
  ],
} as const;

/**
 * Generate a consistent color from a string
 */
export function getColorFromString(str: string): string {
  const hash = str.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
}

/**
 * Shared tooltip component for consistent styling
 */
export function createTooltip(content: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
      <div className="font-semibold">{content.title}</div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {typeof content.value === "number" ? `Value: ${content.value.toLocaleString()}` : content.value}
      </div>
    </div>
  );
}

