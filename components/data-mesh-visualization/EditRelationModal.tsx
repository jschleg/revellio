"use client";

import { X, Trash2, Save, Pencil } from "lucide-react";
import type { DataMeshRelation } from "@/lib/types/data";
import { SelectionModeIndicator } from "./SelectionModeIndicator";

interface EditRelationModalProps {
  relation: DataMeshRelation;
  relationIndex: number;
  editedTitle: string;
  editedExplanation: string;
  editingConnectionPoint: number | null;
  strokeColor: string;
  onClose: () => void;
  onSave: () => void;
  onRemove: () => void;
  onTitleChange: (value: string) => void;
  onExplanationChange: (value: string) => void;
  onConnectionPointEdit: (point: number | null) => void;
  onCancelSelection: () => void;
}

export function EditRelationModal({
  relation,
  relationIndex: _relationIndex,
  editedTitle,
  editedExplanation,
  editingConnectionPoint,
  strokeColor,
  onClose,
  onSave,
  onRemove,
  onTitleChange,
  onExplanationChange,
  onConnectionPointEdit,
  onCancelSelection,
}: EditRelationModalProps) {
  return (
    <>
      {/* Selection Mode Indicator */}
      {editingConnectionPoint !== null && (
        <SelectionModeIndicator
          connectionPoint={`element${editingConnectionPoint + 1}`}
          onCancel={onCancelSelection}
        />
      )}

      {/* Edit Panel - hidden during selection mode */}
      {!editingConnectionPoint && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <div
            className="relative w-full max-w-2xl rounded-xl border-2 border-purple-500 bg-white p-6 shadow-2xl dark:border-purple-400 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: strokeColor }}
                ></div>
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200">
                  Edit Relation
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Connection Points */}
            <div className="mb-4 space-y-3">
              <div className="text-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-purple-900 dark:text-purple-200">
                    Elements ({relation.elements.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {relation.elements.map((element, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg border-2 border-purple-300 bg-purple-50/50 p-3 dark:border-purple-700 dark:bg-purple-900/20"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white dark:bg-purple-500">
                            {element.name}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Element {index + 1}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          {element.source.file}
                          {element.source.column && ` / ${element.source.column}`}
                          {element.source.rowIndex !== undefined &&
                            ` / Row ${element.source.rowIndex + 1}`}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          onConnectionPointEdit(
                            editingConnectionPoint === index ? null : index
                          )
                        }
                        className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                          editingConnectionPoint === index
                            ? "bg-purple-600 text-white dark:bg-purple-500"
                            : "bg-white text-purple-600 hover:bg-purple-100 dark:bg-zinc-800 dark:text-purple-400 dark:hover:bg-zinc-700"
                        }`}
                        title="Click to edit, then select an element from the view"
                      >
                        <Pencil className="h-3 w-3" />
                        {editingConnectionPoint === index ? "Selecting..." : "Edit"}
                      </button>
                    </div>
                  ))}
                </div>
                {relation.elements.length > 1 && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                    {Array.from({ length: relation.elements.length - 1 }, (_, i) => (
                      <span key={i}>↔</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Fields */}
            <div className="mb-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Relation Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-purple-400"
                  placeholder="Enter relation title..."
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Relation Explanation
                </label>
                <textarea
                  value={editedExplanation}
                  onChange={(e) => onExplanationChange(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-purple-400"
                  rows={4}
                  placeholder="Enter relation explanation..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onRemove}
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="flex items-center gap-2 rounded-lg border border-purple-500 bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 dark:border-purple-400 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

