# Data Mesh Component

## Overview

The Data Mesh component is an interactive visualization component that displays all detected relations between data on three hierarchical levels: **Files**, **Columns**, and **Rows**. It is a central part of the Revellio workflow, as it enables users to review and edit relations before they are used for visualization generation.

## Concept

### Objectives

The component enables users to:
- See all detected relations between data
- Understand the hierarchical structure of data (File → Columns → Rows)
- **Edit relations** (change explanations, adjust connections)
- **Remove unwanted relations**
- See the explanations for each relation
- **Edited relations are passed to the visualization analysis**

### Role in Workflow

The Data Mesh component is **Step 1** in the Revellio workflow:
1. User uploads data
2. **Data Mesh Analysis** → Relations are detected
3. **User edits relations** (this component)
4. Visualization analysis uses edited relations
5. Visualizations are displayed

### Functionality (Implemented)

- **Hierarchical Display**: All 3 levels (File, Columns, Rows) displayed nested
- **Visualize Relations**: Connect affected elements with SVG lines
- **Interactive Editing**: 
  - Click relations to edit
  - Change explanations
  - Change connection points (Element1/Element2)
  - Remove relations
- **Hover Tooltips**: Details about relations on hover
- **Zoom & Pan**: For large datasets
- **Fullscreen Mode**: For better overview

## Data Structure

The component uses the `DataMeshOutput` structure:

```typescript
interface DataMeshRelation {
  element1: string;
  element1Source: {
    file: string;
    column?: string;
    rowIndex?: number;
  };
  element2: string;
  element2Source: {
    file: string;
    column?: string;
    rowIndex?: number;
  };
  relationExplanation: string;
}

interface DataMeshOutput {
  relations: DataMeshRelation[];
  summary: string;
}
```

## Visualization Concept

### Hierarchical Structure

Data is displayed nested:

```
File 1
  ├─ Column A
  │   ├─ Row 0
  │   ├─ Row 1
  │   └─ Row 2
  ├─ Column B
  │   ├─ Row 0
  │   └─ Row 1
  └─ Column C

File 2
  ├─ Column X
  └─ Column Y
```

### Relation Display

Relations are displayed as lines between affected elements:
- **File ↔ File**: Line between two file nodes
- **Column ↔ Column**: Line between two column nodes (within or across files)
- **Row ↔ Row**: Line between two row nodes
- **Mixed Relations**: Lines between different levels

Each line carries a **Note** with the `relationExplanation`.

### Interactive Elements

- **Relations List**: User can select and view relations
- **Hover Tooltips**: Details are displayed when hovering over a relation
- **Edit Modal**: Relations can be edited (explanation, connection points)
- **Reroll Function**: New relations can be generated (Find More References)
- **Individual Relation Reroll**: Specific relations can be regenerated

## Technical Implementation

### Technology Stack

- **React**: For component logic
- **SVG**: For visualizing relations (lines)
- **Tailwind CSS**: For styling
- **TypeScript**: For type safety

### Component Structure

```
components/data-mesh-visualization/
├── index.ts                     # Export of main component
├── CanvasControls.tsx            # Zoom, Reset, Fullscreen Controls
├── DataHierarchy.tsx             # Hierarchical structure display
├── EditRelationModal.tsx         # Modal for editing relations
├── FeedbackPanel.tsx             # Feedback panel for reroll functions
├── RelationLines.tsx             # SVG lines for relations
├── RelationsList.tsx             # List of relations with selection
└── RelationTooltip.tsx           # Tooltip with relation details

components/data-mesh-visualization.tsx  # Main component
```

### Layout Strategy

1. **Hierarchical Structure**: Left or top as nested list/boxes
2. **Relation Lines**: SVG overlay over the structure
3. **Notes**: Tooltips or popover on hover/click on relations

## Implementation Status

### Implemented

- [x] Component foundation
- [x] Hierarchical display (File → Columns → Rows)
- [x] SVG lines between elements
- [x] Element positioning for lines
- [x] Hover tooltips with relation details
- [x] Interactive editing:
  - [x] Click relations to edit
  - [x] Change explanations
  - [x] Change connection points
  - [x] Remove relations
- [x] Zoom & Pan functionality
- [x] Fullscreen mode
- [x] Integration in `page.tsx`
- [x] `onUpdateRelations` callback for state management
- [x] Relations list with selection
- [x] Canvas Controls (Zoom, Reset, Fullscreen)
- [x] Reroll function (Find More References - generate new relations)
- [x] Individual relation reroll (regenerate specific relation)

### Planned

- [ ] Filter by relation type
- [ ] Group similar relations
- [ ] Export as image

## Open Questions

- Which layout is best suited? (Horizontal, Vertical, Radial?)
- How many rows should be displayed? (All or just sample?)
- Should relations between rows be displayed or only at File/Column level?
- How large should the component be? (Scrollbar, zoom function?)

## Future Extensions

- **Export**: Export visualization as image
- **Filter**: Filter by relation type
- **Grouping**: Group similar relations
