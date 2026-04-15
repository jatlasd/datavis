"use client";

import { CONNECTION_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function NetworkGraphRelationshipFlow({
  relationshipSource,
  relationshipTarget,
  relationshipTypeMenuPos,
  relationshipTypeMenuRef,
  onCancel,
  onSelectType,
}) {
  return (
    <>
      {relationshipSource && (
        <div className="absolute left-3 top-3 z-40 flex items-center gap-2 rounded-md border bg-background/95 px-3 py-2 text-sm shadow-sm">
          <span>
            Creating relationship from <strong>{relationshipSource.name}</strong>.
            {" "}Click a target node.
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}

      {relationshipSource && relationshipTarget && (
        <div
          ref={relationshipTypeMenuRef}
          className="fixed z-50 min-w-64 rounded-md border bg-popover p-1 shadow-lg"
          style={{ left: relationshipTypeMenuPos.x, top: relationshipTypeMenuPos.y }}
        >
          <div className="px-2 py-1 text-xs text-muted-foreground">
            {relationshipSource.name} &rarr; {relationshipTarget.name}
          </div>
          {CONNECTION_TYPES.map((connectionType) => (
            <button
              key={connectionType.value}
              type="button"
              className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
              onClick={() => onSelectType(connectionType.value)}
            >
              <div>{connectionType.label}</div>
              <div className="text-xs text-muted-foreground">
                {connectionType.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
