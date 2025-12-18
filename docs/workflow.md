# Revellio Workflow

## MVP Workflow Overview

Revellio follows a two-step AI-driven workflow that ensures users have control over the relationship detection process before visualization generation.

### Workflow Steps

```
1. User Uploads Data
   ↓
2. Data Mesh Analysis (AI Step 1)
   - AI analyzes 20 data points per file
   - Detects relationships and connections
   - Returns Data Mesh with relations
   ↓
3. User Reviews & Edits Relations
   - User can view all detected relations
   - User can edit relation explanations
   - User can remove unwanted relations
   - User can modify connection points
   ↓
4. Visualization Analysis (AI Step 2)
   - Edited relations passed to second AI run
   - AI determines best visualization methods
   - AI creates visualization strategy based on relations
   ↓
5. Visualizations Displayed
   - Dynamic visualizations rendered
   - Based on AI recommendations
   - Leveraging the defined relations
```

## Detailed Workflow

### Step 1: Data Upload

**User Action:**
- User uploads one or more CSV files via drag-and-drop interface

**System Processing:**
- Files are parsed and validated
- Metadata is extracted (columns, types, row counts)
- Data is stored in memory

**Output:**
- Parsed CSV data ready for analysis
- Metadata available for AI processing

### Step 2: Data Mesh Analysis

**User Action:**
- User clicks "Analyze Data Mesh" button
- Optionally provides context/prompt about expected relationships

**System Processing:**
- Extracts metadata from all files
- Creates data slices (20 rows per file for relation detection)
- Sends to AI with optional user prompt
- AI analyzes relationships between:
  - Files
  - Columns (within and across files)
  - Data values
  - Conceptual connections

**AI Output:**
- `DataMeshOutput` containing:
  - Array of `DataMeshRelation` objects
  - Summary of the data mesh network

**Why 20 Data Points?**
- Only 20 rows per file are used for relation determination
- This is sufficient for identifying relationships
- Reduces API costs and processing time
- Full data is still available for visualization

### Step 3: User Review & Edit Relations

**User Actions:**
- Views interactive Data Mesh visualization
- Can hover over relations to see details
- Can click relations to edit:
  - Explanation text
  - Connection points (element1/element2)
  - Can remove unwanted relations
- Can use "Find More References" to generate additional relations
- Can reroll individual relations with feedback

**System Processing:**
- Relations are stored in component state
- Changes are tracked via `onUpdateRelations` callback
- Updated relations are ready for next step
- Reroll functions allow generating new relations based on feedback

**Key Feature:**
- User has full control over which relations are used
- Relations can be refined before visualization generation
- This ensures visualizations match user expectations
- Reroll functionality allows iterative improvement of relations

### Step 4: Visualization Analysis

**User Action:**
- User clicks "Start Visualization Analysis" button
- Optionally provides additional context/prompt

**Prerequisites:**
- Data Mesh analysis must be completed
- At least one relation must exist

**System Processing:**
- Extracts metadata from all files
- Creates data slices (5 rows per file for visualization planning)
- Sends to AI:
  - Metadata
  - Data samples
  - **Edited relations from Data Mesh**
  - User prompt (optional)

**AI Processing:**
- AI receives pre-defined relations
- AI determines which visualization methods work best
- AI creates visualization strategy leveraging the relations
- AI explains how each visualization uses the defined relations

**AI Output:**
- `UnifiedAIOutput` containing:
  - Array of `VisualizationInstruction` objects
  - Relations (additional ones found)
  - Reasoning for visualization choices

### Step 5: Visualization Display

**System Processing:**
- Visualizations are rendered based on AI instructions
- Each visualization uses the defined relations
- Relations inform data source selection
- Relations guide aggregation and filtering

**User Experience:**
- Multiple visualizations displayed
- Each with explanation of why it was chosen
- How it leverages the defined relations
- Interactive charts and tables

## Key Design Decisions

### Why Two-Step AI Process?

1. **User Control**: Users can review and refine relations before visualization
2. **Better Results**: Visualizations are based on verified relations
3. **Transparency**: Users understand what relationships drive visualizations
4. **Efficiency**: Relations are determined once, then reused

### Why Edit Relations?

- AI may detect relations that aren't relevant
- Users may have domain knowledge AI lacks
- Users can add context through explanations
- Ensures visualizations match user intent

### Data Sampling Strategy

- **Data Mesh**: 20 rows per file (sufficient for relation detection)
- **Visualization**: 5 rows per file (sufficient for planning)
- Full data is always available for actual visualization rendering

## Technical Implementation

### API Endpoints

1. **POST /api/ai/data-mesh**
   - Input: `metadataArray`, `dataSlices` (20 rows), `userPrompt` (optional)
   - Output: `DataMeshOutput`

2. **POST /api/ai/analyze**
   - Input: `metadataArray`, `dataSlices` (5 rows), `userPrompt`, `relations` (from Data Mesh)
   - Output: `UnifiedAIOutput`

### State Management

- Relations are stored in component state
- Updated via `onUpdateRelations` callback
- Passed to visualization analysis API
- Used by visualization components

### Error Handling

- If Data Mesh fails, visualization step is disabled
- If no relations exist, visualization step is disabled
- Clear error messages guide user actions

