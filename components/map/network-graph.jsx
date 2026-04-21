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
import { NODE_HEIGHT, NODE_WIDTH } from "@/lib/network-graph-layout";
import { ParallelRelationshipEdge } from "@/components/map/parallel-relationship-edge";
import { TypedSystemNode } from "@/components/map/typed-system-node";
import { NetworkGraphContextMenu } from "@/components/map/network-graph-context-menu";
import { NetworkGraphRelationshipFlow } from "@/components/map/network-graph-relationship-flow";
import { MapShortcutHints } from "@/components/map/map-shortcut-hints";
import {
  edgeSelection,
  emptyInspectorSelection,
  inspectorSelectionFromNodeIds,
} from "@/lib/map-inspector-selection";
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
  setInspectorSelection,
  onClearMapSelection,
  renderInspector,
}) {
  const allSystems = useMapStore((s) => s.systems);
  const allConnections = useMapStore((s) => s.connections);
  const addConnection = useMapStore((s) => s.addConnection);
  const connectionExists = useMapStore((s) => s.connectionExists);
  const deleteSystem = useMapStore((s) => s.deleteSystem);
  const { systems, domains, connections } = useFilteredData();
  const { fitView, setCenter, getNodes } = useReactFlow();

  const [contextMenu, setContextMenu] = useState(null);
  const [relationshipSource, setRelationshipSource] = useState(null);
  const [relationshipTarget, setRelationshipTarget] = useState(null);
  const [relationshipTypeMenuPos, setRelationshipTypeMenuPos] = useState({
    x: 0,
    y: 0,
  });
  const [editSystemTarget, setEditSystemTarget] = useState(null);
  const [deleteSystemTarget, setDeleteSystemTarget] = useState(null);
  const contextMenuRef = useRef(null);
  const relationshipTypeMenuRef = useRef(null);
  const nodeMouseDownPosRef = useRef(null);
  const didNodeDragRef = useRef(false);
  const ignoreNodeClickUntilRef = useRef(0);
  const nodePositionsRef = useRef(new Map());
  const layoutSignatureRef = useRef(`${layoutDirection}:${layoutKey}`);
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
      setInspectorSelection(inspectorSelectionFromNodeIds(nextSelected));
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
    setInspectorSelection,
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
    const nextSignature = `${layoutDirection}:${layoutKey}`;
    const shouldPreservePositions = layoutSignatureRef.current === nextSignature;
    layoutSignatureRef.current = nextSignature;

    setNodes((prevNodes) => {
      const prevNodesById = new Map(prevNodes.map((node) => [node.id, node]));
      return initialNodes.map((node) => {
        const prevNode = prevNodesById.get(node.id);
        const cachedPosition = nodePositionsRef.current.get(node.id);
        const preservedPosition = shouldPreservePositions
          ? prevNode?.position || cachedPosition
          : null;
        if (!preservedPosition) return node;
        return {
          ...node,
          position: { ...preservedPosition },
        };
      });
    });
    setEdges(initialEdges);
  }, [
    initialNodes,
    initialEdges,
    layoutDirection,
    layoutKey,
    setNodes,
    setEdges,
  ]);

  useEffect(() => {
    const nextPositions = new Map(nodePositionsRef.current);
    for (const node of nodes) {
      nextPositions.set(node.id, { ...node.position });
    }
    nodePositionsRef.current = nextPositions;
  }, [nodes]);

  useEffect(() => {
    const nextPositions = new Map();
    for (const [id, position] of nodePositionsRef.current.entries()) {
      if (allSystemIdSet.has(id)) {
        nextPositions.set(id, position);
      }
    }
    nodePositionsRef.current = nextPositions;
  }, [allSystemIdSet]);

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

  const inspectorHandlers = useMemo(
    () => ({
      startRelationshipFromSystem: (system) => {
        setRelationshipSource(system);
        setRelationshipTarget(null);
        setContextMenu(null);
        setInspectorSelection(emptyInspectorSelection());
        onSelectedNodeIdsChange?.([]);
      },
      openSystemEdit: (system) => {
        setEditSystemTarget(system);
      },
      confirmDeleteSystem: (system) => {
        setDeleteSystemTarget(system);
      },
      hideNodes: (ids) => {
        onHiddenNodeIdsChange?.((prev) => [
          ...prev,
          ...ids.filter((id) => !prev.includes(id)),
        ]);
        onSelectedNodeIdsChange?.((prev) =>
          prev.filter((id) => !ids.includes(id))
        );
        if (ids.includes(isolatedNodeId)) {
          onIsolatedNodeIdChange?.(null);
        }
        setInspectorSelection(emptyInspectorSelection());
      },
      unhideNode: (id) => {
        onHiddenNodeIdsChange?.((prev) => prev.filter((nid) => nid !== id));
      },
      pinNodes: (ids) => {
        onPinnedNodeIdsChange?.((prev) => [
          ...new Set([...prev, ...ids.filter((id) => !prev.includes(id))]),
        ]);
      },
      unpinNode: (id) => {
        onPinnedNodeIdsChange?.((prev) => prev.filter((nid) => nid !== id));
      },
      isolateNode: (id) => {
        onHiddenNodeIdsChange?.((prev) => prev.filter((nid) => nid !== id));
        onIsolatedNodeIdChange?.(id);
        onSelectedNodeIdsChange?.([id]);
        setInspectorSelection({ kind: "node", systemId: id });
      },
      clearIsolate: () => {
        onIsolatedNodeIdChange?.(null);
      },
    }),
    [
      isolatedNodeId,
      onHiddenNodeIdsChange,
      onIsolatedNodeIdChange,
      onPinnedNodeIdsChange,
      onSelectedNodeIdsChange,
      setInspectorSelection,
    ]
  );

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

    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setContextMenu(null);
        setRelationshipTarget(null);
        onClearMapSelection?.();
        if (relationshipSource) {
          resetRelationshipFlow();
        }
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const target = event.target;
      if (
        target &&
        typeof target.closest === "function" &&
        target.closest('input, textarea, [contenteditable="true"]')
      ) {
        return;
      }

      if (
        editSystemTarget ||
        deleteSystemTarget ||
        contextMenu ||
        relationshipTarget
      ) {
        return;
      }

      if (selectedNodeIds.length !== 1) return;
      const selectedId = selectedNodeIds[0];
      const system = allSystemsById.get(selectedId);
      if (!system) return;

      const key = event.key.toLowerCase();

      if (key === "h") {
        event.preventDefault();
        if (hiddenNodeIdSet.has(selectedId)) {
          onHiddenNodeIdsChange?.((prev) => prev.filter((id) => id !== selectedId));
        } else {
          onHiddenNodeIdsChange?.((prev) =>
            prev.includes(selectedId) ? prev : [...prev, selectedId]
          );
          onSelectedNodeIdsChange?.((prev) => prev.filter((id) => id !== selectedId));
          if (isolatedNodeId === selectedId) onIsolatedNodeIdChange?.(null);
          setInspectorSelection(emptyInspectorSelection());
        }
        return;
      }

      if (hiddenNodeIdSet.has(selectedId)) return;

      if (key === "p") {
        event.preventDefault();
        if (pinnedNodeIdSet.has(selectedId)) {
          onPinnedNodeIdsChange?.((prev) => prev.filter((id) => id !== selectedId));
        } else {
          onPinnedNodeIdsChange?.((prev) =>
            prev.includes(selectedId) ? prev : [...prev, selectedId]
          );
        }
        return;
      }

      if (key === "i") {
        event.preventDefault();
        if (isolatedNodeId === selectedId) {
          onIsolatedNodeIdChange?.(null);
        } else {
          onHiddenNodeIdsChange?.((prev) => prev.filter((id) => id !== selectedId));
          onIsolatedNodeIdChange?.(selectedId);
          onSelectedNodeIdsChange?.([selectedId]);
          setInspectorSelection({ kind: "node", systemId: selectedId });
        }
        return;
      }

      if (key === "r" || key === "e") {
        event.preventDefault();
        setEditSystemTarget(system);
        return;
      }

      if (key === "c") {
        event.preventDefault();
        setRelationshipSource(system);
        setRelationshipTarget(null);
        setInspectorSelection(emptyInspectorSelection());
        onSelectedNodeIdsChange?.([]);
        return;
      }

      if (key === "v" || event.key === "Enter") {
        event.preventDefault();
        setInspectorSelection({ kind: "node", systemId: selectedId });
        return;
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
    onClearMapSelection,
    onSelectedNodeIdsChange,
    resetRelationshipFlow,
    selectedNodeIds,
    hiddenNodeIdSet,
    pinnedNodeIdSet,
    isolatedNodeId,
    allSystemsById,
    editSystemTarget,
    deleteSystemTarget,
    onHiddenNodeIdsChange,
    onPinnedNodeIdsChange,
    onIsolatedNodeIdChange,
    setInspectorSelection,
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
    const isMultiSelect = event.shiftKey || event.metaKey || event.ctrlKey;
    if (relationshipSource) {
      if (node.id === relationshipSource.id) {
        toast.error("Select a different node to create this relationship");
        return;
      }

      setInspectorSelection(emptyInspectorSelection());
      onSelectedNodeIdsChange?.([]);
      setRelationshipTarget(node.data.system);
      setRelationshipTypeMenuPos({ x: event.clientX, y: event.clientY });
      return;
    }

    if (isMultiSelect) {
      onSelectedNodeIdsChange?.((prev) => {
        const next = prev.includes(node.id)
          ? prev.filter((id) => id !== node.id)
          : [...prev, node.id];
        setInspectorSelection(inspectorSelectionFromNodeIds(next));
        return next;
      });
      return;
    }

    onSelectedNodeIdsChange?.([node.id]);
    setInspectorSelection(inspectorSelectionFromNodeIds([node.id]));
  }, [
    onSelectedNodeIdsChange,
    relationshipSource,
    setInspectorSelection,
  ]);

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
    setRelationshipTarget(null);
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
    onClearMapSelection?.();
    setContextMenu(null);
    setRelationshipTarget(null);
    if (relationshipSource) {
      resetRelationshipFlow();
    }
  }, [onClearMapSelection, relationshipSource, resetRelationshipFlow]);

  const onEdgeClick = useCallback(
    (_event, edge) => {
      setContextMenu(null);
      setRelationshipTarget(null);
      if (edgeDisplayMode !== "grouped") {
        onSelectedNodeIdsChange?.([]);
        setInspectorSelection(edgeSelection(edge.id));
        return;
      }
      const groupedRelationships = edge.data?.groupedRelationships;
      if (!groupedRelationships || groupedRelationships.length === 0) return;
      onSelectedNodeIdsChange?.([]);
      setInspectorSelection({
        kind: "groupedEdge",
        sourceId: edge.source,
        targetId: edge.target,
        sourceName: edge.data?.sourceName || "Unknown",
        targetName: edge.data?.targetName || "Unknown",
        relationships: groupedRelationships,
      });
    },
    [edgeDisplayMode, onSelectedNodeIdsChange, setInspectorSelection]
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
      setInspectorSelection(emptyInspectorSelection());
      onSelectedNodeIdsChange?.([]);
      return;
    }

    if (action === "view-details") {
      onSelectedNodeIdsChange?.([contextMenu.system.id]);
      setInspectorSelection({ kind: "node", systemId: contextMenu.system.id });
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
      setInspectorSelection(emptyInspectorSelection());
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
      setInspectorSelection({ kind: "node", systemId: targetId });
      setContextMenu(null);
      return;
    }

    if (action === "clear-isolate") {
      onIsolatedNodeIdChange?.(null);
      setContextMenu(null);
      return;
    }

    if (action === "select-node") {
      onSelectedNodeIdsChange?.((prev) => {
        const next = prev.includes(targetId) ? prev : [...prev, targetId];
        setInspectorSelection(inspectorSelectionFromNodeIds(next));
        return next;
      });
      setContextMenu(null);
      return;
    }

    if (action === "deselect-node") {
      onSelectedNodeIdsChange?.((prev) => {
        const next = prev.filter((id) => id !== targetId);
        setInspectorSelection(inspectorSelectionFromNodeIds(next));
        return next;
      });
      setContextMenu(null);
      return;
    }

    if (action === "clear-selection") {
      onSelectedNodeIdsChange?.([]);
      setInspectorSelection(emptyInspectorSelection());
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
    setInspectorSelection,
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
    setInspectorSelection(emptyInspectorSelection());
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
    setInspectorSelection,
  ]);

  const handleSelectionChange = useCallback(
    ({ nodes: selectedFlowNodes = [] }) => {
      const ids = selectedFlowNodes.map((node) => node.id);
      onSelectedNodeIdsChange?.(ids);
      setInspectorSelection(inspectorSelectionFromNodeIds(ids));
    },
    [onSelectedNodeIdsChange, setInspectorSelection]
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
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col md:flex-row">
      <div
        className="relative min-h-0 min-w-0 flex-1"
        onMouseDown={onWrapperMouseDown}
      >
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

      <MapShortcutHints active={selectedNodeIds.length === 1} />

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
      {renderInspector?.(inspectorHandlers)}
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
