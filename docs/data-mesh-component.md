# Data Mesh Komponente

## Überblick

Die Data Mesh Komponente ist eine interaktive Visualisierungskomponente, die alle erkannten Relationen zwischen Daten auf drei hierarchischen Ebenen darstellt: **Files**, **Columns** und **Rows**. Sie ist ein zentraler Bestandteil des Revellio Workflows, da sie es dem User ermöglicht, Relationen zu überprüfen und zu bearbeiten, bevor diese für die Visualisierungsgenerierung verwendet werden.

## Konzept

### Zielsetzung

Die Komponente ermöglicht es dem User:
- Alle erkannten Relationen zwischen Daten zu sehen
- Die hierarchische Struktur der Daten zu verstehen (File → Columns → Rows)
- **Relationen zu bearbeiten** (Erklärungen ändern, Verbindungen anpassen)
- **Ungewollte Relationen zu entfernen**
- Die Erklärungen (Explanations) zu jeder Relation zu sehen
- **Bearbeitete Relationen werden an die Visualisierungsanalyse weitergegeben**

### Rolle im Workflow

Die Data Mesh Komponente ist **Schritt 1** im Revellio Workflow:
1. User lädt Daten hoch
2. **Data Mesh Analyse** → Relationen werden erkannt
3. **User bearbeitet Relationen** (diese Komponente)
4. Visualisierungsanalyse verwendet bearbeitete Relationen
5. Visualisierungen werden angezeigt

### Funktionalität (Implementiert)

- **Hierarchische Darstellung**: Alle 3 Ebenen (File, Columns, Rows) verschachtelt darstellen
- **Relationen visualisieren**: Betroffene Elemente mit SVG-Linien verbinden
- **Interaktive Bearbeitung**: 
  - Relationen anklicken zum Bearbeiten
  - Erklärungen ändern
  - Verbindungspunkte (Element1/Element2) ändern
  - Relationen entfernen
- **Hover-Tooltips**: Details zu Relationen beim Hovern
- **Zoom & Pan**: Für große Datenmengen
- **Vollbild-Modus**: Für bessere Übersicht

## Datenstruktur

Die Komponente verwendet die `DataMeshOutput` Struktur:

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

## Visualisierungskonzept

### Hierarchische Struktur

Die Daten werden verschachtelt dargestellt:

```
📁 File 1
  ├─ 📊 Column A
  │   ├─ 📄 Row 0
  │   ├─ 📄 Row 1
  │   └─ 📄 Row 2
  ├─ 📊 Column B
  │   ├─ 📄 Row 0
  │   └─ 📄 Row 1
  └─ 📊 Column C

📁 File 2
  ├─ 📊 Column X
  └─ 📊 Column Y
```

### Relationen-Darstellung

Relationen werden als Linien zwischen den betroffenen Elementen dargestellt:
- **File ↔ File**: Linie zwischen zwei File-Knoten
- **Column ↔ Column**: Linie zwischen zwei Column-Knoten (innerhalb oder zwischen Files)
- **Row ↔ Row**: Linie zwischen zwei Row-Knoten
- **Gemischte Relationen**: Linien zwischen verschiedenen Ebenen

Jede Linie trägt eine **Note** mit der `relationExplanation`.

### Interaktive Elemente

- **Checkboxen**: User kann Relationen als "sinnvoll" markieren
- **Hover-Effekte**: Beim Hovern über eine Relation werden Details hervorgehoben
- **Filter**: Möglichkeit, nur markierte Relationen anzuzeigen

## Technische Umsetzung

### Technologie-Stack

- **React**: Für die Komponentenlogik
- **SVG**: Für die Visualisierung der Relationen (Linien)
- **Tailwind CSS**: Für das Styling
- **TypeScript**: Für Type-Safety

### Komponentenstruktur

```
DataMeshVisualization/
├── index.tsx                    # Hauptkomponente
├── hierarchy-tree.tsx           # Hierarchische Struktur-Darstellung
├── relation-lines.tsx           # SVG-Linien für Relationen
├── relation-notes.tsx           # Notes/Labels für Explanations
└── types.ts                     # TypeScript-Typen
```

### Layout-Strategie

1. **Hierarchische Struktur**: Links oder oben als verschachtelte Liste/Boxen
2. **Relationen-Linien**: SVG-Overlay über der Struktur
3. **Notes**: Tooltips oder Popover bei Hover/Klick auf Relationen

## Implementierungsstatus

### ✅ Implementiert

- [x] Komponente-Grundgerüst
- [x] Hierarchische Darstellung (File → Columns → Rows)
- [x] SVG-Linien zwischen Elementen
- [x] Positionierung der Elemente für Linien
- [x] Hover-Tooltips mit Relation-Details
- [x] Interaktive Bearbeitung:
  - [x] Relationen anklicken zum Bearbeiten
  - [x] Erklärungen ändern
  - [x] Verbindungspunkte ändern
  - [x] Relationen entfernen
- [x] Zoom & Pan Funktionalität
- [x] Vollbild-Modus
- [x] Integration in `page.tsx`
- [x] `onUpdateRelations` Callback für State-Management
- [x] Relations-Liste mit Auswahl
- [x] Canvas Controls (Zoom, Reset, Fullscreen)

### 🔄 Geplant

- [ ] Filter nach Relation-Typ
- [ ] Gruppierung ähnlicher Relationen
- [ ] Export als Bild
- [ ] Reroll-Funktion (neue Relationen generieren)

## Offene Fragen

- Welches Layout ist am besten geeignet? (Horizontal, Vertikal, Radial?)
- Wie viele Rows sollen dargestellt werden? (Alle oder nur Sample?)
- Sollen Relationen zwischen Rows dargestellt werden oder nur auf File/Column-Ebene?
- Wie groß soll die Komponente sein? (Scrollbar, Zoom-Funktion?)

## Zukünftige Erweiterungen

- **Reroll-Funktion**: Neue Relationen generieren lassen
- **Export**: Visualisierung als Bild exportieren
- **Zoom & Pan**: Für große Datenmengen
- **Filter**: Nach Relation-Typ filtern
- **Gruppierung**: Ähnliche Relationen gruppieren

