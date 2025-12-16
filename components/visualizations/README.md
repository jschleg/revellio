# Dynamic Visualization System

This directory contains a comprehensive, professional data visualization system powered by Nivo. All visualizations are automatically selected and rendered based on AI analysis of your data.

## Architecture

### Core Components

1. **AI-Driven Selection**: The AI service analyzes your data and generates `VisualizationInstruction[]` with:
   - `type`: The visualization type (e.g., "bar-chart", "line-chart", "sankey")
   - `module`: Descriptive name for the visualization
   - `config`: Configuration including data source, columns, aggregation
   - `reasoning`: Why this visualization was chosen and how it displays the relation

2. **Dynamic Rendering**: The `DynamicVisualization` component (`index.tsx`) maps visualization types to components using a switch statement.

3. **Component Rendering**: Each visualization component receives:
   - `instruction`: The full visualization instruction from AI
   - `data`: The CSV data to visualize
   - `relations`: (Optional) Relations between datasets

### Shared Infrastructure

- **`theme.ts`**: Centralized Nivo theme configuration with dark mode support
- **`utils.ts`**: Shared utility functions for data processing, validation, and aggregation
- **Consistent styling**: All components use the same theme and error handling patterns

## Available Visualization Types

### Standard Charts
- **bar-chart**: Bar charts for categorical comparisons and rankings
- **line-chart**: Line charts for time series and trends
- **pie-chart**: Pie charts for proportions and categorical distributions
- **scatter-plot**: Scatter plots for correlation analysis
- **radar**: Radar charts for multi-dimensional comparisons
- **radial-bar**: Circular bar charts

### Hierarchical & Tree Visualizations
- **treemap**: Hierarchical data with rectangular layout
- **sunburst**: Hierarchical data with circular, nested layout
- **icicle**: Hierarchical data in rectangular icicle format
- **tree**: Node-link tree diagrams
- **circle-packing**: Nested circles showing hierarchy and size

### Flow & Network Visualizations
- **sankey**: Flow diagrams showing transitions between states
- **chord**: Circular flow diagrams with bidirectional relationships
- **network**: Node-link diagrams showing connections between entities

### Matrix & Grid Visualizations
- **heatmap**: Matrix data showing intensity/values in a grid
- **marimekko**: Two-dimensional categorical analysis with variable-width bars
- **waffle**: Part-to-whole visualization in grid format

### Time-Series Visualizations
- **stream**: Stacked area chart showing composition over time
- **calendar**: Time-based data in calendar format (activity patterns)
- **bump**: Ranking changes over time

### Statistical & Distribution Visualizations
- **boxplot**: Statistical distribution with quartiles and outliers
- **swarmplot**: Distribution visualization showing individual data points
- **parallel-coordinates**: Multi-dimensional data analysis across many variables

### Specialized Visualizations
- **funnel**: Conversion funnels and process stages
- **bullet**: Performance metrics and KPIs with targets
- **table**: Detailed data tables for inspection
- **aggregated-overview**: Summary statistics and KPIs
- **relational-view**: Visual representation of relationships between datasets

## Shared Utilities

### Theme Configuration (`theme.ts`)

All visualizations use a shared theme configuration:

```tsx
import { nivoTheme, colorSchemes, getColorFromString } from "./theme";

// Use in component
<ResponsiveBar
  theme={nivoTheme}
  colors={colorSchemes.categorical}
  // ... other props
/>
```

**Available exports:**
- `nivoTheme`: Complete theme configuration with dark mode support
- `colorSchemes`: Predefined color palettes
- `getColorFromString(str)`: Generate consistent colors from strings
- `createTooltip(content)`: Standardized tooltip component

### Utility Functions (`utils.ts`)

```tsx
import { 
  applyAggregation, 
  validateColumns, 
  parseAndSortDates, 
  getErrorMessage 
} from "./utils";
```

**Functions:**
- `applyAggregation(data, columns, aggregation)`: Apply sum/avg/count aggregations
- `validateColumns(data, columns)`: Verify columns exist in data
- `parseAndSortDates(data)`: Parse and sort date/time data for time-series
- `getErrorMessage(message)`: Get standardized error message component

## Component Structure

Each visualization component should follow this structure:

```tsx
"use client";

import { ResponsiveChart } from "@nivo/chart-type";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme, getColorFromString } from "./theme";
import { validateColumns, getErrorMessage, applyAggregation } from "./utils";

interface ChartVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function ChartVisualization({ instruction, data }: ChartVisualizationProps) {
  const { columns = [], aggregation } = instruction.config;

  // 1. Validation
  if (columns.length < 2) {
    return getErrorMessage("Chart requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  // 2. Data Processing
  const processedData = applyAggregation(data.rows, columns, aggregation);

  // 3. Render
  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveChart
        data={processedData}
        theme={nivoTheme}
        // ... chart-specific props
      />
    </div>
  );
}
```

## Adding New Visualization Types

### Step 1: Install Nivo Package

```bash
pnpm add @nivo/chart-type
```

### Step 2: Create Component

Create `components/visualizations/new-chart.tsx` following the structure above.

### Step 3: Add Type Definition

Update `lib/types/data.ts`:

```ts
export type VisualizationType = 
  | "bar-chart"
  | "line-chart"
  // ... existing types
  | "new-chart"; // Add your new type
```

### Step 4: Register in Index

Update `components/visualizations/index.tsx`:

```tsx
import { NewChartVisualization } from "./new-chart";

// In switch statement:
case "new-chart":
  return <NewChartVisualization instruction={instruction} data={data} />;
```

### Step 5: Update AI Prompt

Add documentation for the new visualization type in `lib/ai/ai-service.ts`:
- When to use it
- Requirements (columns, data types)
- Aggregation strategy
- Examples
- Advantages

## Data Processing Guidelines

### Aggregation

Use `applyAggregation()` for consistent aggregation logic:

- **"sum"**: For additive metrics (revenue, quantity, counts)
- **"avg"**: For rates, averages, or when normalizing data
- **"count"**: For counting occurrences or frequencies
- **null**: Show raw data without aggregation

### Column Validation

Always validate columns before processing:

```tsx
const validation = validateColumns(data, columns);
if (!validation.valid) {
  return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
}
```

### Date/Time Handling

For time-series visualizations, use `parseAndSortDates()`:

```tsx
const sortedData = parseAndSortDates(dataPoints);
```

## Best Practices

### 1. Error Handling
- Always validate input data and columns
- Use `getErrorMessage()` for consistent error display
- Handle edge cases (empty data, invalid types, etc.)

### 2. Performance
- Limit data processing for large datasets
- Use aggregation when appropriate
- Consider data volume (e.g., tables show max 100 rows)

### 3. Accessibility
- Use proper ARIA labels (`ariaLabel` prop in Nivo)
- Ensure keyboard navigation works
- Provide meaningful tooltips

### 4. Responsive Design
- All Nivo components are responsive by default
- Use consistent container heights (typically 400-600px)
- Ensure charts work on mobile devices

### 5. Dark Mode
- All components automatically support dark mode via `nivoTheme`
- Theme uses `currentColor` to adapt to system theme
- Test in both light and dark modes

### 6. Styling Consistency
- Use `nivoTheme` for all charts
- Follow the container structure: rounded border, proper padding
- Use consistent color schemes from `colorSchemes`

### 7. Data Quality
- Handle null/undefined values appropriately
- Filter out invalid data points (NaN, null, undefined)
- Consider data distribution and outliers

## Example: Complete Bar Chart Implementation

```tsx
"use client";

import { ResponsiveBar } from "@nivo/bar";
import type { CSVData, VisualizationInstruction } from "@/lib/types/data";
import { nivoTheme, getColorFromString } from "./theme";
import { applyAggregation, validateColumns, getErrorMessage } from "./utils";

interface BarChartVisualizationProps {
  instruction: VisualizationInstruction;
  data: CSVData;
}

export function BarChartVisualization({ instruction, data }: BarChartVisualizationProps) {
  const { columns = [], aggregation } = instruction.config;

  // Validation
  if (columns.length < 2) {
    return getErrorMessage("Bar chart requires at least 2 columns");
  }

  const validation = validateColumns(data, columns);
  if (!validation.valid) {
    return getErrorMessage(`Missing columns: ${validation.missing.join(", ")}`);
  }

  // Data Processing
  const processedData = applyAggregation(data.rows, columns, aggregation);
  const indexBy = columns[0];
  const keys = columns.slice(1);

  // Render
  return (
    <div className="h-[500px] w-full rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900">
      <ResponsiveBar
        data={processedData as Record<string, string | number>[]}
        keys={keys}
        indexBy={indexBy}
        margin={{ top: 50, right: 130, bottom: 80, left: 60 }}
        padding={0.3}
        colors={getColorFromString}
        theme={nivoTheme}
        role="application"
        ariaLabel={instruction.reasoning || "Bar chart visualization"}
      />
    </div>
  );
}
```

## AI Integration

The AI service uses a sophisticated 3-phase approach to select visualizations:

1. **Data Analysis**: Identifies column types, patterns, relationships
2. **Strategy Selection**: Uses decision trees to choose appropriate visualizations
3. **Quality Assurance**: Validates choices before output

The AI considers:
- Data structure (categorical, numerical, temporal)
- Cardinality (number of unique values)
- Relationships between columns
- User context and business goals
- Data mesh relations (if available)

## Troubleshooting

### Chart Not Rendering
- Check column names match exactly (case-sensitive)
- Verify data types match visualization requirements
- Ensure aggregation logic is correct
- Check browser console for errors

### Performance Issues
- Use aggregation for large datasets
- Limit data points (e.g., sample or aggregate)
- Consider using simpler visualization types for very large datasets

### Styling Issues
- Ensure `nivoTheme` is applied
- Check dark mode compatibility
- Verify container classes are correct

### Data Quality Issues
- Validate columns exist before processing
- Handle null/undefined values
- Filter invalid data points
- Check for data type mismatches

## Resources

- [Nivo Documentation](https://nivo.rocks/)
- [Nivo Components](https://nivo.rocks/components/)
- [Data Visualization Best Practices](https://www.tableau.com/learn/articles/data-visualization)
