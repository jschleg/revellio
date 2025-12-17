"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Database,
  Network,
  BarChart3,
  Settings,
} from "lucide-react";

interface Session {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    csvFiles: number;
  };
}

export type NavigationSection = "data" | "data-mesh" | "visualizations" | "technical";

interface SidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onSessionDelete: (sessionId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  refreshTrigger?: number; // Trigger to refresh the sessions list
  activeSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
}

const navigationItems: Array<{
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "data", label: "Data & Files", icon: Database },
  { id: "data-mesh", label: "Data Mesh", icon: Network },
  { id: "visualizations", label: "Visualizations", icon: BarChart3 },
  { id: "technical", label: "Technical Details", icon: Settings },
];

export function Sidebar({
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onSessionDelete,
  isCollapsed,
  onToggleCollapse,
  refreshTrigger,
  activeSection,
  onSectionChange,
}: SidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [refreshTrigger]); // Reload when refreshTrigger changes

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Möchten Sie diese Session wirklich löschen?")) {
      return;
    }

    try {
      setDeletingId(sessionId);
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Reload sessions to get updated list
        await loadSessions();
        // Call the delete handler from parent
        onSessionDelete(sessionId);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        alert(`Fehler beim Löschen: ${errorData.error || "Unbekannter Fehler"}`);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Fehler beim Löschen der Session");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Gerade eben";
    if (diffMins < 60) return `Vor ${diffMins} Min.`;
    if (diffHours < 24) return `Vor ${diffHours} Std.`;
    if (diffDays < 7) return `Vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`;
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isCollapsed) {
    return (
      <div className="flex h-screen w-12 flex-col border-r border-zinc-200/80 bg-zinc-50/80 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <button
          onClick={onToggleCollapse}
          className="flex h-12 w-full items-center justify-center border-b border-zinc-200/80 transition-colors hover:bg-zinc-100/60 dark:border-zinc-800/80 dark:hover:bg-zinc-800/60"
          title="Sidebar erweitern"
        >
          <ChevronRight className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        </button>
        <div className="flex flex-col border-b border-zinc-200/80 dark:border-zinc-800/80">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`flex h-12 w-full items-center justify-center transition-colors hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 ${
                  isActive
                    ? "bg-gradient-to-b from-purple-100/80 to-purple-50/80 dark:from-purple-900/40 dark:to-purple-950/40"
                    : ""
                }`}
                title={item.label}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive
                      ? "text-purple-700 dark:text-purple-300"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-80 flex-col border-r border-zinc-200/80 bg-zinc-50/80 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/80 transition-all duration-300 shadow-sm">
      {/* Header */}
      <div className="border-b border-zinc-200/80 bg-white/40 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Sessions</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleCollapse}
              className="flex items-center justify-center rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
              title="Sidebar ausblenden"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNewSession}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow dark:from-purple-500 dark:to-purple-600 dark:hover:from-purple-600 dark:hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
              Neu
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-zinc-200/80 bg-white/40 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/40">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Navigation
        </h3>
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-100/80 to-purple-50/80 text-purple-900 shadow-sm dark:from-purple-900/40 dark:to-purple-950/40 dark:text-purple-100"
                    : "text-zinc-700 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-zinc-800/40"
                }`}
              >
                <Icon
                  className={`h-4 w-4 flex-shrink-0 ${
                    isActive
                      ? "text-purple-700 dark:text-purple-300"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-2 px-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Sessions
          </h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <FolderOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Keine Sessions vorhanden</p>
            <p className="mt-1 text-xs">Erstellen Sie eine neue Session</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={`group relative flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-all ${
                  currentSessionId === session.id
                    ? "bg-gradient-to-r from-purple-100/80 to-purple-50/80 shadow-sm dark:from-purple-900/40 dark:to-purple-950/40"
                    : "hover:bg-white/60 dark:hover:bg-zinc-800/40"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className={`h-4 w-4 flex-shrink-0 ${
                      currentSessionId === session.id
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`} />
                    <h3
                      className={`truncate text-sm font-medium ${
                        currentSessionId === session.id
                          ? "text-purple-900 dark:text-purple-100"
                          : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {session.name}
                    </h3>
                  </div>
                  <div className={`mt-1 flex items-center gap-3 text-xs ${
                    currentSessionId === session.id
                      ? "text-purple-700/80 dark:text-purple-300/80"
                      : "text-zinc-600 dark:text-zinc-500"
                  }`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(session.updatedAt)}
                    </span>
                    {session._count && session._count.csvFiles > 0 && (
                      <span>{session._count.csvFiles} Datei{session._count.csvFiles !== 1 ? "en" : ""}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(session.id, e)}
                  disabled={deletingId === session.id}
                  className="opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                >
                  {deletingId === session.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-600 dark:text-red-400" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200/80 bg-white/40 p-4 text-xs text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-400">
        <p className="font-medium">{sessions.length} Session{sessions.length !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}

