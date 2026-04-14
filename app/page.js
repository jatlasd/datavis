"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useMapStore } from "@/store/use-map-store";
import { generateSeedData } from "@/lib/seed-data";
import { StatCard } from "@/components/dashboard/stat-card";
import { DomainBreakdown } from "@/components/dashboard/domain-breakdown";
import { AttentionList } from "@/components/dashboard/attention-list";
import { Button } from "@/components/ui/button";
import { Server, Layers, Network, ArrowRight, Plus, Database } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const systems = useMapStore((s) => s.systems);
  const domains = useMapStore((s) => s.domains);
  const connections = useMapStore((s) => s.connections);

  const topConnected = useMemo(() => {
    const counts = {};
    for (const c of connections) {
      counts[c.sourceId] = (counts[c.sourceId] || 0) + 1;
      counts[c.targetId] = (counts[c.targetId] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => {
        const sys = systems.find((s) => s.id === id);
        return sys ? { system: sys, count } : null;
      })
      .filter(Boolean);
  }, [connections, systems]);

  const isEmpty = systems.length === 0 && domains.length === 0;

  function handleLoadSeed() {
    const data = generateSeedData();
    useMapStore.setState({
      domains: data.domains,
      systems: data.systems,
      connections: data.connections,
    });
    toast.success("Loaded demo data — 15 systems, 10 domains, 13 connections");
  }

  if (isEmpty) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-24 text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted">
          <Network className="size-8 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Welcome to Datapus
        </h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          Map your tech stack, see where tools overlap, and understand your dependencies. Start by creating domains and adding systems.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/domains">
              <Plus className="size-4" />
              Create Domains
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/systems">
              <Server className="size-4" />
              Add Systems
            </Link>
          </Button>
          <Button variant="outline" onClick={handleLoadSeed}>
            <Database className="size-4" />
            Load Demo Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/systems">
              <Server className="size-3.5" />
              Systems
              <ArrowRight className="size-3" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/map">
              <Network className="size-3.5" />
              Map
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Systems" value={systems.length} icon={Server} />
        <StatCard label="Domains" value={domains.length} icon={Layers} />
        <StatCard label="Connections" value={connections.length} icon={Network} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-medium">Systems by Domain</h2>
          {domains.length > 0 ? (
            <DomainBreakdown />
          ) : (
            <p className="text-sm text-muted-foreground">
              Create domains to see the breakdown.
            </p>
          )}
        </section>

        <div className="space-y-8">
          {topConnected.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-medium">Most Connected</h2>
              <div className="space-y-1.5">
                {topConnected.map(({ system, count }) => (
                  <Link
                    key={system.id}
                    href={`/systems/${system.id}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                  >
                    <span className="font-medium">{system.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {count} {count === 1 ? "connection" : "connections"}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-lg font-medium">Needs Attention</h2>
            <AttentionList />
            {systems.every((s) => s.domainIds.length > 0) &&
              connections.length > 0 &&
              systems.every((s) =>
                connections.some(
                  (c) => c.sourceId === s.id || c.targetId === s.id
                )
              ) && (
                <p className="text-sm text-muted-foreground">
                  All systems have domains and connections assigned.
                </p>
              )}
          </section>
        </div>
      </div>
    </div>
  );
}
