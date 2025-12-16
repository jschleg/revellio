"use client";

import type { DataMeshRelation } from "@/lib/types/data";

interface RelationLinesProps {
  relations: DataMeshRelation[];
  selectedRelations: Set<number>;
  hoveredRelation: number | null;
  onRelationHover: (index: number | null) => void;
  onRelationClick: (index: number) => void;
  onTooltipPositionUpdate: (position: { x: number; y: number }) => void;
  getRelationPath: (relation: DataMeshRelation) => string | null;
  getRelationColor: (index: number, isSelected: boolean, isHovered: boolean) => string;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function RelationLines({
  relations,
  selectedRelations,
  hoveredRelation,
  onRelationHover,
  onRelationClick,
  onTooltipPositionUpdate,
  getRelationPath,
  getRelationColor,
  canvasRef,
}: RelationLinesProps) {
  const handleMouseEnter = (index: number, e: React.MouseEvent) => {
    onRelationHover(index);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      onTooltipPositionUpdate({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (index: number, e: React.MouseEvent) => {
    if (hoveredRelation === index && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      onTooltipPositionUpdate({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
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
        const path = getRelationPath(relation);
        if (!path) return null;

        const isSelected = selectedRelations.has(index);
        const isHovered = hoveredRelation === index;
        const strokeColor = getRelationColor(index, isSelected, isHovered);

        return (
          <g key={index} className="pointer-events-auto">
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
              className="cursor-pointer transition-all"
              style={{
                filter: isSelected
                  ? "drop-shadow(0 0 6px rgba(147, 51, 234, 0.6))"
                  : isHovered
                  ? "drop-shadow(0 0 4px rgba(0, 0, 0, 0.3))"
                  : undefined,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

