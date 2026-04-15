import { useMemo } from "react";
import { getConnectionType } from "@/lib/constants";
import {
  getLayoutedElements,
  MUTED_EDGE_COLOR,
  NODE_WIDTH,
} from "@/lib/network-graph-layout";
import { getNodeColor } from "@/lib/network-graph-node-color";

export function useNetworkGraphElements({
  filteredSystems,
  visibleConnections,
  filteredConnections,
  filteredSystemsById,
  domains,
  layoutDirection,
  layoutKey,
  matchingSystemIds,
  edgeDisplayMode,
}) {
  return useMemo(() => {
    const filteredConnectionIdSet = new Set(
      filteredConnections.map((connection) => connection.id)
    );

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
          layoutKey,
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
          const isFilterMatch = filteredConnectionIdSet.has(conn.id);
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
        const edgeColor = hasFilterMatch
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
        const isFilterMatch = filteredConnectionIdSet.has(conn.id);
        const edgeColor = isFilterMatch ? ct?.color || "#94a3b8" : MUTED_EDGE_COLOR;
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
  ]);
}
