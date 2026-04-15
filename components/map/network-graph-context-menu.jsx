"use client";

export function NetworkGraphContextMenu({
  contextMenu,
  contextMenuRef,
  onAction,
}) {
  if (!contextMenu) return null;

  return (
    <div
      ref={contextMenuRef}
      className="fixed z-50 min-w-52 rounded-md border bg-popover p-1 shadow-lg"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      <div className="px-2 py-1 text-xs text-muted-foreground">
        {contextMenu.system.name}
      </div>
      <button
        type="button"
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
        onClick={() => onAction("create-relationship")}
      >
        Create Relationship
      </button>
      <button
        type="button"
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
        onClick={() => onAction("rename-node")}
      >
        Rename Node
      </button>
      <button
        type="button"
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
        onClick={() => onAction("edit-properties")}
      >
        Edit Properties
      </button>
      <button
        type="button"
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
        onClick={() => onAction("delete-node")}
      >
        Delete Node
      </button>
    </div>
  );
}
