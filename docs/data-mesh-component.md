# Data Mesh Komponente

## Überblick

Die Data Mesh Komponente ist eine interaktive Visualisierungskomponente, die alle erkannten Relationen zwischen Daten auf drei hierarchischen Ebenen darstellt: **Files**, **Rows** und **Columns**.

## Konzept

### Zielsetzung

Die Komponente ermöglicht es dem User:
- Alle erkannten Relationen zwischen Daten zu sehen
- Die hierarchische Struktur der Daten zu verstehen (File → Columns → Rows)
- Interaktiv zu definieren, welche Relationen sinnvoll sind
- Die Erklärungen (Explanations) zu jeder Relation zu sehen

### Funktionalität (MVP)

#### Phase 1: Basis-Visualisierung
- **Hierarchische Darstellung**: Alle 3 Ebenen (File, Columns, Rows) verschachtelt darstellen
- **Relationen visualisieren**: Betroffene Elemente mit Linien verbinden
- **Explanations anzeigen**: Jede Relation zeigt ihre Explanation als Note/Label

#### Phase 2: Interaktivität (später)
- **Relationen filtern**: User kann Relationen als "sinnvoll" oder "nicht sinnvoll" markieren
- **Reroll-Funktion**: Neue Relationen generieren lassen (noch nicht implementiert)

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

## Implementierungsplan

### Schritt 1: Basis-Struktur
- [x] Dokumentation erstellen
- [ ] Komponente-Grundgerüst erstellen
- [ ] Hierarchische Darstellung (File → Columns → Rows)
- [ ] Basis-Styling

### Schritt 2: Relationen-Visualisierung
- [ ] SVG-Linien zwischen Elementen
- [ ] Positionierung der Elemente für Linien
- [ ] Notes/Labels für Explanations

### Schritt 3: Interaktivität
- [ ] Checkboxen für Relationen
- [ ] State-Management für ausgewählte Relationen
- [ ] Hover-Effekte

### Schritt 4: Integration
- [ ] Integration in `page.tsx`
- [ ] Daten-Props übergeben
- [ ] Styling anpassen

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

