function uniqueIds(ids) {
  return Array.from(new Set((ids || []).filter(Boolean)));
}

export function createEmptyMapSelection() {
  return {
    kind: "empty",
    nodeIds: [],
  };
}

export function createNodeMapSelection(nodeId) {
  if (!nodeId) return createEmptyMapSelection();
  return {
    kind: "node",
    nodeId,
    nodeIds: [nodeId],
  };
}

export function createMultiMapSelection(nodeIds) {
  const ids = uniqueIds(nodeIds);
  if (ids.length === 0) return createEmptyMapSelection();
  if (ids.length === 1) return createNodeMapSelection(ids[0]);
  return {
    kind: "multi",
    nodeIds: ids,
  };
}

export function createEdgeMapSelection(connectionId) {
  if (!connectionId) return createEmptyMapSelection();
  return {
    kind: "edge",
    connectionId,
    nodeIds: [],
  };
}

export function createGroupedEdgeMapSelection({
  sourceId,
  targetId,
  connectionIds,
  activeConnectionId,
}) {
  const ids = uniqueIds(connectionIds);
  if (ids.length === 0) return createEmptyMapSelection();
  return {
    kind: "grouped-edge",
    sourceId,
    targetId,
    connectionIds: ids,
    activeConnectionId: ids.includes(activeConnectionId) ? activeConnectionId : ids[0],
    nodeIds: [],
  };
}

export function getSelectionNodeIds(selection) {
  return Array.isArray(selection?.nodeIds) ? selection.nodeIds : [];
}

export function isSameMapSelection(a, b) {
  if (a === b) return true;
  if (!a || !b || a.kind !== b.kind) return false;
  if (a.kind === "empty") return true;
  if (a.kind === "node") return a.nodeId === b.nodeId;
  if (a.kind === "multi") {
    return (
      a.nodeIds.length === b.nodeIds.length &&
      a.nodeIds.every((id, index) => id === b.nodeIds[index])
    );
  }
  if (a.kind === "edge") return a.connectionId === b.connectionId;
  if (a.kind === "grouped-edge") {
    return (
      a.sourceId === b.sourceId &&
      a.targetId === b.targetId &&
      a.activeConnectionId === b.activeConnectionId &&
      a.connectionIds.length === b.connectionIds.length &&
      a.connectionIds.every((id, index) => id === b.connectionIds[index])
    );
  }
  return false;
}

export function sanitizeMapSelection(selection, { systemIds, connectionIds }) {
  if (!selection) return createEmptyMapSelection();

  if (selection.kind === "node") {
    return systemIds.has(selection.nodeId)
      ? selection
      : createEmptyMapSelection();
  }

  if (selection.kind === "multi") {
    const validIds = selection.nodeIds.filter((id) => systemIds.has(id));
    const nextSelection = createMultiMapSelection(validIds);
    return isSameMapSelection(selection, nextSelection) ? selection : nextSelection;
  }

  if (selection.kind === "edge") {
    return connectionIds.has(selection.connectionId)
      ? selection
      : createEmptyMapSelection();
  }

  if (selection.kind === "grouped-edge") {
    const validIds = selection.connectionIds.filter((id) => connectionIds.has(id));
    const nextSelection = createGroupedEdgeMapSelection({
      sourceId: selection.sourceId,
      targetId: selection.targetId,
      connectionIds: validIds,
      activeConnectionId: selection.activeConnectionId,
    });
    return isSameMapSelection(selection, nextSelection) ? selection : nextSelection;
  }

  return createEmptyMapSelection();
}
