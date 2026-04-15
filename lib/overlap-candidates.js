function buildPairKey(aId, bId) {
  return [aId, bId].sort().join("::");
}

function getStrength(score) {
  if (score >= 8) return "High";
  if (score >= 5) return "Medium";
  return "Low";
}

export function buildOverlapCandidates({
  systems,
  domains,
  categories,
  connections = [],
}) {
  const domainMap = new Map(domains.map((d) => [d.id, d]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const overlapConnectionMap = new Map();
  for (const connection of connections) {
    const isOverlapType =
      connection.type === "possible_overlap" ||
      connection.type === "overlaps_with" ||
      connection.type === "duplicates";
    if (!isOverlapType) continue;
    const key = buildPairKey(connection.sourceId, connection.targetId);
    const existing = overlapConnectionMap.get(key) || [];
    overlapConnectionMap.set(key, [...existing, connection.type]);
  }

  const results = [];
  for (let i = 0; i < systems.length; i += 1) {
    const systemA = systems[i];
    for (let j = i + 1; j < systems.length; j += 1) {
      const systemB = systems[j];

      const sharedDomainIds = (systemA.domainIds || []).filter((id) =>
        (systemB.domainIds || []).includes(id)
      );
      const sharedCategoryIds = (systemA.categoryIds || []).filter((id) =>
        (systemB.categoryIds || []).includes(id)
      );

      const hasMeaningfulOverlap =
        sharedCategoryIds.length > 0 || sharedDomainIds.length >= 2;
      if (!hasMeaningfulOverlap) continue;

      const score =
        sharedCategoryIds.length * 3 +
        sharedDomainIds.length * 1 +
        (sharedCategoryIds.length > 0 && sharedDomainIds.length > 0 ? 2 : 0);
      if (score < 3) continue;

      const key = buildPairKey(systemA.id, systemB.id);
      results.push({
        key,
        systemA,
        systemB,
        sharedDomains: sharedDomainIds
          .map((id) => domainMap.get(id))
          .filter(Boolean),
        sharedCategories: sharedCategoryIds
          .map((id) => categoryMap.get(id))
          .filter(Boolean),
        score,
        strength: getStrength(score),
        existingOverlapTypes: overlapConnectionMap.get(key) || [],
      });
    }
  }

  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.systemA.name.localeCompare(b.systemA.name);
  });
}
