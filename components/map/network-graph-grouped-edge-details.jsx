"use client";

export function NetworkGraphGroupedEdgeDetails({
  groupedEdgeDetails,
  groupedEdgeDetailsRef,
  mutedEdgeColor,
  onOpenConnection,
}) {
  if (!groupedEdgeDetails) return null;

  return (
    <div
      ref={groupedEdgeDetailsRef}
      className="fixed z-50 min-w-64 rounded-md border bg-popover p-2 shadow-lg"
      style={{ left: groupedEdgeDetails.x, top: groupedEdgeDetails.y }}
    >
      <div className="mb-2 px-1 text-xs text-muted-foreground">
        {groupedEdgeDetails.sourceName} &rarr; {groupedEdgeDetails.targetName}
      </div>
      <div className="space-y-1">
        {groupedEdgeDetails.relationships.map((relationship) => (
          <button
            key={relationship.id}
            type="button"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-sm hover:bg-accent"
            onClick={() => onOpenConnection(relationship.id)}
          >
            <span
              className="inline-block size-2 rounded-full"
              style={{
                backgroundColor: relationship.isFilterMatch
                  ? relationship.color
                  : mutedEdgeColor,
              }}
            />
            <span
              className={
                relationship.isFilterMatch
                  ? "text-foreground"
                  : "text-muted-foreground"
              }
            >
              {relationship.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
