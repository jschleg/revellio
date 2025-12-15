# Debugging Guide für Revellio

## 🛠️ Debugging-Methoden

### 1. **Browser DevTools (Client-side)**

#### Console Tab
- Öffne DevTools: `F12` oder `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- Sieh dir die Console-Logs an:
  - `🔍 [DEBUG]` - Debug-Informationen
  - `✅ [DEBUG]` - Erfolgreiche Operationen
  - `❌ [DEBUG]` - Fehler
  - `⚠️ [DEBUG]` - Warnungen

#### Network Tab
- Überwache API-Calls:
  - Filter: `XHR` oder `Fetch`
  - Klicke auf einen Request → sieh dir `Request` und `Response` an
  - Prüfe Status-Codes (200 = OK, 400/500 = Fehler)

#### React DevTools
- Installiere die [React DevTools Extension](https://react.dev/learn/react-developer-tools)
- Inspect Components und State

### 2. **Server-side Debugging (API Routes)**

#### Terminal/Console
- Die API Routes loggen direkt in die Terminal-Konsole
- Sieh dir die Server-Logs an, während `pnpm dev` läuft

#### Debug-Logs hinzufügen
```typescript
// In app/api/ai/analyze/route.ts
export async function POST(request: NextRequest) {
  console.log("📥 [API] Received request");
  const { metadataArray } = await request.json();
  console.log("📊 [API] Metadata:", metadataArray);
  
  // ... dein Code ...
  
  console.log("📤 [API] Sending response:", analysis);
  return NextResponse.json(analysis);
}
```

### 3. **Debugging-Tools**

#### VS Code Debugger
1. Erstelle `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

2. Setze Breakpoints in deinem Code
3. Starte Debugging (F5)

### 4. **Häufige Debugging-Szenarien**

#### API-Call schlägt fehl
```typescript
// In app/page.tsx
const response = await fetch("/api/ai/analyze", {...});
console.log("Response status:", response.status);
console.log("Response headers:", response.headers);

if (!response.ok) {
  const errorText = await response.text();
  console.error("Error response:", errorText);
  // Oder:
  const errorJson = await response.json();
  console.error("Error JSON:", errorJson);
}
```

#### State nicht aktualisiert
```typescript
// Verwende useEffect zum Debugging
useEffect(() => {
  console.log("State updated:", {
    csvData,
    analysis,
    visualizations,
    relations
  });
}, [csvData, analysis, visualizations, relations]);
```

#### API-Key Problem
```typescript
// In app/api/ai/analyze/route.ts
console.log("API Key exists:", !!process.env.OPENAI_API_KEY);
console.log("API Key length:", process.env.OPENAI_API_KEY?.length);
```

### 5. **Nützliche Console-Commands**

#### Im Browser Console:
```javascript
// State inspizieren (wenn du React DevTools hast)
$r // Aktuelles React-Element

// Network Requests wiederholen
fetch("/api/ai/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ metadataArray: [...] })
}).then(r => r.json()).then(console.log)
```

### 6. **Debug-Modus aktivieren**

Füge eine Debug-Variable hinzu:
```typescript
// In app/page.tsx
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log("🐛 Debug mode enabled");
}
```

### 7. **Error Boundaries**

Erstelle eine Error Boundary Komponente:
```typescript
// components/error-boundary.tsx
"use client";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2>Something went wrong</h2>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
```

## 🎯 Quick Debug Checklist

- [ ] Browser Console geöffnet?
- [ ] Network Tab zeigt API-Calls?
- [ ] Server-Logs im Terminal sichtbar?
- [ ] API-Key in `.env.local` vorhanden?
- [ ] Response-Status-Codes geprüft?
- [ ] Error-Messages gelesen?
- [ ] State mit React DevTools inspiziert?

## 📝 Debugging-Tipps

1. **Logge immer Input und Output**
2. **Prüfe Network-Tab für API-Calls**
3. **Verwende aussagekräftige Log-Messages** (mit Emojis für schnelle Erkennung)
4. **Isoliere das Problem** - teste einzelne Funktionen
5. **Prüfe TypeScript-Fehler** - `pnpm run build` zeigt alle Typ-Fehler

