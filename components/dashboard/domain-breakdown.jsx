"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMapStore } from "@/store/use-map-store";

export function DomainBreakdown() {
  const domains = useMapStore((s) => s.domains);
  const systems = useMapStore((s) => s.systems);

  const breakdown = useMemo(() => {
    return domains
      .map((d) => ({
        domain: d,
        count: systems.filter((s) => s.domainIds.includes(d.id)).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [domains, systems]);

  const maxCount = Math.max(...breakdown.map((b) => b.count), 1);

  if (breakdown.length === 0) return null;

  return (
    <div className="space-y-2">
      {breakdown.map(({ domain, count }) => (
        <Link
          key={domain.id}
          href={`/domains/${domain.id}`}
          className="group flex items-center gap-3"
        >
          <span className="w-32 truncate text-sm font-medium group-hover:underline">
            {domain.name}
          </span>
          <div className="relative h-5 flex-1 overflow-hidden rounded bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded transition-all"
              style={{
                width: `${Math.max((count / maxCount) * 100, 2)}%`,
                backgroundColor: domain.color,
              }}
            />
          </div>
          <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">
            {count}
          </span>
        </Link>
      ))}
    </div>
  );
}
