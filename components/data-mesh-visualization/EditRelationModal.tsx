"use client";

import { X, Trash2, Save, Pencil } from "lucide-react";
import type { DataMeshRelation } from "@/lib/types/data";
import { SelectionModeIndicator } from "./SelectionModeIndicator";

interface EditRelationModalProps {
  relation: DataMeshRelation;
  relationIndex: number;
  editedExplanation: string;
  editingConnectionPoint: "element1" | "element2" | null;
  strokeColor: string;
  onClose: () => void;
  onSave: () => void;
  onRemove: () => void;
  onExplanationChange: (value: string) => void;
  onConnectionPointEdit: (point: "element1" | "element2" | null) => void;
  onCancelSelection: () => void;
}

export function EditRelationModal({
  relation,
  relationIndex,
  editedExplanation,
  editingConnectionPoint,
  strokeColor,
  onClose,
  onSave,
  onRemove,
  onExplanationChange,
  onConnectionPointEdit,
  onCancelSelection,
}: EditRelationModalProps) {
  return (
    <>
      {/* Selection Mode Indicator */}
      {editingConnectionPoint && (
        <SelectionModeIndicator
          connectionPoint={editingConnectionPoint}
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
              <div className="flex items-center gap-2 text-sm">
                <div className="flex-1 rounded-lg border-2 border-purple-300 bg-purple-50/50 p-3 dark:border-purple-700 dark:bg-purple-900/20">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-purple-900 dark:text-purple-200">
                      Element 1 (Source)
                    </span>
                    <button
                      onClick={() =>
                        onConnectionPointEdit(
                          editingConnectionPoint === "element1" ? null : "element1"
                        )
                      }
                      className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                        editingConnectionPoint === "element1"
                          ? "bg-purple-600 text-white dark:bg-purple-500"
                          : "bg-white text-purple-600 hover:bg-purple-100 dark:bg-zinc-800 dark:text-purple-400 dark:hover:bg-zinc-700"
                      }`}
                      title="Click to edit, then select an element from the view"
                    >
                      <Pencil className="h-3 w-3" />
                      {editingConnectionPoint === "element1" ? "Selecting..." : "Edit"}
                    </button>
                  </div>
                  <div className="rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white dark:bg-purple-500">
                    {relation.element1}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {relation.element1Source.file}
                    {relation.element1Source.column && ` / ${relation.element1Source.column}`}
                    {relation.element1Source.rowIndex !== undefined &&
                      ` / Row ${relation.element1Source.rowIndex + 1}`}
                  </div>
                </div>
                <span className="text-purple-600 dark:text-purple-400">↔</span>
                <div className="flex-1 rounded-lg border-2 border-purple-300 bg-purple-50/50 p-3 dark:border-purple-700 dark:bg-purple-900/20">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-purple-900 dark:text-purple-200">
                      Element 2 (Target)
                    </span>
                    <button
                      onClick={() =>
                        onConnectionPointEdit(
                          editingConnectionPoint === "element2" ? null : "element2"
                        )
                      }
                      className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                        editingConnectionPoint === "element2"
                          ? "bg-purple-600 text-white dark:bg-purple-500"
                          : "bg-white text-purple-600 hover:bg-purple-100 dark:bg-zinc-800 dark:text-purple-400 dark:hover:bg-zinc-700"
                      }`}
                      title="Click to edit, then select an element from the view"
                    >
                      <Pencil className="h-3 w-3" />
                      {editingConnectionPoint === "element2" ? "Selecting..." : "Edit"}
                    </button>
                  </div>
                  <div className="rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white dark:bg-purple-500">
                    {relation.element2}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {relation.element2Source.file}
                    {relation.element2Source.column && ` / ${relation.element2Source.column}`}
                    {relation.element2Source.rowIndex !== undefined &&
                      ` / Row ${relation.element2Source.rowIndex + 1}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Field */}
            <div className="mb-4">
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

