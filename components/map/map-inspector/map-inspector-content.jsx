"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { edgeSelection, emptyInspectorSelection } from "@/lib/map-inspector-selection";
import {
  CONNECTION_TYPES,
  getConnectionLabel,
  getConnectionType,
} from "@/lib/constants";
import { MUTED_EDGE_COLOR } from "@/lib/network-graph-layout";
import { useMapStore } from "@/store/use-map-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

function InspectorEmpty() {
  return (
    <div className="p-4">
      <p className="font-heading text-sm font-medium">Inspector</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Select a node or connection on the map.
      </p>
    </div>
  );
}

function NodeSection({
  systemId,
  hiddenNodeIds,
  pinnedNodeIds,
  isolatedNodeId,
  startRelationshipFromSystem,
  openSystemEdit,
  confirmDeleteSystem,
  hideNodes,
  unhideNode,
  pinNodes,
  unpinNode,
  isolateNode,
  clearIsolate,
}) {
  const domains = useMapStore((s) => s.domains);
  const categories = useMapStore((s) => s.categories);
  const toggleSystemCategory = useMapStore((s) => s.toggleSystemCategory);
  const getConnectionCount = useMapStore((s) => s.getConnectionCount);
  const getConnectionsForSystem = useMapStore((s) => s.getConnectionsForSystem);
  const systems = useMapStore((s) => s.systems);
  const system = useMapStore((s) => s.getSystem(systemId));

  const assignedDomains = useMemo(
    () =>
      domains.filter((d) => system && (system.domainIds || []).includes(d.id)),
    [domains, system]
  );
  const assignedCategories = useMemo(
    () =>
      categories.filter(
        (c) => system && (system.categoryIds || []).includes(c.id)
      ),
    [categories, system]
  );

  const connectionGroups = useMemo(() => {
    if (!system) return [];
    const conns = getConnectionsForSystem(system.id);
    const byLabel = new Map();
    for (const c of conns) {
      const otherId =
        c.sourceId === system.id ? c.targetId : c.sourceId;
      const other = systems.find((s) => s.id === otherId);
      if (!other) continue;
      const isSource = c.sourceId === system.id;
      const relationLabel = getConnectionLabel(c.type, isSource);
      if (!byLabel.has(relationLabel)) {
        byLabel.set(relationLabel, {
          relationLabel,
          typeValue: c.type,
          neighbors: [],
        });
      }
      byLabel.get(relationLabel).neighbors.push({
        connectionId: c.id,
        other,
      });
    }
    const groups = [...byLabel.values()].map((g) => {
      const byNeighborId = new Map();
      for (const n of g.neighbors) {
        if (!byNeighborId.has(n.other.id)) {
          byNeighborId.set(n.other.id, n);
        }
      }
      const neighbors = [...byNeighborId.values()].sort((a, b) =>
        a.other.name.localeCompare(b.other.name)
      );
      return { ...g, neighbors };
    });
    groups.sort((a, b) => a.relationLabel.localeCompare(b.relationLabel));
    return groups;
  }, [getConnectionsForSystem, system, systems]);

  if (!system) {
    return (
      <div className="p-4 text-xs text-muted-foreground">System not found.</div>
    );
  }

  const hidden = hiddenNodeIds.includes(system.id);
  const pinned = pinnedNodeIds.includes(system.id);
  const isolated = isolatedNodeId === system.id;
  const connectionCount = getConnectionCount(system.id);

  return (
    <div className="flex flex-col gap-3 p-4 text-sm">
      <div>
        <h2 className="font-heading text-base font-medium leading-tight">
          {system.name}
        </h2>
        {system.vendor ? (
          <p className="mt-1 text-xs text-muted-foreground">{system.vendor}</p>
        ) : null}
      </div>

      {system.url ? (
        <a
          href={system.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
        >
          {system.url}
          <ExternalLink className="size-3 shrink-0" />
        </a>
      ) : null}

      {system.description ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {system.description}
        </p>
      ) : null}

      {assignedDomains.length > 0 ? (
        <div>
          <p className="mb-1 text-[11px] font-medium text-muted-foreground">
            Domains
          </p>
          <div className="flex flex-wrap gap-1">
            {assignedDomains.map((d) => (
              <Badge
                key={d.id}
                className="text-white"
                style={{ backgroundColor: d.color }}
              >
                {d.name}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {assignedCategories.length > 0 ? (
        <div>
          <p className="mb-1 text-[11px] font-medium text-muted-foreground">
            Categories
          </p>
          <div className="flex flex-wrap gap-1">
            {assignedCategories.map((c) => (
              <Badge
                key={c.id}
                className="text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.name}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            Connections
          </p>
          <p className="text-[11px] tabular-nums text-muted-foreground">
            {connectionCount}
          </p>
        </div>
        {connectionGroups.length > 0 ? (
          <ul className="max-h-52 space-y-3 overflow-y-auto">
            {connectionGroups.map((group) => {
              const ct = getConnectionType(group.typeValue);
              const chipColor = ct?.color || "#64748b";
              return (
                <li key={group.relationLabel}>
                  <div className="rounded-md border border-border bg-muted/40 px-2.5 py-2">
                    <span
                      className="inline-flex max-w-full items-center rounded-md px-2 py-0.5 text-[11px] font-medium leading-tight text-white shadow-sm"
                      style={{ backgroundColor: chipColor }}
                    >
                      {group.relationLabel}
                    </span>
                    <ul className="mt-2 list-none space-y-1 text-sm font-medium leading-snug text-foreground">
                      {group.neighbors.map((n) => (
                        <li key={n.other.id}>{n.other.name}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No connections yet.</p>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
          Quick categories
        </p>
        {categories.length === 0 ? (
          <p className="text-xs text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="max-h-32 space-y-0.5 overflow-y-auto rounded-md border border-border p-1">
            {categories.map((category) => {
              const checked = (system.categoryIds || []).includes(category.id);
              return (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-muted"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() =>
                      toggleSystemCategory(system.id, category.id)
                    }
                  />
                  <span
                    className="inline-block size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="truncate">{category.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => openSystemEdit(system)}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => startRelationshipFromSystem(system)}
        >
          Create connection
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() =>
            hidden ? unhideNode(system.id) : hideNodes([system.id])
          }
        >
          {hidden ? "Unhide" : "Hide"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() =>
            pinned ? unpinNode(system.id) : pinNodes([system.id])
          }
        >
          {pinned ? "Unpin" : "Pin"}
        </Button>
        {isolated ? (
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => clearIsolate()}
          >
            Clear isolate
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => isolateNode(system.id)}
          >
            Isolate
          </Button>
        )}
        <Button
          size="sm"
          variant="destructive"
          type="button"
          className="border-destructive/30"
          onClick={() => confirmDeleteSystem(system)}
        >
          Delete
        </Button>
      </div>

      <Button asChild size="sm" variant="secondary" className="w-full">
        <Link href={`/systems/${system.id}`}>
          Open system page
          <ExternalLink className="size-3" />
        </Link>
      </Button>
    </div>
  );
}

function MultiSection({ systemIds }) {
  return (
    <div className="p-4 text-sm">
      <h2 className="font-heading text-base font-medium">
        {systemIds.length} systems selected
      </h2>
      <p className="mt-2 text-xs text-muted-foreground">
        Use the toolbar or context menu for bulk actions. Choose a single node
        for full details.
      </p>
    </div>
  );
}

function GroupedEdgeSection({ selection, setSelection }) {
  return (
    <div className="flex flex-col gap-3 p-4 text-sm">
      <div>
        <h2 className="font-heading text-base font-medium">
          Connections between
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          {selection.sourceName} → {selection.targetName}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-[11px] font-medium text-muted-foreground">
          Relationships
        </p>
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-1">
          {selection.relationships.map((relationship) => (
            <button
              key={relationship.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent"
              onClick={() =>
                setSelection(
                  edgeSelection(relationship.id, {
                    sourceId: selection.sourceId,
                    targetId: selection.targetId,
                    sourceName: selection.sourceName,
                    targetName: selection.targetName,
                    relationships: selection.relationships,
                  })
                )
              }
            >
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: relationship.isFilterMatch
                    ? relationship.color
                    : MUTED_EDGE_COLOR,
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
      <p className="text-xs text-muted-foreground">
        Select a relationship to edit type, note, or delete.
      </p>
    </div>
  );
}

function EdgeSection({ connectionId, setSelection, restoreGrouped }) {
  const allConnections = useMapStore((s) => s.connections);
  const updateConnection = useMapStore((s) => s.updateConnection);
  const deleteConnection = useMapStore((s) => s.deleteConnection);
  const systems = useMapStore((s) => s.systems);

  const connection = useMemo(
    () => allConnections.find((c) => c.id === connectionId),
    [allConnections, connectionId]
  );

  const [type, setType] = useState(() => connection?.type || "");
  const [note, setNote] = useState(() => connection?.note || "");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const sourceName = useMemo(() => {
    if (!connection) return "";
    return systems.find((s) => s.id === connection.sourceId)?.name || "Unknown";
  }, [connection, systems]);

  const targetName = useMemo(() => {
    if (!connection) return "";
    return systems.find((s) => s.id === connection.targetId)?.name || "Unknown";
  }, [connection, systems]);

  const handleSave = useCallback(
    (event) => {
      event.preventDefault();
      if (!connection) return;
      if (!type) return;
      const hasDuplicate = allConnections.some(
        (c) =>
          c.id !== connection.id &&
          ((c.sourceId === connection.sourceId &&
            c.targetId === connection.targetId) ||
            (c.sourceId === connection.targetId &&
              c.targetId === connection.sourceId)) &&
          c.type === type
      );
      if (hasDuplicate) {
        toast.error("This connection already exists");
        return;
      }
      updateConnection(connection.id, {
        type,
        note: note.trim() || null,
      });
      toast.success("Relationship updated");
    },
    [allConnections, connection, note, type, updateConnection]
  );

  const handleDelete = useCallback(() => {
    if (!connection) return;
    deleteConnection(connection.id);
    toast.success("Connection removed");
    setDeleteOpen(false);
    setSelection(emptyInspectorSelection());
  }, [connection, deleteConnection, setSelection]);

  if (!connection) {
    return (
      <div className="p-4 text-xs text-muted-foreground">
        Connection not found.
      </div>
    );
  }

  return (
    <>
      <form
        className="flex flex-col gap-3 p-4 text-sm"
        onSubmit={handleSave}
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-heading text-base font-medium">Relationship</h2>
          {restoreGrouped ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="shrink-0 text-xs"
              onClick={() =>
                setSelection({
                  kind: "groupedEdge",
                  sourceId: restoreGrouped.sourceId,
                  targetId: restoreGrouped.targetId,
                  sourceName: restoreGrouped.sourceName,
                  targetName: restoreGrouped.targetName,
                  relationships: restoreGrouped.relationships,
                })
              }
            >
              All between endpoints
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {sourceName} → {targetName}
        </p>
        <div className="grid gap-2 border-t border-border pt-3">
          <Label>Connection type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {CONNECTION_TYPES.map((connectionType) => (
                <SelectItem
                  key={connectionType.value}
                  value={connectionType.value}
                >
                  <div className="flex flex-col">
                    <span>{connectionType.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {connectionType.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="inspector-edge-note">Note</Label>
          <Textarea
            id="inspector-edge-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Context for this connection"
            rows={3}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" disabled={!type}>
            Save changes
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete connection
          </Button>
        </div>
      </form>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this connection?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the relationship between {sourceName} and {targetName}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function MapInspectorContent({
  selection,
  setSelection,
  hiddenNodeIds = [],
  pinnedNodeIds = [],
  isolatedNodeId,
  startRelationshipFromSystem,
  openSystemEdit,
  confirmDeleteSystem,
  hideNodes,
  unhideNode,
  pinNodes,
  unpinNode,
  isolateNode,
  clearIsolate,
}) {
  if (selection.kind === "empty") {
    return <InspectorEmpty />;
  }

  if (selection.kind === "nodes") {
    return <MultiSection systemIds={selection.systemIds} />;
  }

  if (selection.kind === "node") {
    return (
      <NodeSection
        systemId={selection.systemId}
        hiddenNodeIds={hiddenNodeIds}
        pinnedNodeIds={pinnedNodeIds}
        isolatedNodeId={isolatedNodeId}
        startRelationshipFromSystem={startRelationshipFromSystem}
        openSystemEdit={openSystemEdit}
        confirmDeleteSystem={confirmDeleteSystem}
        hideNodes={hideNodes}
        unhideNode={unhideNode}
        pinNodes={pinNodes}
        unpinNode={unpinNode}
        isolateNode={isolateNode}
        clearIsolate={clearIsolate}
      />
    );
  }

  if (selection.kind === "groupedEdge") {
    return (
      <GroupedEdgeSection selection={selection} setSelection={setSelection} />
    );
  }

  if (selection.kind === "edge") {
    return (
      <EdgeSection
        key={selection.connectionId}
        connectionId={selection.connectionId}
        setSelection={setSelection}
        restoreGrouped={selection.restoreGrouped}
      />
    );
  }

  return null;
}
