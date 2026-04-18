"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NetworkGraph } from "@/components/map/network-graph";
import { MapInspector } from "@/components/map/map-inspector";
import { MapToolbar } from "@/components/map/map-toolbar";
import { MapTutorial } from "@/components/map/map-tutorial";
import { CONNECTION_TYPES } from "@/lib/constants";
import {
  createEmptyMapSelection,
  createNodeMapSelection,
  isSameMapSelection,
  sanitizeMapSelection,
} from "@/lib/map-selection";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMapTutorial } from "@/hooks/use-map-tutorial";
import { useMapStore } from "@/store/use-map-store";
import { SystemForm } from "@/components/systems/system-form";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export default function MapPage() {
  const systems = useMapStore((s) => s.systems);
  const connections = useMapStore((s) => s.connections);
  const domains = useMapStore((s) => s.domains);
  const categories = useMapStore((s) => s.categories);
  const updateConnection = useMapStore((s) => s.updateConnection);
  const deleteConnection = useMapStore((s) => s.deleteConnection);
  const deleteSystem = useMapStore((s) => s.deleteSystem);

  const [domainFilter, setDomainFilter] = useState([]);
  const [connectionTypeFilter, setConnectionTypeFilter] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [layoutDirection, setLayoutDirection] = useState("LR");
  const [edgeDisplayMode, setEdgeDisplayMode] = useState("separate");
  const [hiddenNodeIds, setHiddenNodeIds] = useState([]);
  const [pinnedNodeIds, setPinnedNodeIds] = useState([]);
  const [selection, setSelection] = useState(createEmptyMapSelection);
  const [isolatedNodeId, setIsolatedNodeId] = useState(null);
  const [layoutKey, setLayoutKey] = useState(0);
  const [fitViewKey, setFitViewKey] = useState(0);
  const [relationshipSource, setRelationshipSource] = useState(null);
  const [editSystemTarget, setEditSystemTarget] = useState(null);
  const [deleteSystemTarget, setDeleteSystemTarget] = useState(null);
  const [connectionDraft, setConnectionDraft] = useState({
    type: "",
    note: "",
  });
  const [stats, setStats] = useState({
    filteredSystems: 0,
    totalSystems: 0,
    filteredConnections: 0,
    totalConnections: 0,
  });

  const tutorial = useMapTutorial();
  const isMobile = useIsMobile();

  const systemsById = useMemo(
    () => new Map(systems.map((system) => [system.id, system])),
    [systems]
  );
  const connectionsById = useMemo(
    () => new Map(connections.map((connection) => [connection.id, connection])),
    [connections]
  );
  const domainsById = useMemo(
    () => new Map(domains.map((domain) => [domain.id, domain])),
    [domains]
  );
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );
  const hiddenNodeIdSet = useMemo(() => new Set(hiddenNodeIds), [hiddenNodeIds]);
  const pinnedNodeIdSet = useMemo(() => new Set(pinnedNodeIds), [pinnedNodeIds]);

  useEffect(() => {
    const nextSelection = sanitizeMapSelection(selection, {
      systemIds: new Set(systems.map((system) => system.id)),
      connectionIds: new Set(connections.map((connection) => connection.id)),
    });

    setSelection((currentSelection) =>
      isSameMapSelection(currentSelection, nextSelection)
        ? currentSelection
        : nextSelection
    );
  }, [connections, selection, systems]);

  const activeConnectionId =
    selection.kind === "edge"
      ? selection.connectionId
      : selection.kind === "grouped-edge"
        ? selection.activeConnectionId
        : null;

  useEffect(() => {
    const activeConnection = activeConnectionId
      ? connectionsById.get(activeConnectionId)
      : null;

    if (!activeConnection) {
      setConnectionDraft({ type: "", note: "" });
      return;
    }

    setConnectionDraft((currentDraft) => {
      const nextDraft = {
        type: activeConnection.type,
        note: activeConnection.note || "",
      };

      if (
        currentDraft.type === nextDraft.type &&
        currentDraft.note === nextDraft.note
      ) {
        return currentDraft;
      }

      return nextDraft;
    });
  }, [activeConnectionId, connectionsById]);

  const handleRelayout = useCallback(() => {
    setLayoutKey((k) => k + 1);
  }, []);

  const handleFitView = useCallback(() => {
    setFitViewKey((k) => k + 1);
  }, []);

  const handleToggleDirection = useCallback(() => {
    setLayoutDirection((d) => (d === "LR" ? "TB" : "LR"));
  }, []);

  const hasFilters = domainFilter.length > 0 || connectionTypeFilter.length > 0;

  const handleSelectionChange = useCallback((nextSelection) => {
    setSelection(nextSelection);
  }, []);

  const handleSelectNode = useCallback((nodeId) => {
    setSelection(createNodeMapSelection(nodeId));
  }, []);

  const handleCreateConnection = useCallback((system) => {
    setRelationshipSource(system);
    setSelection(createEmptyMapSelection());
  }, []);

  const handleHideNode = useCallback(
    (nodeId) => {
      setHiddenNodeIds((prev) => (prev.includes(nodeId) ? prev : [...prev, nodeId]));
      setSelection(createEmptyMapSelection());
      if (isolatedNodeId === nodeId) {
        setIsolatedNodeId(null);
      }
    },
    [isolatedNodeId]
  );

  const handleTogglePinNode = useCallback((nodeId) => {
    setPinnedNodeIds((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  }, []);

  const handleToggleIsolateNode = useCallback((nodeId) => {
    setHiddenNodeIds((prev) => prev.filter((id) => id !== nodeId));
    setIsolatedNodeId((prev) => (prev === nodeId ? null : nodeId));
    setSelection(createNodeMapSelection(nodeId));
  }, []);

  const handleSaveConnection = useCallback(() => {
    const activeConnection = activeConnectionId
      ? connectionsById.get(activeConnectionId)
      : null;
    if (!activeConnection) return;
    if (!connectionDraft.type) return;

    const hasDuplicate = connections.some(
      (connection) =>
        connection.id !== activeConnection.id &&
        ((connection.sourceId === activeConnection.sourceId &&
          connection.targetId === activeConnection.targetId) ||
          (connection.sourceId === activeConnection.targetId &&
            connection.targetId === activeConnection.sourceId)) &&
        connection.type === connectionDraft.type
    );

    if (hasDuplicate) {
      toast.error("This connection already exists");
      return;
    }

    updateConnection(activeConnection.id, {
      type: connectionDraft.type,
      note: connectionDraft.note.trim() || null,
    });
    toast.success("Relationship updated");
  }, [activeConnectionId, connectionDraft, connections, connectionsById, updateConnection]);

  const handleDeleteConnection = useCallback(() => {
    if (!activeConnectionId) return;
    deleteConnection(activeConnectionId);
    setSelection(createEmptyMapSelection());
    toast.success("Connection deleted");
  }, [activeConnectionId, deleteConnection]);

  const handleDeleteSystem = useCallback(() => {
    if (!deleteSystemTarget) return;
    const targetId = deleteSystemTarget.id;
    const name = deleteSystemTarget.name;

    deleteSystem(targetId);
    setDeleteSystemTarget(null);
    setHiddenNodeIds((prev) => prev.filter((id) => id !== targetId));
    setPinnedNodeIds((prev) => prev.filter((id) => id !== targetId));
    if (isolatedNodeId === targetId) {
      setIsolatedNodeId(null);
    }
    if (relationshipSource?.id === targetId) {
      setRelationshipSource(null);
    }
    setSelection(createEmptyMapSelection());
    toast.success(`"${name}" deleted`);
  }, [deleteSystem, deleteSystemTarget, isolatedNodeId, relationshipSource]);

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <MapToolbar
        domainFilter={domainFilter}
        setDomainFilter={setDomainFilter}
        connectionTypeFilter={connectionTypeFilter}
        setConnectionTypeFilter={setConnectionTypeFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        layoutDirection={layoutDirection}
        onToggleDirection={handleToggleDirection}
        onRelayout={handleRelayout}
        onFitView={handleFitView}
        edgeDisplayMode={edgeDisplayMode}
        onEdgeDisplayModeChange={setEdgeDisplayMode}
        hiddenNodeCount={hiddenNodeIds.length}
        onShowAllHiddenNodes={() => setHiddenNodeIds([])}
        hasIsolateMode={Boolean(isolatedNodeId)}
        onClearIsolateMode={() => setIsolatedNodeId(null)}
        stats={stats}
        hasFilters={hasFilters}
        onReplayTutorial={tutorial.start}
      />
      <div className="flex min-h-0 flex-1 lg:gap-4">
        <div className="min-h-0 flex-1" data-tutorial="graph">
          <NetworkGraph
            domainFilter={domainFilter}
            connectionTypeFilter={connectionTypeFilter}
            searchQuery={searchQuery}
            layoutDirection={layoutDirection}
            edgeDisplayMode={edgeDisplayMode}
            layoutKey={layoutKey}
            fitViewKey={fitViewKey}
            hiddenNodeIds={hiddenNodeIds}
            onHiddenNodeIdsChange={setHiddenNodeIds}
            pinnedNodeIds={pinnedNodeIds}
            onPinnedNodeIdsChange={setPinnedNodeIds}
            selection={selection}
            onSelectionChange={handleSelectionChange}
            isolatedNodeId={isolatedNodeId}
            onIsolatedNodeIdChange={setIsolatedNodeId}
            onStatsChange={setStats}
            relationshipSource={relationshipSource}
            onRelationshipSourceChange={setRelationshipSource}
            onRequestEditSystem={setEditSystemTarget}
            onRequestDeleteSystem={setDeleteSystemTarget}
            hasBlockingDialog={Boolean(editSystemTarget || deleteSystemTarget)}
          />
        </div>
        <aside className="hidden h-full w-[360px] shrink-0 border-l bg-background lg:block">
          <MapInspector
            selection={selection}
            systemsById={systemsById}
            connectionsById={connectionsById}
            domainsById={domainsById}
            categoriesById={categoriesById}
            allConnectionTypes={CONNECTION_TYPES}
            hiddenNodeIdSet={hiddenNodeIdSet}
            pinnedNodeIdSet={pinnedNodeIdSet}
            isolatedNodeId={isolatedNodeId}
            connectionDraft={connectionDraft}
            onConnectionDraftTypeChange={(type) =>
              setConnectionDraft((prev) => ({ ...prev, type }))
            }
            onConnectionDraftNoteChange={(note) =>
              setConnectionDraft((prev) => ({ ...prev, note }))
            }
            onSaveConnection={handleSaveConnection}
            onDeleteConnection={handleDeleteConnection}
            onEditNode={setEditSystemTarget}
            onCreateConnection={handleCreateConnection}
            onHideNode={handleHideNode}
            onTogglePinNode={handleTogglePinNode}
            onToggleIsolateNode={handleToggleIsolateNode}
            onDeleteNode={setDeleteSystemTarget}
            onSelectNode={handleSelectNode}
            onSelectionChange={handleSelectionChange}
          />
        </aside>
      </div>
      <Sheet
        open={isMobile && selection.kind !== "empty"}
        onOpenChange={(open) => {
          if (!open) {
            setSelection(createEmptyMapSelection());
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="max-h-[80vh] rounded-t-2xl p-0 [&>button]:top-4 [&>button]:right-4"
        >
          <SheetHeader className="border-b">
            <SheetTitle>Inspector</SheetTitle>
            <SheetDescription>
              Selected system and relationship details.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1">
            <MapInspector
              selection={selection}
              systemsById={systemsById}
              connectionsById={connectionsById}
              domainsById={domainsById}
              categoriesById={categoriesById}
              allConnectionTypes={CONNECTION_TYPES}
              hiddenNodeIdSet={hiddenNodeIdSet}
              pinnedNodeIdSet={pinnedNodeIdSet}
              isolatedNodeId={isolatedNodeId}
              connectionDraft={connectionDraft}
              onConnectionDraftTypeChange={(type) =>
                setConnectionDraft((prev) => ({ ...prev, type }))
              }
              onConnectionDraftNoteChange={(note) =>
                setConnectionDraft((prev) => ({ ...prev, note }))
              }
              onSaveConnection={handleSaveConnection}
              onDeleteConnection={handleDeleteConnection}
              onEditNode={setEditSystemTarget}
              onCreateConnection={handleCreateConnection}
              onHideNode={handleHideNode}
              onTogglePinNode={handleTogglePinNode}
              onToggleIsolateNode={handleToggleIsolateNode}
              onDeleteNode={setDeleteSystemTarget}
              onSelectNode={handleSelectNode}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </SheetContent>
      </Sheet>
      <SystemForm
        key={`${editSystemTarget?.id || "new"}-${Boolean(editSystemTarget) ? "open" : "closed"}`}
        open={Boolean(editSystemTarget)}
        onOpenChange={(open) => {
          if (!open) setEditSystemTarget(null);
        }}
        system={editSystemTarget}
      />
      <AlertDialog
        open={Boolean(deleteSystemTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteSystemTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{deleteSystemTarget?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the system and all its connections. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteSystem}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {tutorial.isOpen && <MapTutorial onClose={tutorial.close} />}
    </div>
  );
}
