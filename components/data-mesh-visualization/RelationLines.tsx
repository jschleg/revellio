"use client";

import type { DataMeshRelation } from "@/lib/types/data";

interface RelationLinesProps {
  relations: DataMeshRelation[];
  selectedRelations: Set<number>;
  hoveredRelation: number | null;
  onRelationHover: (index: number | null) => void;
  onRelationClick: (index: number) => void;
  onTooltipPositionUpdate: (position: { x: number; y: number }) => void;
  getRelationPaths: (relation: DataMeshRelation) => string[];
  getRelationColor: (index: number, isSelected: boolean, isHovered: boolean) => string;
}

export function RelationLines({
  relations,
  selectedRelations,
  hoveredRelation,
  onRelationHover,
  onRelationClick,
  onTooltipPositionUpdate,
  getRelationPaths,
  getRelationColor,
}: RelationLinesProps) {
  const handleMouseEnter = (index: number, e: React.MouseEvent) => {
    onRelationHover(index);
    updateTooltipPosition(e);
  };

  const handleMouseMove = (index: number, e: React.MouseEvent) => {
    if (hoveredRelation === index) {
      updateTooltipPosition(e);
    }
  };

  const updateTooltipPosition = (e: React.MouseEvent) => {
    // e.clientX and e.clientY are viewport coordinates
    // We need to find the canvas container and calculate relative position
    const svg = e.currentTarget.closest('svg');
    if (!svg) return;
    
    // Find the canvas container by traversing up the DOM
    // Structure: canvas (overflow-auto) -> contentRef (scaled) -> containerRef -> SVG
    let parent = svg.parentElement;
    let canvasContainer: HTMLElement | null = null;
    
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (style.overflow === 'auto' || style.overflowY === 'auto' || style.overflowX === 'auto') {
        canvasContainer = parent;
        break;
      }
      parent = parent.parentElement;
    }
    
    if (!canvasContainer) {
      // Fallback: use viewport coordinates directly
      onTooltipPositionUpdate({ x: e.clientX, y: e.clientY });
      return;
    }
    
    const canvasRect = canvasContainer.getBoundingClientRect();
    
    // Calculate position relative to canvas container
    // This accounts for scroll position automatically since getBoundingClientRect
    // returns the position relative to the viewport
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    onTooltipPositionUpdate({ x, y });
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: "100%",
        height: "100%",
        minWidth: "100%",
        minHeight: "100%",
        overflow: "visible",
        zIndex: 20,
      }}
    >
      {relations.map((relation, index) => {
        const paths = getRelationPaths(relation);
        if (paths.length === 0) return null;

        const isSelected = selectedRelations.has(index);
        const isHovered = hoveredRelation === index;
        // All lines in the same relation get the same color
        const strokeColor = getRelationColor(index, isSelected, isHovered);

        return (
          <g key={index} className="pointer-events-auto">
            {paths.map((path, pathIndex) => (
              <g key={pathIndex}>
                {/* Invisible wide hitbox path for easier hover/click */}
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={20}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  onMouseEnter={(e) => handleMouseEnter(index, e)}
                  onMouseMove={(e) => handleMouseMove(index, e)}
                  onMouseLeave={() => onRelationHover(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRelationClick(index);
                  }}
                  className="cursor-pointer"
                />
                {/* Background path for better visibility */}
                <path
                  d={path}
                  fill="none"
                  stroke="rgba(0, 0, 0, 0.15)"
                  strokeWidth={isSelected ? 8 : isHovered ? 7 : 6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.4}
                />
                {/* Main path */}
                <path
                  d={path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 5 : isHovered ? 4.5 : 4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isSelected ? 1 : isHovered ? 0.95 : 0.85}
                  onMouseEnter={(e) => handleMouseEnter(index, e)}
                  onMouseMove={(e) => handleMouseMove(index, e)}
                  onMouseLeave={() => onRelationHover(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRelationClick(index);
                  }}
                  className="cursor-pointer transition-all pointer-events-none"
                  style={{
                    filter: isSelected
                      ? "drop-shadow(0 0 6px rgba(147, 51, 234, 0.6))"
                      : isHovered
                      ? "drop-shadow(0 0 4px rgba(0, 0, 0, 0.3))"
                      : undefined,
                  }}
                />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

