export const emptyInspectorSelection = () => ({ kind: "empty" });

export function inspectorSelectionFromNodeIds(nodeIds) {
  if (nodeIds.length === 0) {
    return emptyInspectorSelection();
  }
  if (nodeIds.length === 1) {
    return { kind: "node", systemId: nodeIds[0] };
  }
  return { kind: "nodes", systemIds: [...nodeIds] };
}

export function isEdgeOrGroupedInspector(sel) {
  return sel.kind === "edge" || sel.kind === "groupedEdge";
}

export function edgeSelection(connectionId, restoreGrouped = null) {
  if (restoreGrouped) {
    return { kind: "edge", connectionId, restoreGrouped };
  }
  return { kind: "edge", connectionId };
}
