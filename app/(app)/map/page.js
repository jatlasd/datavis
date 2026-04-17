"use client";

import { useCallback, useState } from "react";
import { NetworkGraph } from "@/components/map/network-graph";
import { MapToolbar } from "@/components/map/map-toolbar";
import { MapTutorial } from "@/components/map/map-tutorial";
import { useMapTutorial } from "@/hooks/use-map-tutorial";

export default function MapPage() {
  const [domainFilter, setDomainFilter] = useState([]);
  const [connectionTypeFilter, setConnectionTypeFilter] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [layoutDirection, setLayoutDirection] = useState("LR");
  const [edgeDisplayMode, setEdgeDisplayMode] = useState("separate");
  const [hiddenNodeIds, setHiddenNodeIds] = useState([]);
  const [pinnedNodeIds, setPinnedNodeIds] = useState([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [isolatedNodeId, setIsolatedNodeId] = useState(null);
  const [layoutKey, setLayoutKey] = useState(0);
  const [fitViewKey, setFitViewKey] = useState(0);
  const [stats, setStats] = useState({
    filteredSystems: 0,
    totalSystems: 0,
    filteredConnections: 0,
    totalConnections: 0,
  });

  const tutorial = useMapTutorial();

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
        hiddenNodeCount={hiddenNodeIds.length}
        onShowAllHiddenNodes={() => setHiddenNodeIds([])}
        hasIsolateMode={Boolean(isolatedNodeId)}
        onClearIsolateMode={() => setIsolatedNodeId(null)}
        stats={stats}
        hasFilters={hasFilters}
        onReplayTutorial={tutorial.start}
      />
      <div className="flex-1" data-tutorial="graph">
        <NetworkGraph
          domainFilter={domainFilter}
          connectionTypeFilter={connectionTypeFilter}
          searchQuery={searchQuery}
          layoutDirection={layoutDirection}
          edgeDisplayMode={edgeDisplayMode}
          layoutKey={layoutKey}
          fitViewKey={fitViewKey}
          hiddenNodeIds={hiddenNodeIds}
          onHiddenNodeIdsChange={setHiddenNodeIds}
          pinnedNodeIds={pinnedNodeIds}
          onPinnedNodeIdsChange={setPinnedNodeIds}
          selectedNodeIds={selectedNodeIds}
          onSelectedNodeIdsChange={setSelectedNodeIds}
          isolatedNodeId={isolatedNodeId}
          onIsolatedNodeIdChange={setIsolatedNodeId}
          onStatsChange={setStats}
        />
      </div>
      {tutorial.isOpen && <MapTutorial onClose={tutorial.close} />}
    </div>
  );
}
