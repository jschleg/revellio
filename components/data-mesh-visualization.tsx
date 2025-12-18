"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { DataMeshOutput, DataMeshRelation, CSVData } from "@/lib/types/data";
import { CanvasControls } from "./data-mesh-visualization/CanvasControls";
import { RelationLines } from "./data-mesh-visualization/RelationLines";
import { RelationTooltip } from "./data-mesh-visualization/RelationTooltip";
import { DataHierarchy } from "./data-mesh-visualization/DataHierarchy";
import { EditRelationModal } from "./data-mesh-visualization/EditRelationModal";
import { RelationsList } from "./data-mesh-visualization/RelationsList";

interface DataMeshVisualizationProps {
  dataMeshOutput: DataMeshOutput;
  csvData: CSVData[];
  onUpdateRelations?: (relations: DataMeshRelation[]) => void;
  onRerollRelation?: (index: number, feedback: string) => Promise<void>;
}

interface ElementPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function DataMeshVisualization({
  dataMeshOutput,
  csvData,
  onUpdateRelations,
  onRerollRelation,
}: DataMeshVisualizationProps) {
  // State
  const [selectedRelations, setSelectedRelations] = useState<Set<number>>(new Set());
  const [hoveredRelation, setHoveredRelation] = useState<number | null>(null);
  const [editingRelation, setEditingRelation] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedExplanation, setEditedExplanation] = useState<string>("");
  const [editingConnectionPoint, setEditingConnectionPoint] = useState<number | null>(null);
  const [localRelations, setLocalRelations] = useState<DataMeshRelation[]>(dataMeshOutput.relations);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [positionsUpdateKey, setPositionsUpdateKey] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const elementPositionsRef = useRef<Map<string, ElementPosition>>(new Map());

  // Sync local relations with prop changes (using requestAnimationFrame to avoid sync setState)
  useEffect(() => {
    const relationsChanged = JSON.stringify(localRelations) !== JSON.stringify(dataMeshOutput.relations);
    if (relationsChanged) {
      const rafId = requestAnimationFrame(() => {
        setLocalRelations(dataMeshOutput.relations);
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [dataMeshOutput.relations]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper functions
  const getElementId = useCallback((file: string, column?: string, rowIndex?: number): string => {
    if (rowIndex !== undefined && column) {
      return `${file}::${column}::row${rowIndex}`;
    }
    if (column) {
      return `${file}::${column}`;
    }
    return file;
  }, []);

  const getFiles = useMemo((): string[] => {
    const fileSet = new Set<string>();
    localRelations.forEach((rel) => {
      rel.elements.forEach((element) => {
        fileSet.add(element.source.file);
      });
    });
    csvData.forEach((data) => fileSet.add(data.fileName));
    return Array.from(fileSet);
  }, [localRelations, csvData]);

  const getColumnsForFile = useCallback((fileName: string): string[] => {
    const data = csvData.find((d) => d.fileName === fileName);
    return data?.columns || [];
  }, [csvData]);

  const getRowsForFile = useCallback((fileName: string): number[] => {
    const data = csvData.find((d) => d.fileName === fileName);
    if (!data) return [];
    return Array.from({ length: data.rows.length }, (_, i) => i);
  }, [csvData]);

  const getRowValue = useCallback((fileName: string, column: string, rowIndex: number): string => {
    const data = csvData.find((d) => d.fileName === fileName);
    if (!data || !data.rows[rowIndex]) return "";
    const value = data.rows[rowIndex][column];
    if (value === null || value === undefined) return "";
    return String(value);
  }, [csvData]);

  // Relation management
  const toggleRelation = useCallback((index: number) => {
    setSelectedRelations((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const openEditWindow = useCallback((index: number) => {
    const relation = localRelations[index];
    setEditingRelation(index);
    setEditedTitle(relation.title);
    setEditedExplanation(relation.relationExplanation);
    setEditingConnectionPoint(null);
  }, [localRelations]);

  const closeEditWindow = useCallback(() => {
    setEditingRelation(null);
    setEditedTitle("");
    setEditedExplanation("");
    setEditingConnectionPoint(null);
  }, []);

  const saveEditedRelation = useCallback(() => {
    if (editingRelation === null) return;
    
    const updatedRelations = [...localRelations];
    updatedRelations[editingRelation] = {
      ...updatedRelations[editingRelation],
      title: editedTitle,
      relationExplanation: editedExplanation,
    };
    
    setLocalRelations(updatedRelations);
    if (onUpdateRelations) {
      onUpdateRelations(updatedRelations);
    }
    closeEditWindow();
  }, [editingRelation, localRelations, editedTitle, editedExplanation, onUpdateRelations, closeEditWindow]);

  const removeRelation = useCallback(() => {
    if (editingRelation === null) return;
    
    const updatedRelations = localRelations.filter((_, index) => index !== editingRelation);
    setLocalRelations(updatedRelations);
    
    if (onUpdateRelations) {
      onUpdateRelations(updatedRelations);
    }
    
    setSelectedRelations((prev) => {
      const next = new Set(prev);
      next.delete(editingRelation);
      return next;
    });
    closeEditWindow();
  }, [editingRelation, localRelations, onUpdateRelations, closeEditWindow]);

  const handleElementClick = useCallback((
    file: string,
    column?: string,
    rowIndex?: number,
    e?: React.MouseEvent
  ) => {
    if (editingRelation === null || editingConnectionPoint === null) return;
    
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const updatedRelations = [...localRelations];
    const relation = updatedRelations[editingRelation];
    const newSource = {
      file,
      ...(column && { column }),
      ...(rowIndex !== undefined && { rowIndex }),
    };
    
    const newElementName = column
      ? (rowIndex !== undefined ? `${file}::${column}::row${rowIndex + 1}` : `${file}::${column}`)
      : file;
    
    // Update the element at the specified index
    const updatedElements = [...relation.elements];
    updatedElements[editingConnectionPoint] = {
      name: newElementName,
      source: newSource,
    };
    
    updatedRelations[editingRelation] = {
      ...relation,
      elements: updatedElements,
    };
    
    setLocalRelations(updatedRelations);
    setEditingConnectionPoint(null);
  }, [editingRelation, editingConnectionPoint, localRelations]);

  // Canvas controls
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      canvasRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setZoomLevel(1);
    if (canvasRef.current) {
      canvasRef.current.scrollLeft = 0;
      canvasRef.current.scrollTop = 0;
    }
  }, []);

  // Canvas drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a, svg, path, [data-element-id]')) return;
    
    setIsDragging(true);
    if (!canvasRef.current) return;
    setDragStart({
      x: e.clientX + canvasRef.current.scrollLeft,
      y: e.clientY + canvasRef.current.scrollTop,
    });
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    const newX = dragStart.x - e.clientX;
    const newY = dragStart.y - e.clientY;
    canvasRef.current.scrollLeft = newX;
    canvasRef.current.scrollTop = newY;
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Position calculation
  const getElementPosition = useCallback((
    file: string,
    column?: string,
    rowIndex?: number
  ): ElementPosition | null => {
    const id = getElementId(file, column, rowIndex);
    return elementPositionsRef.current.get(id) || null;
  }, [getElementId]);

  const getRelationPaths = useCallback((relation: DataMeshRelation): string[] => {
    const paths: string[] = [];
    
    // Get positions for all elements in the relation
    const positions = relation.elements.map(element => 
      getElementPosition(
        element.source.file,
        element.source.column,
        element.source.rowIndex
      )
    ).filter((pos): pos is ElementPosition => pos !== null);
    
    // If we don't have at least 2 valid positions, return empty array
    if (positions.length < 2) return [];
    
    // Create paths between all pairs of elements in the relation
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const pos1 = positions[i];
        const pos2 = positions[j];
        
        const x1 = pos1.x + pos1.width / 2;
        const y1 = pos1.y + pos1.height / 2;
        const x2 = pos2.x + pos2.width / 2;
        const y2 = pos2.y + pos2.height / 2;
        
        const dx = x2 - x1;
        const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);
        
        paths.push(`M ${x1} ${y1} C ${x1 + controlOffset} ${y1} ${x2 - controlOffset} ${y2} ${x2} ${y2}`);
      }
    }
    
    return paths;
  }, [getElementPosition]);

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

  // Calculate positions for elements
  const updatePositions = useCallback(() => {
    if (!containerRef.current) return;

    const positions = new Map<string, ElementPosition>();
    const usedElementIds = new Set<string>();
    
    localRelations.forEach((relation) => {
      relation.elements.forEach((element) => {
        const id = element.source.rowIndex !== undefined && element.source.column
          ? getElementId(element.source.file, element.source.column, element.source.rowIndex)
          : element.source.column
          ? getElementId(element.source.file, element.source.column)
          : getElementId(element.source.file);
        usedElementIds.add(id);
      });
    });

    const allElements = containerRef.current.querySelectorAll('[data-element-id]');
    const containerRect = containerRef.current.getBoundingClientRect();
    
    Array.from(allElements).forEach((el) => {
      const elementId = (el as HTMLElement).getAttribute('data-element-id');
      if (elementId && usedElementIds.has(elementId)) {
        const htmlEl = el as HTMLElement;
        const elementRect = htmlEl.getBoundingClientRect();
        const x = (elementRect.left - containerRect.left) / zoomLevel;
        const y = (elementRect.top - containerRect.top) / zoomLevel;
        
        positions.set(elementId, {
          id: elementId,
          x,
          y,
          width: elementRect.width / zoomLevel,
          height: elementRect.height / zoomLevel,
        });
      }
    });

    elementPositionsRef.current = positions;
    // Force re-render of lines by updating key
    setPositionsUpdateKey((prev) => prev + 1);
  }, [zoomLevel, localRelations, getElementId]);

  // Update positions when zoom or relations change (using requestAnimationFrame to avoid sync setState)
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      updatePositions();
    });
    return () => cancelAnimationFrame(rafId);
  }, [updatePositions]);

  // Update positions on resize (debounced)
  useEffect(() => {
    if (!containerRef.current) return;

    let resizeTimeout: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updatePositions, 16);
    });

    resizeObserver.observe(containerRef.current);

    // Also update after DOM is ready
    const initTimeout1 = setTimeout(updatePositions, 50);
    const initTimeout2 = setTimeout(updatePositions, 200);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
      clearTimeout(initTimeout1);
      clearTimeout(initTimeout2);
    };
  }, [updatePositions]);

  // Wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel((prev) => Math.max(0.5, Math.min(3, prev + delta)));
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
      return () => canvas.removeEventListener("wheel", handleWheel);
    }
  }, []);

  // Fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const files = getFiles;
  const currentRelation = editingRelation !== null ? localRelations[editingRelation] : null;
  const relationStrokeColor = currentRelation
    ? getRelationColor(editingRelation!, selectedRelations.has(editingRelation!), false)
    : "";

  return (
    <div className="w-full space-y-4">
      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200/50 bg-blue-50/50 p-3 dark:border-blue-800/50 dark:bg-blue-950/30">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> This analysis uses 20 data points (rows) from each file to determine relations. This sample is sufficient for identifying relationships and connections between data elements.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-purple-200/50 bg-white/50 p-4 dark:border-purple-800/50 dark:bg-zinc-900/50">
        <h3 className="mb-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
          Summary
        </h3>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {dataMeshOutput.summary}
        </p>
      </div>

      {/* Visualization Container */}
      <div className="relative w-full">
        <CanvasControls
          zoomLevel={zoomLevel}
          isFullscreen={isFullscreen}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Draggable Scrollable Canvas */}
        <div
          ref={canvasRef}
          className={`relative overflow-auto rounded-lg border-2 border-purple-300/50 bg-gradient-to-br from-purple-50/40 to-purple-100/30 shadow-lg dark:border-purple-700/50 dark:from-purple-950/30 dark:to-purple-900/20 ${
            isFullscreen ? "fixed inset-4 z-50" : "h-[900px]"
          } ${isDragging ? "cursor-grabbing" : editingConnectionPoint ? "cursor-crosshair" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ zIndex: editingConnectionPoint ? 101 : undefined }}
        >
          {/* Tooltip */}
          {hoveredRelation !== null && (
            <RelationTooltip
              relation={localRelations[hoveredRelation]}
              position={tooltipPosition}
              color={getRelationColor(
                hoveredRelation,
                selectedRelations.has(hoveredRelation),
                true
              )}
            />
          )}

          <div
            ref={contentRef}
            className="origin-top-left transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
            }}
          >
            <div
              ref={containerRef}
              className="relative min-h-full min-w-full p-12"
              style={{ width: "max-content", height: "max-content" }}
            >
              <RelationLines
                key={positionsUpdateKey}
                relations={localRelations}
                selectedRelations={selectedRelations}
                hoveredRelation={hoveredRelation}
                onRelationHover={setHoveredRelation}
                onRelationClick={openEditWindow}
                onTooltipPositionUpdate={setTooltipPosition}
                getRelationPaths={getRelationPaths}
                getRelationColor={getRelationColor}
              />

              <DataHierarchy
                files={files}
                editingConnectionPoint={editingConnectionPoint}
                onElementClick={handleElementClick}
                getElementId={getElementId}
                getColumnsForFile={getColumnsForFile}
                getRowsForFile={getRowsForFile}
                getRowValue={getRowValue}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Relation Modal */}
      {editingRelation !== null && currentRelation && (
        <EditRelationModal
          relation={currentRelation}
          editedTitle={editedTitle}
          editedExplanation={editedExplanation}
          editingConnectionPoint={editingConnectionPoint}
          strokeColor={relationStrokeColor}
          onClose={closeEditWindow}
          onSave={saveEditedRelation}
          onRemove={removeRelation}
          onTitleChange={setEditedTitle}
          onExplanationChange={setEditedExplanation}
          onConnectionPointEdit={setEditingConnectionPoint}
          onCancelSelection={() => setEditingConnectionPoint(null)}
        />
      )}

      {/* Relations List */}
      <RelationsList
        relations={localRelations}
        selectedRelations={selectedRelations}
        hoveredRelation={hoveredRelation}
        onRelationHover={setHoveredRelation}
        onRelationClick={openEditWindow}
        onToggleSelection={toggleRelation}
        onRemove={(index) => {
          const updatedRelations = localRelations.filter((_, i) => i !== index);
          setLocalRelations(updatedRelations);
          if (onUpdateRelations) {
            onUpdateRelations(updatedRelations);
          }
          setSelectedRelations((prev) => {
            const next = new Set(prev);
            next.delete(index);
            // Adjust indices for relations after the removed one
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
        }}
        onRerollRelation={onRerollRelation}
      />
    </div>
  );
}
