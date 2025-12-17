"use client";

import { useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";

interface FeedbackPanelProps {
  onSubmit: (feedback: string) => void;
  onCancel: () => void;
  placeholder?: string;
  title?: string;
  showCancel?: boolean;
}

export function FeedbackPanel({
  onSubmit,
  onCancel,
  placeholder = "Provide feedback to improve the results...",
  title = "Provide Feedback",
  showCancel = true,
}: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback.trim());
      setFeedback("");
    }
  };

  return (
    <div className="rounded-lg border border-purple-200/50 bg-white/80 p-4 shadow-sm dark:border-purple-800/50 dark:bg-zinc-900/80">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-200">
            {title}
          </h4>
        </div>
        {showCancel && (
          <button
            onClick={onCancel}
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={placeholder}
        className="mb-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-purple-400"
        rows={3}
      />
      <div className="flex items-center justify-end gap-2">
        {showCancel && (
          <button
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!feedback.trim()}
          className="flex items-center gap-2 rounded-lg border border-purple-500 bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-400 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          <Send className="h-4 w-4" />
          Submit
        </button>
      </div>
    </div>
  );
}

