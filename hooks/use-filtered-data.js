import { useMemo } from "react";
import { useMapStore } from "@/store/use-map-store";

export function useFilteredData() {
  const systems = useMapStore((s) => s.systems);
  const domains = useMapStore((s) => s.domains);
  const connections = useMapStore((s) => s.connections);
  const profiles = useMapStore((s) => s.profiles);
  const activeProfileId = useMapStore((s) => s.activeProfileId);

  return useMemo(() => {
    const activeProfile = activeProfileId
      ? profiles.find((p) => p.id === activeProfileId) ?? null
      : null;

    if (!activeProfile) {
      return { systems, domains, connections, activeProfile: null, activeProfileId };
    }

    const systemIdSet = new Set(activeProfile.systemIds);
    const filteredSystems = systems.filter((s) => systemIdSet.has(s.id));
    const domainIdSet = new Set(filteredSystems.flatMap((s) => s.domainIds));
    const filteredDomains = domains.filter((d) => domainIdSet.has(d.id));
    const filteredConnections = connections.filter(
      (c) => systemIdSet.has(c.sourceId) && systemIdSet.has(c.targetId)
    );

    return {
      systems: filteredSystems,
      domains: filteredDomains,
      connections: filteredConnections,
      activeProfile,
      activeProfileId,
    };
  }, [systems, domains, connections, profiles, activeProfileId]);
}
