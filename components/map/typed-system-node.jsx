"use client";

import { Handle, Position } from "@xyflow/react";
import { CONNECTION_TYPES } from "@/lib/constants";

const handleOffsets = CONNECTION_TYPES.map((connectionType, index) => ({
  type: connectionType.value,
  offset: `${((index + 1) * 100) / (CONNECTION_TYPES.length + 1)}%`,
}));

export function TypedSystemNode({ data }) {
  const isTopBottom = data.layoutDirection === "TB";
  const sourcePosition = isTopBottom ? Position.Bottom : Position.Right;
  const targetPosition = isTopBottom ? Position.Top : Position.Left;
  const hiddenHandleBase = { width: 6, height: 6, background: "transparent", border: "none" };
  const genericHandleStyle = {
    ...hiddenHandleBase,
    ...(isTopBottom ? { left: "50%" } : { top: "50%" }),
  };

  return (
    <div
      className="relative rounded-md px-4 py-2 text-center text-sm font-medium text-white"
      style={{
        background: data.color,
        minWidth: 180,
        opacity: data.dimmed ? 0.25 : 1,
        border: data.isMatch ? "2px solid #fff" : "none",
        boxShadow: data.isMatch ? `0 0 12px ${data.color}` : undefined,
      }}
    >
      {data.label}
      <Handle
        id="in-generic"
        type="target"
        position={targetPosition}
        style={genericHandleStyle}
      />
      <Handle
        id="out-generic"
        type="source"
        position={sourcePosition}
        style={genericHandleStyle}
      />
      {handleOffsets.map((handle) => (
        <Handle
          key={`target-${handle.type}`}
          id={`in-${handle.type}`}
          type="target"
          position={targetPosition}
          style={{
            ...hiddenHandleBase,
            ...(isTopBottom ? { left: handle.offset } : { top: handle.offset }),
          }}
        />
      ))}
      {handleOffsets.map((handle) => (
        <Handle
          key={`source-${handle.type}`}
          id={`out-${handle.type}`}
          type="source"
          position={sourcePosition}
          style={{
            ...hiddenHandleBase,
            ...(isTopBottom ? { left: handle.offset } : { top: handle.offset }),
          }}
        />
      ))}
    </div>
  );
}
