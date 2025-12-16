"use client";

import { Loader2, Save, Menu } from "lucide-react";

interface SessionHeaderProps {
  sessionName: string;
  onSessionNameChange: (name: string) => void;
  onSessionNameBlur: () => void;
  isSaving: boolean;
  onManualSave: () => Promise<void>;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  isProcessing: boolean;
}

export function SessionHeader({
  sessionName,
  onSessionNameChange,
  onSessionNameBlur,
  isSaving,
  onManualSave,
  isSidebarCollapsed,
  onToggleSidebar,
  isProcessing,
}: SessionHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            {isSidebarCollapsed && (
              <button
                onClick={onToggleSidebar}
                className="flex items-center justify-center rounded-lg p-2 text-zinc-700 transition-colors hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                title="Sidebar anzeigen"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent dark:from-purple-400 dark:via-purple-300 dark:to-purple-400">
              Revellio
            </h1>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => onSessionNameChange(e.target.value)}
              onBlur={onSessionNameBlur}
              className="mt-2 rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-100"
              placeholder="Session Name"
            />
            {isSaving && (
              <span className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Speichere...
              </span>
            )}
            <button
              onClick={onManualSave}
              disabled={isSaving || isProcessing}
              className="flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-100 dark:hover:bg-zinc-800/80"
              title={
                isProcessing
                  ? "Speichern während der Verarbeitung nicht möglich"
                  : "Session speichern"
              }
            >
              <Save className="h-4 w-4" />
              Speichern
            </button>
          </div>
        </div>
      </div>
      <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
        AI-powered analysis and visualization tool
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Upload CSV files and analyze them with AI
      </p>
    </div>
  );
}

