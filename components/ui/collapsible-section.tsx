"use client";

import { Eye, ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
  className?: string;
}

export function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
  icon,
  badge,
  className = "",
}: CollapsibleSectionProps) {
  return (
    <div className={`rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 ${className}`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
      >
        <div className="flex items-center gap-2">
          {icon || <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          {badge !== undefined && (
            <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
              ({badge})
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-zinc-200/80 p-6 dark:border-zinc-800/80">
          {children}
        </div>
      )}
    </div>
  );
}

