# Revellio

Revellio is an AI-powered analysis and visualization tool focused on gaining insights. The user provides data, and the system handles analysis, structuring, and presentation.

A modern Next.js application built with TypeScript, Tailwind CSS, and shadcn/ui.

## What is Revellio?

Revellio is an AI-powered data analysis and visualization tool that helps users discover insights from CSV data without requiring data science expertise. The system uses a two-step AI workflow:

1. **Data Mesh Analysis**: AI detects relationships between data elements (using 20 data points per file)
2. **User Review & Edit**: Users can review, edit, refine, and reroll detected relations
3. **Visualization Analysis**: AI creates visualization strategy based on edited relations
4. **Visualizations**: Dynamic visualizations are rendered based on AI recommendations (bar charts, line charts, pie charts, scatter plots, and data tables)

## Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd revellio
```

2. Install pnpm (if not already installed):
```bash
npm install -g pnpm
```

3. Install dependencies:
```bash
pnpm install
```

4. Set up environment variables:

**For Local Development (SQLite - recommended for speed):**
```bash
# Create .env.local file (gitignored)
echo 'DATABASE_URL="file:./dev.db"' > .env.local
```

**For Local Development with Postgres:**
```bash
# Create .env.local file
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/revellio_dev"' > .env.local
```

**For Production (Vercel):**
Set these environment variables in Vercel:
- `DATABASE_URL` - Your Postgres connection string
- `POSTGRES_URL` - Same as DATABASE_URL (if needed)
- `PRISMA_DATABASE_URL` - Prisma Accelerate URL (optional, for better performance)
- `OPENAI_API_KEY` - Your OpenAI API key

5. Run database migrations:
```bash
# For local SQLite (if using file:./dev.db)
pnpm prisma migrate dev

# For Postgres (local or production)
pnpm prisma migrate deploy
```

6. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Configuration

### Local Development

**Option 1: SQLite (Fastest, Recommended)**
- No setup required
- Works offline
- Fast for development
- Set `DATABASE_URL="file:./dev.db"` in `.env.local`

**Option 2: Local Postgres**
- More similar to production
- Requires Postgres installation
- Set `DATABASE_URL="postgresql://..."` in `.env.local`

### Production (Vercel)

- **Required**: Postgres database
- Set `DATABASE_URL` to your Postgres connection string
- Optionally use `PRISMA_DATABASE_URL` for Prisma Accelerate

The application automatically detects the database type from `DATABASE_URL`:
- `file:` prefix → SQLite (local dev only)
- `postgres://` or `postgresql://` → Postgres

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm prisma migrate dev` - Create and apply migrations (development)
- `pnpm prisma migrate deploy` - Apply migrations (production)
- `pnpm prisma generate` - Generate Prisma Client
- `pnpm prisma studio` - Open Prisma Studio (database GUI)

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **AI:** OpenAI GPT-4o
- **Database:** PostgreSQL (production) / SQLite (local dev)
- **ORM:** Prisma
- **Package Manager:** pnpm

## Project Structure

```
revellio/
├── app/                           # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI endpoints
│   │   │   ├── data-mesh/        # Data mesh analysis endpoint
│   │   │   └── analyze/          # Visualization analysis endpoint
│   │   └── sessions/             # Session management endpoints
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-session.ts        # Session state management
│   │   ├── use-data-mesh.ts      # Data mesh processing logic
│   │   ├── use-visualization.ts  # Visualization processing logic
│   │   └── use-file-handling.ts  # File upload/parsing logic
│   ├── page.tsx                  # Main application page (orchestration)
│   └── layout.tsx                # Root layout
├── components/                    # React UI components
│   ├── features/                 # Feature-based components
│   │   ├── file-upload-section.tsx
│   │   ├── file-display-section.tsx
│   │   ├── metadata-display-section.tsx
│   │   ├── data-mesh-section.tsx
│   │   ├── visualization-section.tsx
│   │   ├── ai-analysis-overview.tsx
│   │   ├── technical-details-section.tsx
│   │   ├── main-content.tsx      # Main content router/orchestrator
│   │   └── session-header.tsx
│   ├── ui/                       # Reusable UI components
│   │   ├── error-display.tsx
│   │   └── collapsible-section.tsx
│   ├── data-mesh-visualization/  # Data mesh visualization components
│   ├── visualizations/            # Dynamic visualization components
│   ├── file-drop.tsx             # File upload component
│   ├── file-display.tsx          # File data display
│   ├── visualizer.tsx            # Main visualizer component
│   └── sidebar.tsx               # Session sidebar
├── lib/                           # Core functionality
│   ├── ai/                       # AI integration
│   │   ├── ai-service.ts         # AI service (OpenAI client)
│   │   └── prompts/              # AI prompt builders
│   ├── analysis/                 # Analysis logic (deterministic)
│   │   └── metadata-extractor.ts
│   ├── data/                     # Data processing
│   │   └── csv-parser.ts
│   ├── db/                       # Database
│   │   └── prisma.ts             # Prisma client (supports SQLite & Postgres)
│   ├── services/                 # Business logic services
│   │   └── session-service.ts    # Session database operations
│   ├── types/                    # TypeScript types
│   │   └── data.ts
│   └── utils/                    # Utility functions
│       ├── error-handling.ts     # Error handling utilities
│       └── ... (other utils)
├── docs/                          # Documentation
│   ├── workflow.md               # Workflow documentation
│   ├── main-page-architecture.md  # Main page architecture & MainContent explanation
│   ├── data-mesh-component.md
│   └── class-diagram.puml
├── public/                        # Static assets
│   └── examples/                 # Sample CSV files
└── Project-Spec.md               # Project specification
```

## Architecture

### Workflow Overview

Revellio follows a two-step AI-driven workflow that ensures users have control over relationship detection before visualization generation.

### Step-by-Step Process

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
   - User can reroll relations (find more or regenerate specific ones)
   ↓
4. Visualization Analysis (AI Step 2)
   - Edited relations passed to second AI run
   - AI determines best visualization methods
   - AI creates visualization strategy based on relations
   ↓
5. Visualizations Displayed
   - Dynamic visualizations rendered (bar, line, pie, scatter, table)
   - Based on AI recommendations
   - Leveraging the defined relations
   - User can regenerate visualizations with feedback
```

See [Workflow Documentation](./docs/workflow.md) for detailed information.

## For New Developers

### Where to Start Reading Code

**Entry Points:**
1. **`app/page.tsx`** - Main application page (orchestrates UI and hooks)
   - See [Main Page Architecture Documentation](./docs/main-page-architecture.md) for detailed explanation
2. **`app/hooks/use-session.ts`** - Session state management logic
3. **`lib/services/session-service.ts`** - Database operations for sessions

**Core Modules:**
1. **Data Processing**: `lib/data/csv-parser.ts` - Parses CSV files
2. **AI Integration**: `lib/ai/ai-service.ts` - OpenAI API client
3. **Visualization**: `components/visualizer.tsx` - Renders AI-generated visualizations
4. **Data Mesh**: `components/data-mesh-visualization.tsx` - Interactive relation visualization and editing

**Key Flows:**
1. **File Upload → Parse → Extract Metadata**:
   - `components/features/file-upload-section.tsx` → `lib/data/csv-parser.ts` → `lib/analysis/metadata-extractor.ts`

2. **Data Mesh Analysis**:
   - `app/hooks/use-data-mesh.ts` → `app/api/ai/data-mesh/route.ts` → `lib/ai/ai-service.ts`
   - Relations can be edited and rerolled via `components/data-mesh-visualization.tsx`

3. **Visualization Generation**:
   - `app/hooks/use-visualization.ts` → `app/api/ai/analyze/route.ts` → `lib/ai/ai-service.ts` → `components/visualizer.tsx`
   - Supports 5 visualization types: bar charts, line charts, pie charts, scatter plots, and data tables

### Code Organization Principles

- **Hooks** (`app/hooks/`) - Business logic and state management
- **Components** (`components/`) - UI presentation only
- **Services** (`lib/services/`) - Database and external API operations
- **Utils** (`lib/utils/`) - Reusable utility functions
- **Types** (`lib/types/`) - TypeScript type definitions

### Naming Conventions

- **Files**: kebab-case (e.g., `use-session.ts`, `file-drop.tsx`)
- **Components**: PascalCase (e.g., `FileDrop`, `DataMeshVisualization`)
- **Hooks**: camelCase with `use` prefix (e.g., `useSession`, `useDataMesh`)
- **Functions**: camelCase (e.g., `createSession`, `handleFileUpload`)
- **Types/Interfaces**: PascalCase (e.g., `SessionState`, `CSVData`)

### Error Handling

All errors are handled consistently using utilities from `lib/utils/error-handling.ts`:
- `getErrorMessage()` - Extract error message from any error type
- `extractApiError()` - Extract error from API responses
- All errors are typed and logged appropriately

### Testing & Building

```bash
# Run type checking
pnpm exec tsc --noEmit

# Run linter
pnpm run lint

# Build for production
pnpm run build

# Start development server
pnpm dev
```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [pnpm Documentation](https://pnpm.io)
- [Prisma Documentation](https://www.prisma.io/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**Important**: Set these environment variables in Vercel:
- `DATABASE_URL` - Your Postgres connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `PRISMA_DATABASE_URL` - (Optional) Prisma Accelerate URL for better performance

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
