export function getNodeColor(system, domains) {
  if (system.domainIds.length === 0) return "#94a3b8";
  const firstDomain = domains.find((d) => d.id === system.domainIds[0]);
  return firstDomain?.color || "#94a3b8";
}
