"use client";

import { useCallback, useState } from "react";
import { NetworkGraph } from "@/components/map/network-graph";
import { MapToolbar } from "@/components/map/map-toolbar";

export default function MapPage() {
  const [domainFilter, setDomainFilter] = useState([]);
  const [connectionTypeFilter, setConnectionTypeFilter] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [layoutDirection, setLayoutDirection] = useState("LR");
  const [edgeDisplayMode, setEdgeDisplayMode] = useState("separate");
  const [layoutKey, setLayoutKey] = useState(0);
  const [fitViewKey, setFitViewKey] = useState(0);
  const [stats, setStats] = useState({
    filteredSystems: 0,
    totalSystems: 0,
    filteredConnections: 0,
    totalConnections: 0,
  });

  const handleRelayout = useCallback(() => {
    setLayoutKey((k) => k + 1);
  }, []);

  const handleFitView = useCallback(() => {
    setFitViewKey((k) => k + 1);
  }, []);

  const handleToggleDirection = useCallback(() => {
    setLayoutDirection((d) => (d === "LR" ? "TB" : "LR"));
  }, []);

  const hasFilters = domainFilter.length > 0 || connectionTypeFilter.length > 0;

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <MapToolbar
        domainFilter={domainFilter}
        setDomainFilter={setDomainFilter}
        connectionTypeFilter={connectionTypeFilter}
        setConnectionTypeFilter={setConnectionTypeFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        layoutDirection={layoutDirection}
        onToggleDirection={handleToggleDirection}
        onRelayout={handleRelayout}
        onFitView={handleFitView}
        edgeDisplayMode={edgeDisplayMode}
        onEdgeDisplayModeChange={setEdgeDisplayMode}
        stats={stats}
        hasFilters={hasFilters}
      />
      <div className="flex-1">
        <NetworkGraph
          domainFilter={domainFilter}
          connectionTypeFilter={connectionTypeFilter}
          searchQuery={searchQuery}
          layoutDirection={layoutDirection}
          edgeDisplayMode={edgeDisplayMode}
          layoutKey={layoutKey}
          fitViewKey={fitViewKey}
          onStatsChange={setStats}
        />
      </div>
    </div>
  );
}
