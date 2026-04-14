"use client";

import Link from "next/link";
import { useMapStore } from "@/store/use-map-store";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DomainCard({ domain }) {
  const systemCount = useMapStore((s) =>
    s.systems.filter((sys) => sys.domainIds.includes(domain.id)).length
  );

  return (
    <Link href={`/domains/${domain.id}`} className="block">
      <Card className="h-full transition-colors hover:bg-muted/50" style={{ borderLeft: `4px solid ${domain.color}` }}>
        <CardHeader>
          <CardTitle>{domain.name}</CardTitle>
          {domain.description && (
            <CardDescription className="line-clamp-2">
              {domain.description}
            </CardDescription>
          )}
          <p className="text-xs text-muted-foreground">
            {systemCount} {systemCount === 1 ? "system" : "systems"}
          </p>
        </CardHeader>
      </Card>
    </Link>
  );
}
