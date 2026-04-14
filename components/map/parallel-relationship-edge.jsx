"use client";

import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";

export function ParallelRelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  data,
  label,
  labelStyle,
}) {
  const parallelCount = data?.parallelCount ?? 1;
  const parallelIndex = data?.parallelIndex ?? 0;
  const center = (parallelCount - 1) / 2;
  const distanceFromCenter = parallelIndex - center;
  const lineOffset = distanceFromCenter * 12;

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.hypot(dx, dy) || 1;
  const normalX = -dy / length;
  const normalY = dx / length;

  const adjustedSourceX = sourceX + normalX * lineOffset;
  const adjustedSourceY = sourceY + normalY * lineOffset;
  const adjustedTargetX = targetX + normalX * lineOffset;
  const adjustedTargetY = targetY + normalY * lineOffset;

  const [path, labelX, labelY] = getBezierPath({
    sourceX: adjustedSourceX,
    sourceY: adjustedSourceY,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY,
    sourcePosition,
    targetPosition,
    curvature: 0.25,
  });

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      {label ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute rounded bg-background/90 px-1 py-0.5 text-[10px]"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "none",
              ...labelStyle,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
