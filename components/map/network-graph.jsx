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
import dagre from "dagre";
import { useMapStore } from "@/store/use-map-store";
import { useFilteredData } from "@/hooks/use-filtered-data";
import { CONNECTION_TYPES, getConnectionType } from "@/lib/constants";
import { SystemNodePopover } from "@/components/map/system-popover";
import { ParallelRelationshipEdge } from "@/components/map/parallel-relationship-edge";
import { TypedSystemNode } from "@/components/map/typed-system-node";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;
const MUTED_EDGE_COLOR = "#9ca3af";

function getLayoutedElements(nodes, edges, direction = "LR") {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 120 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function getNodeColor(system, domains) {
  if (system.domainIds.length === 0) return "#94a3b8";
  const firstDomain = domains.find((d) => d.id === system.domainIds[0]);
  return firstDomain?.color || "#94a3b8";
}

function NetworkGraphInner({
  domainFilter,
  connectionTypeFilter,
  searchQuery,
  layoutDirection,
  edgeDisplayMode,
  layoutKey,
  fitViewKey,
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

  const filteredSystems = useMemo(() => {
    if (domainFilter.length === 0) return systems;
    return systems.filter((s) =>
      s.domainIds.some((did) => domainFilter.includes(did))
    );
  }, [systems, domainFilter]);

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

  const { initialNodes, initialEdges } = useMemo(() => {
    const rawNodes = filteredSystems.map((sys) => {
      const color = getNodeColor(sys, domains);
      const isSearchActive = matchingSystemIds !== null;
      const isMatch = matchingSystemIds?.has(sys.id);
      const dimmed = isSearchActive && !isMatch;

      return {
        id: sys.id,
        type: "typedSystem",
        data: {
          label: sys.name,
          system: sys,
          color,
          isMatch,
          dimmed,
          layoutDirection,
        },
        position: { x: 0, y: 0 },
        style: {
          background: "transparent",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: 0,
          fontSize: "13px",
          fontWeight: 500,
          width: NODE_WIDTH,
          textAlign: "center",
          transition: "opacity 0.2s",
        },
      };
    });

    const groupedByDirection = new Map();
    for (const conn of visibleConnections) {
      const key = `${conn.sourceId}::${conn.targetId}`;
      if (!groupedByDirection.has(key)) {
        groupedByDirection.set(key, []);
      }
      groupedByDirection.get(key).push(conn);
    }

    const rawEdges = [];

    for (const group of groupedByDirection.values()) {
      const sortedGroup = [...group].sort(
        (a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id)
      );

      if (edgeDisplayMode === "grouped") {
        const relationships = sortedGroup.map((conn) => {
          const ct = getConnectionType(conn.type);
          const isFilterMatch = connectionMatchesFilters(conn);
          return {
            id: conn.id,
            type: conn.type,
            label: ct?.label || conn.type,
            color: ct?.color || "#94a3b8",
            isFilterMatch,
          };
        });
        const hasFilterMatch = relationships.some(
          (relationship) => relationship.isFilterMatch
        );
        const hasDirectional = sortedGroup.some(
          (conn) => getConnectionType(conn.type)?.directional
        );
        const edgeColor =
          hasFilterMatch
            ? relationships.length === 1
              ? relationships[0].color
              : "#64748b"
            : MUTED_EDGE_COLOR;
        const source = sortedGroup[0].sourceId;
        const target = sortedGroup[0].targetId;
        const sourceSystem = filteredSystemsById.get(source);
        const targetSystem = filteredSystemsById.get(target);

        rawEdges.push({
          id: `grouped-${source}-${target}`,
          source,
          target,
          sourceHandle: "out-generic",
          targetHandle: "in-generic",
          label:
            relationships.length === 1
              ? relationships[0].label
              : `${relationships.length} relationships`,
          type: "default",
          animated:
            hasFilterMatch &&
            sortedGroup.some(
              (conn) => conn.type === "feeds_into" || conn.type === "depends_on"
            ),
          style: {
            stroke: edgeColor,
            strokeWidth: hasFilterMatch ? 2.2 : 1.5,
            opacity: hasFilterMatch ? 1 : 0.5,
          },
          labelStyle: { fontSize: 10, fill: edgeColor },
          markerEnd: hasDirectional
            ? { type: "arrowclosed", color: edgeColor }
            : undefined,
          data: {
            groupedRelationships: relationships,
            sourceName: sourceSystem?.name || "Unknown",
            targetName: targetSystem?.name || "Unknown",
          },
        });
        continue;
      }

      sortedGroup.forEach((conn, index) => {
        const ct = getConnectionType(conn.type);
        const isFilterMatch = connectionMatchesFilters(conn);
        const edgeColor = isFilterMatch
          ? ct?.color || "#94a3b8"
          : MUTED_EDGE_COLOR;
        rawEdges.push({
          id: conn.id,
          source: conn.sourceId,
          target: conn.targetId,
          sourceHandle: `out-${conn.type}`,
          targetHandle: `in-${conn.type}`,
          label: ct?.label || conn.type,
          type: "parallelRelationship",
          animated:
            isFilterMatch &&
            (conn.type === "feeds_into" || conn.type === "depends_on"),
          style: {
            stroke: edgeColor,
            strokeWidth: isFilterMatch ? 1.8 : 1.35,
            opacity: isFilterMatch ? 1 : 0.5,
          },
          labelStyle: { fontSize: 10, fill: edgeColor },
          markerEnd: ct?.directional
            ? { type: "arrowclosed", color: edgeColor }
            : undefined,
          data: {
            parallelIndex: index,
            parallelCount: sortedGroup.length,
            isFilterMatch,
          },
        });
      });
    }

    if (rawNodes.length === 0) return { initialNodes: [], initialEdges: [] };

    const layout = getLayoutedElements(rawNodes, rawEdges, layoutDirection);
    return { initialNodes: layout.nodes, initialEdges: layout.edges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filteredSystems,
    visibleConnections,
    filteredConnections,
    filteredSystemsById,
    domains,
    layoutDirection,
    layoutKey,
    matchingSystemIds,
    edgeDisplayMode,
    connectionMatchesFilters,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

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
    groupedEdgeDetails,
    closeConnectionEditor,
    resetRelationshipFlow,
  ]);

  const onNodeClick = useCallback((event, node) => {
    setContextMenu(null);
    setGroupedEdgeDetails(null);
    if (relationshipSource) {
      if (node.id === relationshipSource.id) {
        toast.error("Select a different node to create this relationship");
        return;
      }

      setSelectedNode(null);
      setRelationshipTarget(node.data.system);
      setRelationshipTypeMenuPos({ x: event.clientX, y: event.clientY });
      return;
    }

    setSelectedNode(node.data.system);
    setPopoverPos({ x: event.clientX, y: event.clientY });
  }, [relationshipSource]);

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
    });
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setContextMenu(null);
    setRelationshipTarget(null);
    setGroupedEdgeDetails(null);
    closeConnectionEditor();
    if (relationshipSource) {
      resetRelationshipFlow();
    }
  }, [relationshipSource, closeConnectionEditor, resetRelationshipFlow]);

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

    if (action === "create-relationship") {
      setRelationshipSource(contextMenu.system);
      setRelationshipTarget(null);
      setContextMenu(null);
      setSelectedNode(null);
      return;
    }

    if (action === "rename-node" || action === "edit-properties") {
      setEditSystemTarget(contextMenu.system);
      setContextMenu(null);
      return;
    }

    if (action === "delete-node") {
      setDeleteSystemTarget(contextMenu.system);
      setContextMenu(null);
    }
  }, [contextMenu]);

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
    if (relationshipSource?.id === deleteSystemTarget.id || relationshipTarget?.id === deleteSystemTarget.id) {
      resetRelationshipFlow();
    }
    toast.success(`"${name}" deleted`);
  }, [deleteSystem, deleteSystemTarget, relationshipSource, relationshipTarget, resetRelationshipFlow]);

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
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
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

      {contextMenu && (
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
            onClick={() => handleContextMenuAction("create-relationship")}
          >
            Create Relationship
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={() => handleContextMenuAction("rename-node")}
          >
            Rename Node
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={() => handleContextMenuAction("edit-properties")}
          >
            Edit Properties
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
            onClick={() => handleContextMenuAction("delete-node")}
          >
            Delete Node
          </button>
        </div>
      )}

      {relationshipSource && (
        <div className="absolute left-3 top-3 z-40 flex items-center gap-2 rounded-md border bg-background/95 px-3 py-2 text-sm shadow-sm">
          <span>
            Creating relationship from <strong>{relationshipSource.name}</strong>. Click a target node.
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetRelationshipFlow}
          >
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
              onClick={() => handleRelationshipTypeSelect(connectionType.value)}
            >
              <div>{connectionType.label}</div>
              <div className="text-xs text-muted-foreground">{connectionType.description}</div>
            </button>
          ))}
        </div>
      )}

      {groupedEdgeDetails && (
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
                onClick={() => openConnectionEditor(relationship.id)}
              >
                <span
                  className="inline-block size-2 rounded-full"
                  style={{
                    backgroundColor: relationship.isFilterMatch
                      ? relationship.color
                      : MUTED_EDGE_COLOR,
                  }}
                />
                <span
                  className={
                    relationship.isFilterMatch ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {relationship.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(editingConnectionId)}
        onOpenChange={(open) => {
          if (!open) closeConnectionEditor();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Relationship</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveConnectionEdit} className="grid gap-4">
            <div className="text-xs text-muted-foreground">
              {editingSourceName} &rarr; {editingTargetName}
            </div>
            <div className="grid gap-2">
              <Label>Connection Type</Label>
              <Select value={editingConnectionType} onValueChange={setEditingConnectionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {CONNECTION_TYPES.map((connectionType) => (
                    <SelectItem key={connectionType.value} value={connectionType.value}>
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
              <Label htmlFor="edit-connection-note">Note</Label>
              <Textarea
                id="edit-connection-note"
                value={editingConnectionNote}
                onChange={(event) => setEditingConnectionNote(event.target.value)}
                placeholder="Any context about this connection"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeConnectionEditor}>
                Cancel
              </Button>
              <Button type="submit" disabled={!editingConnectionType}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SystemForm
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
