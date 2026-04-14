"use client";

import { useMemo, useState } from "react";
import { useFilteredData } from "@/hooks/use-filtered-data";
import { CONNECTION_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapGraphControls } from "@/components/map/map-graph-controls";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";

export function MapToolbar({
  domainFilter,
  setDomainFilter,
  connectionTypeFilter,
  setConnectionTypeFilter,
  searchQuery,
  setSearchQuery,
  layoutDirection,
  onToggleDirection,
  onRelayout,
  onFitView,
  stats,
  hasFilters,
}) {
  const { domains, systems, connections } = useFilteredData();
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const domainCounts = useMemo(() => {
    const counts = {};
    for (const d of domains) {
      counts[d.id] = systems.filter((s) => s.domainIds.includes(d.id)).length;
    }
    return counts;
  }, [domains, systems]);

  const typeCounts = useMemo(() => {
    const counts = {};
    for (const ct of CONNECTION_TYPES) {
      counts[ct.value] = connections.filter((c) => c.type === ct.value).length;
    }
    return counts;
  }, [connections]);

  function toggleDomain(id) {
    setDomainFilter((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function toggleConnectionType(value) {
    setConnectionTypeFilter((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  }

  function clearAll() {
    setDomainFilter([]);
    setConnectionTypeFilter([]);
  }

  const isFiltered = stats.filteredSystems !== stats.totalSystems ||
    stats.filteredConnections !== stats.totalConnections;

  return (
    <div className="border-b bg-background">
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="relative w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-8 pr-7 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <div className="flex-1 text-center text-xs text-muted-foreground">
          {isFiltered ? (
            <>
              <span className="font-medium text-foreground">{stats.filteredSystems}</span>
              {" of "}
              {stats.totalSystems}
              {stats.totalSystems === 1 ? " system" : " systems"}
              <span className="mx-1.5">&middot;</span>
              <span className="font-medium text-foreground">{stats.filteredConnections}</span>
              {" of "}
              {stats.totalConnections}
              {stats.totalConnections === 1 ? " connection" : " connections"}
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">{stats.totalSystems}</span>
              {stats.totalSystems === 1 ? " system" : " systems"}
              <span className="mx-1.5">&middot;</span>
              <span className="font-medium text-foreground">{stats.totalConnections}</span>
              {stats.totalConnections === 1 ? " connection" : " connections"}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            onClick={() => setFiltersExpanded((v) => !v)}
          >
            Filters
            {hasFilters && (
              <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                {domainFilter.length + connectionTypeFilter.length}
              </span>
            )}
            {filtersExpanded ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </Button>

          <div className="h-4 w-px bg-border" />

          <MapGraphControls
            layoutDirection={layoutDirection}
            onToggleDirection={onToggleDirection}
            onRelayout={onRelayout}
            onFitView={onFitView}
          />
        </div>
      </div>

      {filtersExpanded && (
        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">Domains:</span>
          {domains.map((d) => {
            const active = domainFilter.includes(d.id);
            const count = domainCounts[d.id] || 0;
            return (
              <button
                key={d.id}
                onClick={() => toggleDomain(d.id)}
                className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                style={active ? { backgroundColor: d.color } : undefined}
              >
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.name}
                <span className={active ? "opacity-70" : "opacity-50"}>({count})</span>
              </button>
            );
          })}

          <div className="mx-1 h-4 w-px bg-border" />

          <span className="text-xs font-medium text-muted-foreground">Types:</span>
          {CONNECTION_TYPES.map((ct) => {
            const active = connectionTypeFilter.includes(ct.value);
            const count = typeCounts[ct.value] || 0;
            return (
              <button
                key={ct.value}
                onClick={() => toggleConnectionType(ct.value)}
                className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: ct.color }}
                />
                {ct.label}
                <span className={active ? "opacity-70" : "opacity-50"}>({count})</span>
              </button>
            );
          })}

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="ml-1 h-6 px-2 text-xs">
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
