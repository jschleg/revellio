"use client";

import { useState, useCallback } from "react";
import type React from "react";
import { Loader2, Zap } from "lucide-react";
import type { DataMeshOutput, DataMeshRelation, CSVData } from "@/lib/types/data";
import { DataMeshVisualization } from "@/components/data-mesh-visualization";
import { RelationActionModal } from "@/components/data-mesh-visualization/RelationActionModal";
import { RelationsListModal } from "@/components/data-mesh-visualization/RelationsListModal";
import { EditRelationModal } from "@/components/data-mesh-visualization/EditRelationModal";

interface DataMeshSectionProps {
  csvData: CSVData[];
  dataMeshPrompt: string;
  onDataMeshPromptChange: (prompt: string) => void;
  meshOutput: DataMeshOutput | null;
  isProcessing: boolean;
  step: string;
  onAnalyze: () => Promise<void>;
  onUpdateRelations: (relations: DataMeshRelation[]) => void;
  onReroll?: (existingRelations: DataMeshRelation[], feedback: string) => Promise<void>;
  onRerollRelation?: (index: number, feedback: string) => Promise<void>;
}

export function DataMeshSection({
  csvData,
  dataMeshPrompt,
  onDataMeshPromptChange,
  meshOutput,
  isProcessing,
  step,
  onAnalyze,
  onUpdateRelations,
  onReroll,
  onRerollRelation,
}: DataMeshSectionProps) {
  const [actionModal, setActionModal] = useState<{
    type: "add" | "regenerate" | "determine" | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });
  const [showRelationsModal, setShowRelationsModal] = useState(false);
  const [selectedRelations, setSelectedRelations] = useState<Set<number>>(new Set());
  const [hoveredRelation, setHoveredRelation] = useState<number | null>(null);
  const [editingRelation, setEditingRelation] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedExplanation, setEditedExplanation] = useState<string>("");
  const [editingConnectionPoint, setEditingConnectionPoint] = useState<number | null>(null);

  if (csvData.length === 0) {
    return null;
  }

  const handleAddRelation = () => {
    setActionModal({ type: "add", isOpen: true });
  };

  const handleRegenerateRelations = () => {
    setActionModal({ type: "regenerate", isOpen: true });
  };

  const handleDetermineRelations = () => {
    setActionModal({ type: "determine", isOpen: true });
  };

  const handleShowRelations = () => {
    setShowRelationsModal(true);
  };

  const handleRelationClick = (index: number) => {
    if (!meshOutput) return;
    const relation = meshOutput.relations[index];
    setEditingRelation(index);
    setEditedTitle(relation.title);
    setEditedExplanation(relation.relationExplanation);
    setEditingConnectionPoint(null);
    // Close relations list modal when opening edit
    setShowRelationsModal(false);
  };

  const closeEditModal = useCallback(() => {
    setEditingRelation(null);
    setEditedTitle("");
    setEditedExplanation("");
    setEditingConnectionPoint(null);
  }, []);

  const handleSaveEditedRelation = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (editingRelation === null || !meshOutput) return;
    
    const updatedRelations = [...meshOutput.relations];
    updatedRelations[editingRelation] = {
      ...updatedRelations[editingRelation],
      title: editedTitle,
      relationExplanation: editedExplanation,
    };
    
    onUpdateRelations(updatedRelations);
    closeEditModal();
  }, [editingRelation, meshOutput, editedTitle, editedExplanation, onUpdateRelations, closeEditModal]);

  const handleRemoveFromEdit = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (editingRelation === null || !meshOutput) return;
    
    const updatedRelations = meshOutput.relations.filter((_, index) => index !== editingRelation);
    onUpdateRelations(updatedRelations);
    
    setSelectedRelations((prev) => {
      const next = new Set(prev);
      next.delete(editingRelation);
      const adjusted = new Set<number>();
      next.forEach((idx) => {
        if (idx > editingRelation) {
          adjusted.add(idx - 1);
        } else {
          adjusted.add(idx);
        }
      });
      return adjusted;
    });
    closeEditModal();
  }, [editingRelation, meshOutput, onUpdateRelations, closeEditModal]);

  const getRelationColor = useCallback((index: number, isSelected: boolean, isHovered: boolean): string => {
    if (isSelected) return "rgb(147, 51, 234)";
    if (isHovered) return "rgb(168, 85, 247)";
    
    const colors = [
      "rgb(59, 130, 246)",   // blue-500
      "rgb(34, 197, 94)",    // green-500
      "rgb(239, 68, 68)",    // red-500
      "rgb(251, 146, 60)",   // orange-500
      "rgb(168, 85, 247)",   // purple-400
      "rgb(236, 72, 153)",   // pink-500
      "rgb(139, 92, 246)",   // violet-500
      "rgb(20, 184, 166)",   // teal-500
    ];
    return colors[index % colors.length];
  }, []);

  const handleToggleSelection = (index: number) => {
    setSelectedRelations((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleRemoveRelation = useCallback((index: number) => {
    if (!meshOutput) return;
    const updatedRelations = meshOutput.relations.filter((_, i) => i !== index);
    onUpdateRelations(updatedRelations);
    setSelectedRelations((prev) => {
      const next = new Set(prev);
      next.delete(index);
      const adjusted = new Set<number>();
      next.forEach((idx) => {
        if (idx > index) {
          adjusted.add(idx - 1);
        } else {
          adjusted.add(idx);
        }
      });
      return adjusted;
    });
    // Close edit modal if the deleted relation was being edited
    if (editingRelation === index) {
      closeEditModal();
    }
  }, [meshOutput, onUpdateRelations, editingRelation, closeEditModal]);

  const handleModalClose = () => {
    setActionModal({ type: null, isOpen: false });
  };

  const handleAddRelationSubmit = async (feedback: string) => {
    // TODO: Implement manual relation addition
    console.log("Add relation manually with feedback:", feedback);
    handleModalClose();
  };

  const handleRegenerateSubmit = async (feedback: string) => {
    if (onReroll && meshOutput) {
      await onReroll(meshOutput.relations, feedback);
      handleModalClose();
    }
  };

  const handleDetermineSubmit = async (feedback: string) => {
    // TODO: Implement deterministic relation determination
    console.log("Determine relations deterministically with feedback:", feedback);
    handleModalClose();
  };

  const getModalConfig = () => {
    switch (actionModal.type) {
      case "add":
        return {
          title: "Add Relation Manually (Coming soon)",
          placeholder: "Describe the relation you want to add manually...",
          submitLabel: "Add Relation",
          onSubmit: handleAddRelationSubmit,
        };
      case "regenerate":
        return {
          title: "Regenerate Relations with AI",
          placeholder: "Describe what additional relations you'd like to see. Current relations will be kept, and new ones will be generated based on your input...",
          submitLabel: "Regenerate",
          onSubmit: handleRegenerateSubmit,
        };
      case "determine":
        return {
          title: "Determine Relations Deterministically  (Coming soon)",
          placeholder: "This feature is coming soon. Describe how you'd like relations to be determined...",
          submitLabel: "Determine",
          onSubmit: handleDetermineSubmit,
        };
      default:
        return null;
    }
  };

  const modalConfig = getModalConfig();

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white dark:bg-indigo-500">
          1
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Step 1: Data Mesh Analysis
        </h2>
      </div>
      <p className="ml-11 text-sm text-zinc-700 dark:text-zinc-300">
        Analyze relationships between your data files. Edit and refine relations before
        proceeding to visualization analysis.
      </p>

      <div className="ml-11 rounded-xl border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Additional Context (optional)
        </h3>
        <textarea
          value={dataMeshPrompt}
          onChange={(e) => onDataMeshPromptChange(e.target.value)}
          placeholder="Describe what relationships you expect to find, specific connections to look for, or any domain-specific context..."
          className="w-full rounded-lg border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          rows={3}
        />
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          This context helps the AI identify relevant relationships and connections in your
          data.
        </p>
      </div>

      <div className="ml-11">
        <button
          onClick={onAnalyze}
          disabled={isProcessing}
          className="group relative rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:via-indigo-800 hover:to-indigo-900 hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 dark:from-indigo-500 dark:via-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-600 dark:hover:via-indigo-700 dark:hover:to-indigo-800"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing Data Mesh...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <Zap className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>Analyze Data Mesh</span>
            </span>
          )}
        </button>
      </div>

      {meshOutput && (
        <div className="mb-8 space-y-4">
          <div className="rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 to-white/60 backdrop-blur-sm p-6 shadow-sm dark:border-indigo-800/80 dark:from-indigo-950/40 dark:to-zinc-900/60">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Data Mesh Network
                </h2>
                <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                  ({meshOutput.relations.length} relations)
                </span>
              </div>
            </div>

            <DataMeshVisualization
              dataMeshOutput={meshOutput}
              csvData={csvData}
              onUpdateRelations={onUpdateRelations}
              onRerollRelation={onRerollRelation}
              onRelationHover={setHoveredRelation}
              onRelationClick={handleRelationClick}
              selectedRelations={selectedRelations}
              onToggleSelection={handleToggleSelection}
              onAddRelation={handleAddRelation}
              onRegenerateRelations={handleRegenerateRelations}
              onDetermineRelations={handleDetermineRelations}
              onShowRelations={handleShowRelations}
            />
          </div>
        </div>
      )}

      {isProcessing && step && (
        <div className="ml-11 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/60 to-white/60 backdrop-blur-sm p-4 shadow-sm dark:border-indigo-800/80 dark:from-indigo-950/40 dark:to-zinc-900/60">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            <div className="flex-1">
              <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                Data Mesh Analysis in Progress
              </p>
              <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">{step}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {modalConfig && (
        <RelationActionModal
          isOpen={actionModal.isOpen}
          onClose={handleModalClose}
          onSubmit={modalConfig.onSubmit}
          title={modalConfig.title}
          placeholder={modalConfig.placeholder}
          submitLabel={modalConfig.submitLabel}
          isLoading={isProcessing}
        />
      )}

      {/* Relations List Modal */}
      {meshOutput && (
        <RelationsListModal
          isOpen={showRelationsModal}
          onClose={() => setShowRelationsModal(false)}
          relations={meshOutput.relations}
          selectedRelations={selectedRelations}
          hoveredRelation={hoveredRelation}
          onRelationHover={setHoveredRelation}
          onRelationClick={handleRelationClick}
          onToggleSelection={handleToggleSelection}
          onRemove={handleRemoveRelation}
          onRerollRelation={onRerollRelation}
        />
      )}

      {/* Edit Relation Modal */}
      {meshOutput && editingRelation !== null && (
        <EditRelationModal
          relation={meshOutput.relations[editingRelation]}
          editedTitle={editedTitle}
          editedExplanation={editedExplanation}
          editingConnectionPoint={editingConnectionPoint}
          strokeColor={getRelationColor(
            editingRelation,
            selectedRelations.has(editingRelation),
            false
          )}
          onClose={closeEditModal}
          onSave={handleSaveEditedRelation}
          onRemove={handleRemoveFromEdit}
          onTitleChange={setEditedTitle}
          onExplanationChange={setEditedExplanation}
          onConnectionPointEdit={setEditingConnectionPoint}
          onCancelSelection={() => setEditingConnectionPoint(null)}
        />
      )}
    </div>
  );
}

