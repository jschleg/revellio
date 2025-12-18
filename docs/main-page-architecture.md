# Main Page Architecture

## Übersicht

Die Hauptseite (`app/page.tsx`) ist das zentrale Orchestrierungs- und State-Management-Element der Revellio-Anwendung. Sie koordiniert alle Benutzerinteraktionen, verwaltet den Anwendungszustand und delegiert die UI-Darstellung an spezialisierte Komponenten.

## Architektur-Prinzipien

Die Hauptseite folgt dem **Container/Presenter Pattern**:
- **`page.tsx`** (Container) - Verwaltet State und Business Logic
- **`MainContent`** (Presenter) - Orchestriert die UI-Sektionen
- **Feature Components** - Präsentieren spezifische UI-Bereiche

## Komponenten-Hierarchie

```
page.tsx (Container)
├── Sidebar (Navigation & Session Management)
├── SessionHeader (Session Name & Controls)
└── MainContent (Content Router)
    ├── ErrorDisplay (Error Messages)
    ├── FileUploadSection (Data Section)
    ├── FileDisplaySection (Data Section)
    ├── MetadataDisplaySection (Data Section)
    ├── DataMeshSection (Data Mesh Section)
    ├── VisualizationSection (Visualizations Section)
    ├── AIAnalysisOverview (Visualizations Section)
    ├── Visualizer (Visualizations Section)
    └── TechnicalDetailsSection (Technical Section)
```

## `page.tsx` - Der Container

### Verantwortlichkeiten

1. **State Management**
   - Session State (via `useSession` Hook)
   - UI State (Sidebar, aktive Sektion, Fehler, Toggle States)
   - Processing State (Data Mesh & Visualization)

2. **Business Logic Handlers**
   - File Upload & Parsing
   - Data Mesh Analysis (Analyze, Reroll, Reroll Relation)
   - Visualization Analysis (Analyze, Regenerate)
   - Session Management (Save, Load, Delete)

3. **Error Handling**
   - Zentralisiertes Error State Management
   - Error Display Coordination

### State Structure

```typescript
// Session State (from useSession hook)
session: {
  id: string | null
  name: string
  csvData: CSVData[]
  metadataInput: Metadata[]
  dataMeshPrompt: string
  userPrompt: string
  meshOutput: DataMeshOutput | null
  meshRelations: DataMeshRelation[]
  aiOutput: UnifiedAIOutput | null
  meshInputPayload: unknown
  aiInputPayload: unknown
}

// UI State (local useState)
isSidebarCollapsed: boolean
activeSection: NavigationSection ("data" | "data-mesh" | "visualizations" | "technical")
error: string | null
showMetadata: boolean
showFileDisplay: boolean

// Processing State (from hooks)
isDataMeshProcessing: boolean
dataMeshStep: string
isAnalyzing: boolean
analyzingStep: string
```

### Custom Hooks

Die Hauptseite nutzt vier spezialisierte Hooks:

1. **`useSession`** - Session State Management
   - Session CRUD Operations
   - Auto-Save Logic
   - Session Loading

2. **`useDataMesh`** - Data Mesh Processing
   - AI Analysis Orchestration
   - Step-by-Step Progress Tracking

3. **`useVisualization`** - Visualization Processing
   - AI Analysis Orchestration
   - Step-by-Step Progress Tracking

4. **`useFileHandling`** - File Upload & Parsing
   - CSV Parsing
   - File Validation

### Handler Functions

#### File Handling
```typescript
handleFilesSelected(selectedFiles: File[])
```
- Validiert und parst CSV-Dateien
- Aktualisiert Session State
- Setzt abhängige States zurück (meshOutput, aiOutput, etc.)
- Zeigt File Display automatisch an

#### Data Mesh Analysis
```typescript
handleDataMeshAnalysis()
handleDataMeshReroll(existingRelations, feedback)
handleDataMeshRerollRelation(index, feedback)
```
- Validiert CSV Data vorhanden
- Ruft AI Analysis auf
- Aktualisiert Session mit Results
- Error Handling

#### Visualization Analysis
```typescript
handleVisualizationAnalysis()
handleVisualizationRegenerate(existingOutput, feedback)
```
- Validiert CSV Data vorhanden
- Ruft AI Analysis auf
- Aktualisiert Session mit Results
- Error Handling

#### Session Management
```typescript
handleManualSave()
handleLoadSession(sessionId)
handleDeleteSession(sessionId)
```
- Session Persistierung
- Session Loading mit State Restoration
- Session Deletion

## `MainContent` - Der Presenter

### Verantwortlichkeiten

1. **Section Routing**
   - Rendert die korrekte Sektion basierend auf `activeSection`
   - Verwaltet Loading States
   - Zeigt Error Messages an

2. **Props Delegation**
   - Empfängt alle notwendigen Props von `page.tsx`
   - Delegiert an spezifische Feature Components
   - Trennt UI-Logik von Business Logic

3. **Conditional Rendering**
   - Zeigt nur relevante Sektionen
   - Verwaltet Visibility States (showFileDisplay, showMetadata)

### Section Mapping

| `activeSection` | Rendered Components |
|----------------|---------------------|
| `"data"` | FileUploadSection, FileDisplaySection, MetadataDisplaySection |
| `"data-mesh"` | DataMeshSection |
| `"visualizations"` | VisualizationSection, AIAnalysisOverview, Visualizer |
| `"technical"` | TechnicalDetailsSection |

### Props Interface

`MainContent` empfängt 25+ Props, gruppiert in:

- **Session Data**: csvData, metadataInput, prompts, outputs, payloads
- **UI State**: showFileDisplay, showMetadata
- **Processing State**: isProcessing flags, steps
- **Handlers**: Alle Event Handler für User Interactions

## Feature Components

### Data Section Components

#### `FileUploadSection`
- File Upload UI
- Delegiert an `FileDrop` Component
- Props: `onFilesSelected`

#### `FileDisplaySection`
- Collapsible File Data Tables
- Nutzt `CollapsibleSection` für UI
- Props: `csvData`, `isOpen`, `onToggle`

#### `MetadataDisplaySection`
- Collapsible Metadata Display
- Zeigt File Statistics (Rows, Columns, Types)
- Props: `metadata`, `isOpen`, `onToggle`

### Data Mesh Section

#### `DataMeshSection`
- Data Mesh Analysis UI
- Prompt Input
- Analysis Button
- Data Mesh Visualization
- Reroll Functionality
- Props: csvData, prompts, outputs, handlers

### Visualizations Section

#### `VisualizationSection`
- Visualization Analysis UI
- Prompt Input
- Analysis & Regenerate Buttons
- Props: csvData, meshOutput, prompts, handlers

#### `AIAnalysisOverview`
- Statistics Display
- Visualization Count
- Insights Count
- Props: `aiOutput`

#### `Visualizer`
- Renders AI-generated Visualizations
- Supports 5 visualization types
- Props: `aiOutput`, `csvData`, `onRegenerate`

### Technical Section

#### `TechnicalDetailsSection`
- Input/Output JSON Viewers
- Data Mesh Payloads
- AI Analysis Payloads
- Props: `meshInputPayload`, `meshOutput`, `aiInputPayload`, `aiOutput`

## UI Components (Reusable)

### `ErrorDisplay`
- Standardisiertes Error Message Display
- Props: `error: string`

### `CollapsibleSection`
- Reusable Collapsible UI Component
- Props: `title`, `isOpen`, `onToggle`, `children`, `icon`, `badge`

## Data Flow

### File Upload Flow
```
User selects files
  ↓
handleFilesSelected()
  ↓
useFileHandling.handleFilesSelected()
  ↓
CSV Parsing (lib/data/csv-parser.ts)
  ↓
Session State Update (setSession)
  ↓
MainContent re-renders
  ↓
FileDisplaySection shows data
```

### Data Mesh Analysis Flow
```
User clicks "Analyze Data Mesh"
  ↓
handleDataMeshAnalysis()
  ↓
useDataMesh.analyzeDataMesh()
  ↓
API Call (app/api/ai/data-mesh/route.ts)
  ↓
AI Service (lib/ai/ai-service.ts)
  ↓
Session State Update (setSession)
  ↓
MainContent re-renders
  ↓
DataMeshSection shows results
```

### Visualization Analysis Flow
```
User clicks "Start Visualization Analysis"
  ↓
handleVisualizationAnalysis()
  ↓
useVisualization.analyzeVisualization()
  ↓
API Call (app/api/ai/analyze/route.ts)
  ↓
AI Service (lib/ai/ai-service.ts)
  ↓
Session State Update (setSession)
  ↓
MainContent re-renders
  ↓
Visualizer shows visualizations
```

## Best Practices

### State Management
- ✅ Session State zentral in `useSession` Hook
- ✅ UI State lokal in `page.tsx`
- ✅ Processing State in spezialisierten Hooks
- ✅ Kein State in Presenter Components

### Error Handling
- ✅ Zentralisiertes Error State
- ✅ Error Display Component
- ✅ Try-Catch in allen Handlers
- ✅ User-friendly Error Messages

### Component Separation
- ✅ Container (page.tsx) - Business Logic
- ✅ Presenter (MainContent) - UI Orchestration
- ✅ Feature Components - Specific UI Sections
- ✅ UI Components - Reusable Building Blocks

### Props Drilling
- ⚠️ `MainContent` hat viele Props (25+)
- ✅ Alle Props sind typisiert
- ✅ Props sind logisch gruppiert
- 💡 Zukünftige Verbesserung: Context API für Session State

## Refactoring History

Die Hauptseite wurde von **531 Zeilen** auf **327 Zeilen** refactored durch:

1. **Extraction of UI Components**
   - `ErrorDisplay` - Error Messages
   - `CollapsibleSection` - Reusable Collapsible UI

2. **Extraction of Feature Components**
   - `FileDisplaySection` - File Data Display
   - `MetadataDisplaySection` - Metadata Display
   - `AIAnalysisOverview` - Statistics Display
   - `TechnicalDetailsSection` - Technical Details

3. **Creation of MainContent Component**
   - Section Routing Logic
   - Conditional Rendering
   - Props Delegation

## Zukünftige Verbesserungen

### Mögliche Optimierungen

1. **Context API für Session State**
   - Reduziert Props Drilling
   - Bessere Performance
   - Einfacheres State Management

2. **Custom Hook für Page Logic**
   - `usePageHandlers()` Hook
   - Extrahiert alle Handler Functions
   - Noch sauberere Trennung

3. **Section Components als Routes**
   - Next.js App Router Integration
   - URL-basierte Navigation
   - Bessere Browser History

4. **Error Boundary**
   - React Error Boundary Component
   - Graceful Error Handling
   - Bessere User Experience

