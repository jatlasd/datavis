"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMapStore } from "@/store/use-map-store";
import { useFilteredData } from "@/hooks/use-filtered-data";
import { useNetworkGraphElements } from "@/hooks/use-network-graph-elements";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  MUTED_EDGE_COLOR,
} from "@/lib/network-graph-layout";
import { SystemNodePopover } from "@/components/map/system-popover";
import { ParallelRelationshipEdge } from "@/components/map/parallel-relationship-edge";
import { TypedSystemNode } from "@/components/map/typed-system-node";
import { NetworkGraphContextMenu } from "@/components/map/network-graph-context-menu";
import { NetworkGraphRelationshipFlow } from "@/components/map/network-graph-relationship-flow";
import { NetworkGraphGroupedEdgeDetails } from "@/components/map/network-graph-grouped-edge-details";
import { NetworkGraphEditConnectionDialog } from "@/components/map/network-graph-edit-connection-dialog";
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
import { toast } from "sonner";

function NetworkGraphInner({
  domainFilter,
  connectionTypeFilter,
  searchQuery,
  layoutDirection,
  edgeDisplayMode,
  layoutKey,
  fitViewKey,
  hiddenNodeIds,
  onHiddenNodeIdsChange,
  pinnedNodeIds,
  onPinnedNodeIdsChange,
  selectedNodeIds,
  onSelectedNodeIdsChange,
  isolatedNodeId,
  onIsolatedNodeIdChange,
  onStatsChange,
}) {
  const allSystems = useMapStore((s) => s.systems);
  const allConnections = useMapStore((s) => s.connections);
  const addConnection = useMapStore((s) => s.addConnection);
  const updateConnection = useMapStore((s) => s.updateConnection);
  const connectionExists = useMapStore((s) => s.connectionExists);
  const deleteSystem = useMapStore((s) => s.deleteSystem);
  const { systems, domains, connections } = useFilteredData();
  const { fitView, setCenter, getNodes } = useReactFlow();

  const [selectedNode, setSelectedNode] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState(null);
  const [relationshipSource, setRelationshipSource] = useState(null);
  const [relationshipTarget, setRelationshipTarget] = useState(null);
  const [relationshipTypeMenuPos, setRelationshipTypeMenuPos] = useState({
    x: 0,
    y: 0,
  });
  const [editSystemTarget, setEditSystemTarget] = useState(null);
  const [deleteSystemTarget, setDeleteSystemTarget] = useState(null);
  const [groupedEdgeDetails, setGroupedEdgeDetails] = useState(null);
  const [editingConnectionId, setEditingConnectionId] = useState(null);
  const [editingConnectionType, setEditingConnectionType] = useState("");
  const [editingConnectionNote, setEditingConnectionNote] = useState("");
  const contextMenuRef = useRef(null);
  const relationshipTypeMenuRef = useRef(null);
  const groupedEdgeDetailsRef = useRef(null);
  const nodeMouseDownPosRef = useRef(null);
  const didNodeDragRef = useRef(false);
  const ignoreNodeClickUntilRef = useRef(0);
  const edgeTypes = useMemo(
    () => ({
      parallelRelationship: ParallelRelationshipEdge,
    }),
    []
  );
  const nodeTypes = useMemo(
    () => ({
      typedSystem: TypedSystemNode,
    }),
    []
  );

  const hiddenNodeIdSet = useMemo(() => new Set(hiddenNodeIds), [hiddenNodeIds]);
  const pinnedNodeIdSet = useMemo(() => new Set(pinnedNodeIds), [pinnedNodeIds]);
  const selectedNodeIdSet = useMemo(
    () => new Set(selectedNodeIds),
    [selectedNodeIds]
  );

  const domainFilteredSystems = useMemo(() => {
    if (domainFilter.length === 0) return systems;
    return systems.filter((s) =>
      s.domainIds.some((did) => domainFilter.includes(did))
    );
  }, [systems, domainFilter]);

  const visibleBaseSystems = useMemo(
    () => domainFilteredSystems.filter((system) => !hiddenNodeIdSet.has(system.id)),
    [domainFilteredSystems, hiddenNodeIdSet]
  );
  const visibleBaseSystemIds = useMemo(
    () => new Set(visibleBaseSystems.map((system) => system.id)),
    [visibleBaseSystems]
  );
  const isolateNodeIds = useMemo(() => {
    if (!isolatedNodeId || !visibleBaseSystemIds.has(isolatedNodeId)) return null;
    const ids = new Set([isolatedNodeId]);
    for (const connection of connections) {
      if (
        !visibleBaseSystemIds.has(connection.sourceId) ||
        !visibleBaseSystemIds.has(connection.targetId)
      ) {
        continue;
      }
      if (connection.sourceId === isolatedNodeId) ids.add(connection.targetId);
      if (connection.targetId === isolatedNodeId) ids.add(connection.sourceId);
    }
    return ids;
  }, [connections, isolatedNodeId, visibleBaseSystemIds]);
  const filteredSystems = useMemo(() => {
    if (!isolateNodeIds) return visibleBaseSystems;
    return visibleBaseSystems.filter((system) => isolateNodeIds.has(system.id));
  }, [isolateNodeIds, visibleBaseSystems]);

  const filteredSystemIds = useMemo(
    () => new Set(filteredSystems.map((s) => s.id)),
    [filteredSystems]
  );
  const filteredSystemsById = useMemo(
    () => new Map(filteredSystems.map((sys) => [sys.id, sys])),
    [filteredSystems]
  );
  const allConnectionsById = useMemo(
    () => new Map(allConnections.map((connection) => [connection.id, connection])),
    [allConnections]
  );
  const allSystemsById = useMemo(
    () => new Map(allSystems.map((system) => [system.id, system])),
    [allSystems]
  );
  const allSystemIdSet = useMemo(
    () => new Set(allSystems.map((system) => system.id)),
    [allSystems]
  );

  useEffect(() => {
    const nextHidden = hiddenNodeIds.filter((id) => allSystemIdSet.has(id));
    if (nextHidden.length !== hiddenNodeIds.length) {
      onHiddenNodeIdsChange?.(nextHidden);
    }
    const nextPinned = pinnedNodeIds.filter((id) => allSystemIdSet.has(id));
    if (nextPinned.length !== pinnedNodeIds.length) {
      onPinnedNodeIdsChange?.(nextPinned);
    }
    const nextSelected = selectedNodeIds.filter((id) => allSystemIdSet.has(id));
    if (nextSelected.length !== selectedNodeIds.length) {
      onSelectedNodeIdsChange?.(nextSelected);
    }
    if (isolatedNodeId && !allSystemIdSet.has(isolatedNodeId)) {
      onIsolatedNodeIdChange?.(null);
    }
  }, [
    allSystemIdSet,
    hiddenNodeIds,
    isolatedNodeId,
    onHiddenNodeIdsChange,
    onIsolatedNodeIdChange,
    onPinnedNodeIdsChange,
    onSelectedNodeIdsChange,
    pinnedNodeIds,
    selectedNodeIds,
  ]);

  useEffect(() => {
    if (isolatedNodeId && hiddenNodeIdSet.has(isolatedNodeId)) {
      onIsolatedNodeIdChange?.(null);
    }
  }, [hiddenNodeIdSet, isolatedNodeId, onIsolatedNodeIdChange]);

  const visibleConnections = useMemo(() => {
    return connections.filter((c) => {
      if (!filteredSystemIds.has(c.sourceId) || !filteredSystemIds.has(c.targetId))
        return false;
      return true;
    });
  }, [connections, filteredSystemIds]);

  const connectionMatchesFilters = useCallback(
    (connection) => {
      const sourceSystem = filteredSystemsById.get(connection.sourceId);
      const targetSystem = filteredSystemsById.get(connection.targetId);
      if (!sourceSystem || !targetSystem) return false;
      const matchesDomain =
        domainFilter.length === 0 ||
        (sourceSystem.domainIds.some((id) => domainFilter.includes(id)) &&
          targetSystem.domainIds.some((id) => domainFilter.includes(id)));
      const matchesType =
        connectionTypeFilter.length === 0 ||
        connectionTypeFilter.includes(connection.type);
      return matchesDomain && matchesType;
    },
    [connectionTypeFilter, domainFilter, filteredSystemsById]
  );

  const filteredConnections = useMemo(
    () => visibleConnections.filter((connection) => connectionMatchesFilters(connection)),
    [visibleConnections, connectionMatchesFilters]
  );

  useEffect(() => {
    onStatsChange?.({
      filteredSystems: filteredSystems.length,
      totalSystems: allSystems.length,
      filteredConnections: filteredConnections.length,
      totalConnections: allConnections.length,
    });
  }, [filteredSystems.length, allSystems.length, filteredConnections.length, allConnections.length, onStatsChange]);

  const normalizedQuery = searchQuery?.toLowerCase().trim() || "";

  const matchingSystemIds = useMemo(() => {
    if (!normalizedQuery) return null;
    return new Set(
      filteredSystems
        .filter((s) => s.name.toLowerCase().includes(normalizedQuery))
        .map((s) => s.id)
    );
  }, [filteredSystems, normalizedQuery]);

  const { initialNodes, initialEdges } = useNetworkGraphElements({
    filteredSystems,
    visibleConnections,
    filteredConnections,
    filteredSystemsById,
    domains,
    layoutDirection,
    layoutKey,
    matchingSystemIds,
    edgeDisplayMode,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        const isPinned = pinnedNodeIdSet.has(node.id);
        const draggable = !isPinned;
        if (node.data?.isPinned === isPinned && node.draggable === draggable) {
          return node;
        }
        return {
          ...node,
          draggable,
          data: {
            ...node.data,
            isPinned,
          },
        };
      })
    );
  }, [pinnedNodeIdSet, setNodes]);

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        const isSelected = selectedNodeIdSet.has(node.id);
        if (node.data?.isSelected === isSelected) {
          return node;
        }
        return {
          ...node,
          data: {
            ...node.data,
            isSelected,
          },
        };
      })
    );
  }, [selectedNodeIdSet, setNodes]);

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        const isIsolatedRoot = isolatedNodeId === node.id;
        if (node.data?.isIsolatedRoot === isIsolatedRoot) {
          return node;
        }
        return {
          ...node,
          data: {
            ...node.data,
            isIsolatedRoot,
          },
        };
      })
    );
  }, [isolatedNodeId, setNodes]);

  const fitViewKeyRef = useRef(fitViewKey);
  useEffect(() => {
    if (fitViewKeyRef.current !== fitViewKey) {
      fitViewKeyRef.current = fitViewKey;
      requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
    }
  }, [fitViewKey, fitView]);

  useEffect(() => {
    if (matchingSystemIds && matchingSystemIds.size === 1) {
      const targetId = [...matchingSystemIds][0];
      requestAnimationFrame(() => {
        const flowNodes = getNodes();
        const target = flowNodes.find((n) => n.id === targetId);
        if (target) {
          setCenter(
            target.position.x + NODE_WIDTH / 2,
            target.position.y + NODE_HEIGHT / 2,
            { zoom: 1.2, duration: 400 }
          );
        }
      });
    }
  }, [matchingSystemIds, getNodes, setCenter]);

  const resetRelationshipFlow = useCallback(() => {
    setRelationshipSource(null);
    setRelationshipTarget(null);
  }, []);

  const closeConnectionEditor = useCallback(() => {
    setEditingConnectionId(null);
    setEditingConnectionType("");
    setEditingConnectionNote("");
  }, []);

  const openConnectionEditor = useCallback(
    (connectionId) => {
      const connection = allConnectionsById.get(connectionId);
      if (!connection) return;
      setSelectedNode(null);
      setContextMenu(null);
      setRelationshipSource(null);
      setRelationshipTarget(null);
      setGroupedEdgeDetails(null);
      setEditingConnectionId(connection.id);
      setEditingConnectionType(connection.type);
      setEditingConnectionNote(connection.note || "");
    },
    [allConnectionsById]
  );

  const editingConnection = useMemo(
    () => (editingConnectionId ? allConnectionsById.get(editingConnectionId) : null),
    [editingConnectionId, allConnectionsById]
  );
  const editingSourceName = editingConnection
    ? allSystemsById.get(editingConnection.sourceId)?.name || "Unknown"
    : "";
  const editingTargetName = editingConnection
    ? allSystemsById.get(editingConnection.targetId)?.name || "Unknown"
    : "";

  useEffect(() => {
    function handlePointerDown(event) {
      if (
        contextMenu &&
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setContextMenu(null);
      }

      if (
        relationshipTarget &&
        relationshipTypeMenuRef.current &&
        !relationshipTypeMenuRef.current.contains(event.target)
      ) {
        setRelationshipTarget(null);
      }

      if (
        groupedEdgeDetails &&
        groupedEdgeDetailsRef.current &&
        !groupedEdgeDetailsRef.current.contains(event.target)
      ) {
        setGroupedEdgeDetails(null);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setContextMenu(null);
        setSelectedNode(null);
        onSelectedNodeIdsChange?.([]);
        setRelationshipTarget(null);
        setGroupedEdgeDetails(null);
        closeConnectionEditor();
        if (relationshipSource) {
          resetRelationshipFlow();
        }
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    contextMenu,
    relationshipTarget,
    relationshipSource,
    onSelectedNodeIdsChange,
    groupedEdgeDetails,
    closeConnectionEditor,
    resetRelationshipFlow,
  ]);

  const onNodeClick = useCallback((event, node) => {
    if (performance.now() < ignoreNodeClickUntilRef.current) {
      return;
    }
    const down = nodeMouseDownPosRef.current;
    nodeMouseDownPosRef.current = null;
    if (down) {
      const dx = event.clientX - down.x;
      const dy = event.clientY - down.y;
      if (dx * dx + dy * dy > 25) return;
    }
    setContextMenu(null);
    setGroupedEdgeDetails(null);
    const isMultiSelect = event.shiftKey || event.metaKey || event.ctrlKey;
    if (relationshipSource) {
      if (node.id === relationshipSource.id) {
        toast.error("Select a different node to create this relationship");
        return;
      }

      setSelectedNode(null);
      onSelectedNodeIdsChange?.([]);
      setRelationshipTarget(node.data.system);
      setRelationshipTypeMenuPos({ x: event.clientX, y: event.clientY });
      return;
    }

    if (isMultiSelect) {
      setSelectedNode(null);
      onSelectedNodeIdsChange?.((prev) =>
        prev.includes(node.id)
          ? prev.filter((id) => id !== node.id)
          : [...prev, node.id]
      );
      return;
    }

    setSelectedNode(null);
    onSelectedNodeIdsChange?.([node.id]);
  }, [onSelectedNodeIdsChange, relationshipSource]);

  const onWrapperMouseDown = useCallback((event) => {
    nodeMouseDownPosRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onNodeDragStart = useCallback(() => {
    didNodeDragRef.current = false;
  }, []);

  const onNodeDrag = useCallback(() => {
    didNodeDragRef.current = true;
  }, []);

  const onNodeDragStop = useCallback(() => {
    if (didNodeDragRef.current) {
      ignoreNodeClickUntilRef.current = performance.now() + 250;
    }
    didNodeDragRef.current = false;
  }, []);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedNode(null);
    setRelationshipTarget(null);
    setGroupedEdgeDetails(null);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      system: node.data.system,
      isHidden: hiddenNodeIdSet.has(node.id),
      isPinned: pinnedNodeIdSet.has(node.id),
      isIsolated: isolatedNodeId === node.id,
      isSelected: selectedNodeIdSet.has(node.id),
      selectedCount: selectedNodeIds.length,
      hiddenCount: hiddenNodeIds.length,
    });
  }, [
    hiddenNodeIdSet,
    hiddenNodeIds.length,
    isolatedNodeId,
    pinnedNodeIdSet,
    selectedNodeIdSet,
    selectedNodeIds.length,
  ]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    onSelectedNodeIdsChange?.([]);
    setContextMenu(null);
    setRelationshipTarget(null);
    setGroupedEdgeDetails(null);
    closeConnectionEditor();
    if (relationshipSource) {
      resetRelationshipFlow();
    }
  }, [
    closeConnectionEditor,
    onSelectedNodeIdsChange,
    relationshipSource,
    resetRelationshipFlow,
  ]);

  const onEdgeClick = useCallback(
    (event, edge) => {
      if (edgeDisplayMode !== "grouped") {
        openConnectionEditor(edge.id);
        return;
      }
      const groupedRelationships = edge.data?.groupedRelationships;
      if (!groupedRelationships || groupedRelationships.length === 0) return;
      setSelectedNode(null);
      setContextMenu(null);
      setRelationshipTarget(null);
      setGroupedEdgeDetails({
        x: event.clientX,
        y: event.clientY,
        sourceName: edge.data?.sourceName || "Unknown",
        targetName: edge.data?.targetName || "Unknown",
        relationships: groupedRelationships,
      });
    },
    [edgeDisplayMode, openConnectionEditor]
  );

  const handleSaveConnectionEdit = useCallback(
    (event) => {
      event.preventDefault();
      if (!editingConnection) return;
      if (!editingConnectionType) return;
      const hasDuplicate = allConnections.some(
        (connection) =>
          connection.id !== editingConnection.id &&
          ((connection.sourceId === editingConnection.sourceId &&
            connection.targetId === editingConnection.targetId) ||
            (connection.sourceId === editingConnection.targetId &&
              connection.targetId === editingConnection.sourceId)) &&
          connection.type === editingConnectionType
      );
      if (hasDuplicate) {
        toast.error("This connection already exists");
        return;
      }
      updateConnection(editingConnection.id, {
        type: editingConnectionType,
        note: editingConnectionNote.trim() || null,
      });
      toast.success("Relationship updated");
      closeConnectionEditor();
      setGroupedEdgeDetails(null);
    },
    [
      allConnections,
      closeConnectionEditor,
      editingConnection,
      editingConnectionNote,
      editingConnectionType,
      updateConnection,
    ]
  );

  const handleContextMenuAction = useCallback((action) => {
    if (!contextMenu?.system) return;
    const targetId = contextMenu.system.id;
    const selectedTargetIds =
      selectedNodeIdSet.has(targetId) && selectedNodeIds.length > 1
        ? selectedNodeIds
        : [targetId];

    if (action === "create-relationship") {
      setRelationshipSource(contextMenu.system);
      setRelationshipTarget(null);
      setContextMenu(null);
      setSelectedNode(null);
      onSelectedNodeIdsChange?.([]);
      return;
    }

    if (action === "view-details") {
      setSelectedNode(contextMenu.system);
      setPopoverPos({ x: contextMenu.x, y: contextMenu.y });
      setContextMenu(null);
      return;
    }

    if (action === "rename-node" || action === "edit-properties") {
      setEditSystemTarget(contextMenu.system);
      setContextMenu(null);
      return;
    }

    if (action === "hide-node") {
      onHiddenNodeIdsChange?.((prev) => [
        ...prev,
        ...selectedTargetIds.filter((id) => !prev.includes(id)),
      ]);
      onSelectedNodeIdsChange?.((prev) =>
        prev.filter((id) => !selectedTargetIds.includes(id))
      );
      if (selectedTargetIds.includes(isolatedNodeId)) {
        onIsolatedNodeIdChange?.(null);
      }
      setSelectedNode(null);
      setContextMenu(null);
      return;
    }

    if (action === "unhide-node") {
      onHiddenNodeIdsChange?.((prev) => prev.filter((id) => id !== targetId));
      setContextMenu(null);
      return;
    }

    if (action === "show-all-hidden") {
      onHiddenNodeIdsChange?.([]);
      setContextMenu(null);
      return;
    }

    if (action === "pin-node") {
      onPinnedNodeIdsChange?.((prev) => [
        ...prev,
        ...selectedTargetIds.filter((id) => !prev.includes(id)),
      ]);
      setContextMenu(null);
      return;
    }

    if (action === "unpin-node") {
      onPinnedNodeIdsChange?.((prev) => prev.filter((id) => id !== targetId));
      setContextMenu(null);
      return;
    }

    if (action === "isolate-node") {
      onHiddenNodeIdsChange?.((prev) => prev.filter((id) => id !== targetId));
      onIsolatedNodeIdChange?.(targetId);
      onSelectedNodeIdsChange?.([targetId]);
      setSelectedNode(null);
      setContextMenu(null);
      return;
    }

    if (action === "clear-isolate") {
      onIsolatedNodeIdChange?.(null);
      setContextMenu(null);
      return;
    }

    if (action === "select-node") {
      onSelectedNodeIdsChange?.((prev) =>
        prev.includes(targetId) ? prev : [...prev, targetId]
      );
      setSelectedNode(null);
      setContextMenu(null);
      return;
    }

    if (action === "deselect-node") {
      onSelectedNodeIdsChange?.((prev) => prev.filter((id) => id !== targetId));
      setSelectedNode((prev) => (prev?.id === targetId ? null : prev));
      setContextMenu(null);
      return;
    }

    if (action === "clear-selection") {
      onSelectedNodeIdsChange?.([]);
      setSelectedNode(null);
      setContextMenu(null);
      return;
    }

    if (action === "delete-node") {
      setDeleteSystemTarget(contextMenu.system);
      setContextMenu(null);
    }
  }, [
    contextMenu,
    isolatedNodeId,
    onHiddenNodeIdsChange,
    onIsolatedNodeIdChange,
    onPinnedNodeIdsChange,
    onSelectedNodeIdsChange,
    selectedNodeIdSet,
    selectedNodeIds,
  ]);

  const handleRelationshipTypeSelect = useCallback((type) => {
    if (!relationshipSource || !relationshipTarget) return;

    if (connectionExists(relationshipSource.id, relationshipTarget.id, type)) {
      toast.error("This connection already exists");
      return;
    }

    addConnection({
      sourceId: relationshipSource.id,
      targetId: relationshipTarget.id,
      type,
      note: null,
    });
    toast.success(`Connected "${relationshipSource.name}" to "${relationshipTarget.name}"`);
    resetRelationshipFlow();
  }, [addConnection, connectionExists, relationshipSource, relationshipTarget, resetRelationshipFlow]);

  const handleDeleteSystem = useCallback(() => {
    if (!deleteSystemTarget) return;
    const name = deleteSystemTarget.name;
    deleteSystem(deleteSystemTarget.id);
    setDeleteSystemTarget(null);
    setSelectedNode(null);
    onHiddenNodeIdsChange?.((prev) =>
      prev.filter((id) => id !== deleteSystemTarget.id)
    );
    onPinnedNodeIdsChange?.((prev) =>
      prev.filter((id) => id !== deleteSystemTarget.id)
    );
    onSelectedNodeIdsChange?.((prev) =>
      prev.filter((id) => id !== deleteSystemTarget.id)
    );
    if (isolatedNodeId === deleteSystemTarget.id) {
      onIsolatedNodeIdChange?.(null);
    }
    if (relationshipSource?.id === deleteSystemTarget.id || relationshipTarget?.id === deleteSystemTarget.id) {
      resetRelationshipFlow();
    }
    toast.success(`"${name}" deleted`);
  }, [
    deleteSystem,
    deleteSystemTarget,
    isolatedNodeId,
    onHiddenNodeIdsChange,
    onIsolatedNodeIdChange,
    onPinnedNodeIdsChange,
    onSelectedNodeIdsChange,
    relationshipSource,
    relationshipTarget,
    resetRelationshipFlow,
  ]);

  const handleSelectionChange = useCallback(
    ({ nodes: selectedFlowNodes = [] }) => {
      const ids = selectedFlowNodes.map((node) => node.id);
      onSelectedNodeIdsChange?.(ids);
      if (ids.length !== 1) {
        setSelectedNode(null);
      }
    },
    [onSelectedNodeIdsChange]
  );

  if (allSystems.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Add some systems to see the map.
      </div>
    );
  }

  if (systems.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No systems in this profile.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full" onMouseDown={onWrapperMouseDown}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onEdgeClick={onEdgeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onSelectionChange={handleSelectionChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        minZoom={0.2}
        maxZoom={2}
      >
        <Background color="#e2e8f0" gap={20} />
        <MiniMap
          nodeColor={(node) => node.data?.color || "#94a3b8"}
          maskColor="rgba(255,255,255,0.7)"
        />
      </ReactFlow>

      {selectedNode && (
        <SystemNodePopover
          system={selectedNode}
          position={popoverPos}
          onClose={() => setSelectedNode(null)}
        />
      )}

      <NetworkGraphContextMenu
        contextMenu={contextMenu}
        contextMenuRef={contextMenuRef}
        onAction={handleContextMenuAction}
      />

      <NetworkGraphRelationshipFlow
        relationshipSource={relationshipSource}
        relationshipTarget={relationshipTarget}
        relationshipTypeMenuPos={relationshipTypeMenuPos}
        relationshipTypeMenuRef={relationshipTypeMenuRef}
        onCancel={resetRelationshipFlow}
        onSelectType={handleRelationshipTypeSelect}
      />

      <NetworkGraphGroupedEdgeDetails
        groupedEdgeDetails={groupedEdgeDetails}
        groupedEdgeDetailsRef={groupedEdgeDetailsRef}
        mutedEdgeColor={MUTED_EDGE_COLOR}
        onOpenConnection={openConnectionEditor}
      />

      <NetworkGraphEditConnectionDialog
        editingConnectionId={editingConnectionId}
        editingSourceName={editingSourceName}
        editingTargetName={editingTargetName}
        editingConnectionType={editingConnectionType}
        editingConnectionNote={editingConnectionNote}
        setEditingConnectionType={setEditingConnectionType}
        setEditingConnectionNote={setEditingConnectionNote}
        onClose={closeConnectionEditor}
        onSave={handleSaveConnectionEdit}
      />

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
    </div>
  );
}

export function NetworkGraph(props) {
  return (
    <ReactFlowProvider>
      <NetworkGraphInner {...props} />
    </ReactFlowProvider>
  );
}
