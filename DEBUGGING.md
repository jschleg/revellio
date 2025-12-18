# Debugging Guide for Revellio

## Debugging Methods

### 1. **Browser DevTools (Client-side)**

#### Console Tab
- Open DevTools: `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- View Console logs:
  - `[DEBUG]` - Debug information
  - `[DEBUG]` - Successful operations
  - `[DEBUG]` - Errors
  - `[DEBUG]` - Warnings

#### Network Tab
- Monitor API calls:
  - Filter: `XHR` or `Fetch`
  - Click on a request → view `Request` and `Response`
  - Check status codes (200 = OK, 400/500 = Error)

#### React DevTools
- Install the [React DevTools Extension](https://react.dev/learn/react-developer-tools)
- Inspect Components and State

### 2. **Server-side Debugging (API Routes)**

#### Terminal/Console
- API Routes log directly to the terminal console
- View server logs while `pnpm dev` is running

#### Adding Debug Logs
```typescript
// In app/api/ai/analyze/route.ts
export async function POST(request: NextRequest) {
  console.log("[API] Received request");
  const { metadataArray } = await request.json();
  console.log("[API] Metadata:", metadataArray);
  
  // ... your code ...
  
  console.log("[API] Sending response:", analysis);
  return NextResponse.json(analysis);
}
```

### 3. **Debugging Tools**

#### VS Code Debugger
1. Create `.vscode/launch.json`:
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

2. Set breakpoints in your code
3. Start debugging (F5)

### 4. **Common Debugging Scenarios**

#### API Call Fails
```typescript
// In app/page.tsx
const response = await fetch("/api/ai/analyze", {...});
console.log("Response status:", response.status);
console.log("Response headers:", response.headers);

if (!response.ok) {
  const errorText = await response.text();
  console.error("Error response:", errorText);
  // Or:
  const errorJson = await response.json();
  console.error("Error JSON:", errorJson);
}
```

#### State Not Updated
```typescript
// Use useEffect for debugging
useEffect(() => {
  console.log("State updated:", {
    csvData,
    analysis,
    visualizations,
    relations
  });
}, [csvData, analysis, visualizations, relations]);
```

#### API Key Problem
```typescript
// In app/api/ai/analyze/route.ts
console.log("API Key exists:", !!process.env.OPENAI_API_KEY);
console.log("API Key length:", process.env.OPENAI_API_KEY?.length);
```

### 5. **Useful Console Commands**

#### In Browser Console:
```javascript
// Inspect state (if you have React DevTools)
$r // Current React element

// Repeat network requests
fetch("/api/ai/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ metadataArray: [...] })
}).then(r => r.json()).then(console.log)
```

### 6. **Enable Debug Mode**

Add a debug variable:
```typescript
// In app/page.tsx
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log("Debug mode enabled");
}
```

### 7. **Error Boundaries**

Create an Error Boundary component:
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

## Quick Debug Checklist

- [ ] Browser Console open?
- [ ] Network Tab shows API calls?
- [ ] Server logs visible in terminal?
- [ ] API key present in `.env.local`?
- [ ] Response status codes checked?
- [ ] Error messages read?
- [ ] State inspected with React DevTools?

## Debugging Tips

1. **Always log input and output**
2. **Check Network tab for API calls**
3. **Use meaningful log messages** (with clear prefixes for quick recognition)
4. **Isolate the problem** - test individual functions
5. **Check TypeScript errors** - `pnpm run build` shows all type errors
