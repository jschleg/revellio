# Dynamic Visualization System

This directory contains the dynamic visualization components that are automatically selected and rendered based on AI output.

## How It Works

1. **AI Output**: The AI service returns `VisualizationInstruction[]` with:
   - `type`: The visualization type (e.g., "bar-chart", "line-chart")
   - `module`: The module name (for reference)
   - `config`: Configuration including data source, columns, aggregation
   - `reasoning`: Why this visualization was chosen

2. **Dynamic Selection**: The `DynamicVisualization` component (`index.tsx`) uses a switch statement to map visualization types to the appropriate component.

3. **Component Rendering**: Each visualization component receives:
   - `instruction`: The full visualization instruction from AI
   - `data`: The CSV data to visualize
   - `relations`: (Optional) Relations between datasets

## Available Visualization Types

- **bar-chart**: Bar charts using Recharts
- **line-chart**: Line charts for time series or trends
- **pie-chart**: Pie charts for categorical distributions
- **scatter-plot**: Scatter plots for correlations
- **table**: Data tables for raw data display
- **relational-view**: Visual representation of relationships between datasets
- **aggregated-overview**: Summary statistics and aggregations

## Adding New Visualization Types

1. **Create the component** in this directory (e.g., `new-chart.tsx`):
```tsx
"use client";

import type { CSVData, VisualizationInstruction } from "@/lib/types/data";

interface NewChartProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function NewChartVisualization({ instruction, data }: NewChartProps) {
  // Your visualization logic here
  return <div>Your visualization</div>;
}
```

2. **Add the type** to `lib/types/data.ts`:
```ts
export type VisualizationType = 
  | "bar-chart"
  | "line-chart"
  // ... existing types
  | "new-chart"; // Add your new type
```

3. **Update the mapper** in `index.tsx`:
```tsx
case "new-chart":
  return <NewChartVisualization instruction={instruction} data={data} />;
```

4. **Update AI prompt** in `lib/ai/ai-service.ts` to include the new type in the visualization options.

## Component Structure

Each visualization component should:
- Accept `instruction` and `data` props
- Handle missing or invalid data gracefully
- Use responsive containers for charts
- Follow the design system (Tailwind classes, dark mode support)
- Display appropriate error messages when data is invalid

## Data Processing

Components receive raw CSV data and should:
- Extract relevant columns based on `instruction.config.columns`
- Apply aggregations if specified in `instruction.config.aggregation`
- Handle null/undefined values appropriately
- Limit data size for performance (e.g., tables show max 100 rows)

## Example: Bar Chart

```tsx
export function BarChartVisualization({ instruction, data }: BarChartVisualizationProps) {
  const { columns = [] } = instruction.config;
  
  // Process data
  const chartData = data.rows.map((row) => {
    const entry: Record<string, unknown> = {};
    columns.forEach((col) => {
      entry[col] = row[col] ?? null;
    });
    return entry;
  });

  // Render with Recharts
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        {/* Chart configuration */}
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## Best Practices

1. **Error Handling**: Always check for valid data before rendering
2. **Performance**: Limit data processing for large datasets
3. **Accessibility**: Use proper ARIA labels and semantic HTML
4. **Responsive**: Use `ResponsiveContainer` from Recharts for charts
5. **Dark Mode**: Ensure components work in both light and dark themes

