import { useMemo } from "react";
import { useMapStore } from "@/store/use-map-store";

export function useFilteredData() {
  const systems = useMapStore((s) => s.systems);
  const domains = useMapStore((s) => s.domains);
  const profileDomains = useMapStore((s) => s.profileDomains);
  const categories = useMapStore((s) => s.categories);
  const connections = useMapStore((s) => s.connections);
  const profiles = useMapStore((s) => s.profiles);
  const activeProfileId = useMapStore((s) => s.activeProfileId);

  return useMemo(() => {
    const activeProfile = activeProfileId
      ? profiles.find((p) => p.id === activeProfileId) ?? null
      : null;

    if (!activeProfile) {
      return {
        systems,
        domains,
        profileDomains,
        categories,
        connections,
        activeProfile: null,
        activeProfileId,
      };
    }

    const systemIdSet = new Set(activeProfile.systemIds);
    const filteredSystems = systems.filter((s) => systemIdSet.has(s.id));
    const selectedGlobalDomainIds = new Set(activeProfile.globalDomainIds || []);
    const scopedGlobalDomains = domains.filter((domain) =>
      selectedGlobalDomainIds.has(domain.id)
    );
    const scopedProfileDomains = profileDomains.filter(
      (domain) => domain.profileId === activeProfile.id
    );
    const scopedDomains = [...scopedGlobalDomains, ...scopedProfileDomains];
    const scopedDomainIds = new Set(scopedDomains.map((domain) => domain.id));
    const scopedSystems = filteredSystems.map((system) => ({
      ...system,
      domainIds: (system.domainIds || []).filter((domainId) =>
        scopedDomainIds.has(domainId)
      ),
    }));
    const categoryIdSet = new Set(
      filteredSystems.flatMap((s) => s.categoryIds || [])
    );
    const filteredCategories = categories.filter((c) => categoryIdSet.has(c.id));
    const filteredConnections = connections.filter(
      (c) => systemIdSet.has(c.sourceId) && systemIdSet.has(c.targetId)
    );

    return {
      systems: scopedSystems,
      domains: scopedDomains,
      profileDomains: scopedProfileDomains,
      categories: filteredCategories,
      connections: filteredConnections,
      activeProfile,
      activeProfileId,
    };
  }, [
    systems,
    domains,
    profileDomains,
    categories,
    connections,
    profiles,
    activeProfileId,
  ]);
}
