"use client";

export function NetworkGraphContextMenu({
  contextMenu,
  contextMenuRef,
  onAction,
}) {
  if (!contextMenu) return null;
  const {
    system,
    isHidden,
    isPinned,
    isIsolated,
    isSelected,
    selectedCount = 0,
    hiddenCount = 0,
  } = contextMenu;

  return (
    <div
      ref={contextMenuRef}
      className="fixed z-50 min-w-52 rounded-md border bg-popover p-1 shadow-lg"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      <div className="px-2 py-1 text-xs text-muted-foreground">
        {system.name}
      </div>
      {isHidden ? (
        <button
          type="button"
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          onClick={() => onAction("unhide-node")}
        >
          Unhide Node
        </button>
      ) : (
        <button
          type="button"
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          onClick={() => onAction("hide-node")}
        >
          {selectedCount > 1 && isSelected ? `Hide Selected (${selectedCount})` : "Hide Node"}
        </button>
      )}
      {hiddenCount > 0 && (
        <button
          type="button"
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          onClick={() => onAction("show-all-hidden")}
        >
          Show All Hidden ({hiddenCount})
        </button>
      )}
      {isPinned ? (
        <button
          type="button"
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          onClick={() => onAction("unpin-node")}
        >
          Unpin Node
        </button>
      ) : (
        <button
          type="button"
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          onClick={() => onAction("pin-node")}
        >
          {selectedCount > 1 && isSelected ? `Pin Selected (${selectedCount})` : "Pin Node"}
        </button>
      )}
      {isIsolated ? (
        <button
          type="button"
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          onClick={() => onAction("clear-isolate")}
        >
          Clear Isolate
        </button>
      ) : (
        <button
          type="button"
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          onClick={() => onAction("isolate-node")}
        >
          Isolate Node
        </button>
      )}
      {isSelected ? (
        <button
          type="button"
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          onClick={() => onAction("deselect-node")}
        >
          Deselect Node
        </button>
      ) : (
        <button
          type="button"
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          onClick={() => onAction("select-node")}
        >
          Select Node
        </button>
      )}
      {selectedCount > 0 && (
        <button
          type="button"
          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          onClick={() => onAction("clear-selection")}
        >
          Clear Selection
        </button>
      )}
      <div className="my-1 h-px bg-border" />
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
      <div className="my-1 h-px bg-border" />
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
