"use client";


import { ResponsiveCalendar } from "@nivo/calendar";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme } from "./theme";
import { validateColumns, getErrorMessage } from "./utils";

interface CalendarVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function CalendarVisualization({ instruction, data }: CalendarVisualizationProps) {
  const { columns = [] } = instruction.config;

  if (columns.length < 2) {
    return getErrorMessage("Calendar chart requires date column and value column");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  const [dateCol, valueCol] = columns;

  // Prepare data - aggregate by date
  const dateMap = new Map<string, number>();

  data.rows.forEach((row) => {
    const dateStr = String(row[dateCol] ?? "");
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const dateKey = date.toISOString().split("T")[0];
      const value = Number(row[valueCol]) || 0;
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + value);
    }
  });

  const chartData = Array.from(dateMap.entries()).map(([day, value]) => ({
    day,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
        <p className="text-sm text-zinc-500">No valid date data found</p>
      </div>
    );
  }

  // Get date range
  const dates = chartData.map((d) => new Date(d.day));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  return (
    <div className="h-[400px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveCalendar
        data={chartData}
        from={minDate.toISOString().split("T")[0]}
        to={maxDate.toISOString().split("T")[0]}
        emptyColor="#eeeeee"
        colors={["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"]}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
        legends={[
          {
            anchor: "bottom-right",
            direction: "row",
            translateY: 36,
            itemCount: 4,
            itemWidth: 42,
            itemHeight: 36,
            itemsSpacing: 14,
            itemDirection: "right-to-left",
          },
        ]}
        theme={nivoTheme}
      />
    </div>
  );
}

