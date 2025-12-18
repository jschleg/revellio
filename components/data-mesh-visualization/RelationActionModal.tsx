"use client";

import { X, Send } from "lucide-react";
import { useState } from "react";

interface RelationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  title: string;
  placeholder: string;
  submitLabel?: string;
  isLoading?: boolean;
}

export function RelationActionModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder,
  submitLabel = "Submit",
  isLoading = false,
}: RelationActionModalProps) {
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback.trim());
      setFeedback("");
    }
  };

  const handleClose = () => {
    setFeedback("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl border-2 border-purple-500 bg-white p-6 shadow-2xl dark:border-purple-400 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200">
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-purple-400"
            rows={6}
            disabled={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isLoading}
            className="flex items-center gap-2 rounded-lg border border-purple-500 bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-400 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            <Send className="h-4 w-4" />
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

