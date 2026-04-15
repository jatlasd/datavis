"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function OverlapCandidateList({ candidates, onConfirm }) {
  if (candidates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No overlap candidates yet. Assign domains and categories to systems to generate candidates.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {candidates.map((candidate) => (
        <div key={candidate.key} className="rounded-lg border p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Link href={`/systems/${candidate.systemA.id}`} className="font-medium hover:underline">
                {candidate.systemA.name}
              </Link>
              <span className="text-muted-foreground">vs</span>
              <Link href={`/systems/${candidate.systemB.id}`} className="font-medium hover:underline">
                {candidate.systemB.name}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Score {candidate.score}</Badge>
              <Badge
                className={
                  candidate.strength === "High"
                    ? "bg-red-600 text-white"
                    : candidate.strength === "Medium"
                      ? "bg-amber-600 text-white"
                      : "bg-slate-600 text-white"
                }
              >
                {candidate.strength}
              </Badge>
            </div>
          </div>

          <div className="mb-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Shared Domains</p>
              <div className="flex flex-wrap gap-1">
                {candidate.sharedDomains.length > 0 ? (
                  candidate.sharedDomains.map((domain) => (
                    <Badge
                      key={domain.id}
                      className="text-white"
                      style={{ backgroundColor: domain.color }}
                    >
                      {domain.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Shared Categories</p>
              <div className="flex flex-wrap gap-1">
                {candidate.sharedCategories.length > 0 ? (
                  candidate.sharedCategories.map((category) => (
                    <Badge
                      key={category.id}
                      className="text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
            </div>
          </div>

          {candidate.existingOverlapTypes.length > 0 && (
            <p className="mb-3 text-xs text-muted-foreground">
              Existing review tags: {candidate.existingOverlapTypes.join(", ")}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onConfirm(candidate, "possible_overlap")}>
              Mark Possible Overlap
            </Button>
            <Button size="sm" variant="outline" onClick={() => onConfirm(candidate, "overlaps_with")}>
              Mark Overlaps
            </Button>
            <Button size="sm" variant="outline" onClick={() => onConfirm(candidate, "duplicates")}>
              Mark Duplicates
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
