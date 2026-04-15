"use client";

import { useMemo } from "react";
import { FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { useMapStore } from "@/store/use-map-store";
import { useFilteredData } from "@/hooks/use-filtered-data";
import { buildOverlapCandidates } from "@/lib/overlap-candidates";
import { OverlapCandidateList } from "@/components/overlaps/overlap-candidate-list";

export default function OverlapsPage() {
  const addConnection = useMapStore((s) => s.addConnection);
  const connectionExists = useMapStore((s) => s.connectionExists);
  const { systems, domains, categories, connections, activeProfile } = useFilteredData();

  const candidates = useMemo(
    () =>
      buildOverlapCandidates({
        systems,
        domains,
        categories,
        connections,
      }),
    [systems, domains, categories, connections]
  );

  const highCount = useMemo(
    () => candidates.filter((candidate) => candidate.strength === "High").length,
    [candidates]
  );

  function handleConfirm(candidate, type) {
    if (connectionExists(candidate.systemA.id, candidate.systemB.id, type)) {
      toast.message("This relationship is already recorded");
      return;
    }

    addConnection({
      sourceId: candidate.systemA.id,
      targetId: candidate.systemB.id,
      type,
      note: `Overlap review score ${candidate.score} (${candidate.strength})`,
    });
    toast.success("Relationship recorded");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Overlap Review</h1>
        {activeProfile && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            <FolderOpen className="size-3" />
            {activeProfile.name}
          </span>
        )}
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border p-3">
          <p className="text-xs text-muted-foreground">Candidates</p>
          <p className="text-xl font-semibold">{candidates.length}</p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-xs text-muted-foreground">High Strength</p>
          <p className="text-xl font-semibold">{highCount}</p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-xs text-muted-foreground">Systems Considered</p>
          <p className="text-xl font-semibold">{systems.length}</p>
        </div>
      </div>

      <OverlapCandidateList candidates={candidates} onConfirm={handleConfirm} />
    </div>
  );
}
