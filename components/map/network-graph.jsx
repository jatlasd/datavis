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
import { getConnectionType } from "@/lib/constants";
import { SystemNodePopover } from "@/components/map/system-popover";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;

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
  layoutKey,
  fitViewKey,
  onStatsChange,
}) {
  const allSystems = useMapStore((s) => s.systems);
  const allConnections = useMapStore((s) => s.connections);
  const { systems, domains, connections } = useFilteredData();
  const { fitView, setCenter, getNodes } = useReactFlow();

  const [selectedNode, setSelectedNode] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });

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

  const filteredConnections = useMemo(() => {
    return connections.filter((c) => {
      if (!filteredSystemIds.has(c.sourceId) || !filteredSystemIds.has(c.targetId))
        return false;
      if (connectionTypeFilter.length > 0 && !connectionTypeFilter.includes(c.type))
        return false;
      return true;
    });
  }, [connections, filteredSystemIds, connectionTypeFilter]);

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
        data: {
          label: sys.name,
          system: sys,
          color,
        },
        position: { x: 0, y: 0 },
        style: {
          background: color,
          color: "#fff",
          border: isMatch ? "2px solid #fff" : "none",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "13px",
          fontWeight: 500,
          width: NODE_WIDTH,
          textAlign: "center",
          opacity: dimmed ? 0.25 : 1,
          boxShadow: isMatch ? `0 0 12px ${color}` : undefined,
          transition: "opacity 0.2s, box-shadow 0.2s",
        },
      };
    });

    const rawEdges = filteredConnections.map((conn) => {
      const ct = getConnectionType(conn.type);
      const edgeColor = ct?.color || "#94a3b8";
      return {
        id: conn.id,
        source: conn.sourceId,
        target: conn.targetId,
        label: ct?.label || conn.type,
        type: ct?.directional ? "default" : "straight",
        animated: conn.type === "feeds_into" || conn.type === "depends_on",
        style: { stroke: edgeColor, strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fill: edgeColor },
        markerEnd: ct?.directional
          ? { type: "arrowclosed", color: edgeColor }
          : undefined,
      };
    });

    if (rawNodes.length === 0) return { initialNodes: [], initialEdges: [] };

    const layout = getLayoutedElements(rawNodes, rawEdges, layoutDirection);
    return { initialNodes: layout.nodes, initialEdges: layout.edges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSystems, filteredConnections, domains, layoutDirection, layoutKey, matchingSystemIds]);

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

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data.system);
    setPopoverPos({ x: event.clientX, y: event.clientY });
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
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
