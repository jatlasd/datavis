"use client";

import Link from "next/link";
import { useFilteredData } from "@/hooks/use-filtered-data";
import { AlertCircle } from "lucide-react";

export function AttentionList() {
  const { systems, connections } = useFilteredData();

  const untagged = systems.filter((s) => s.domainIds.length === 0);
  const uncategorized = systems.filter((s) => (s.categoryIds || []).length === 0);
  const isolated = systems.filter((s) => {
    return !connections.some(
      (c) => c.sourceId === s.id || c.targetId === s.id
    );
  });

  if (untagged.length === 0 && uncategorized.length === 0 && isolated.length === 0) return null;

  return (
    <div className="space-y-4">
      {untagged.length > 0 && (
        <div>
          <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-amber-600">
            <AlertCircle className="size-3.5" />
            No domains assigned ({untagged.length})
          </h3>
          <ul className="space-y-0.5">
            {untagged.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/systems/${s.id}`}
                  className="text-sm hover:underline"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isolated.length > 0 && (
        <div>
          <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-amber-600">
            <AlertCircle className="size-3.5" />
            No connections ({isolated.length})
          </h3>
          <ul className="space-y-0.5">
            {isolated.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/systems/${s.id}`}
                  className="text-sm hover:underline"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {uncategorized.length > 0 && (
        <div>
          <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-amber-600">
            <AlertCircle className="size-3.5" />
            No categories assigned ({uncategorized.length})
          </h3>
          <ul className="space-y-0.5">
            {uncategorized.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/systems/${s.id}`}
                  className="text-sm hover:underline"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
