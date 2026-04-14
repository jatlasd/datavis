"use client";

import { useState, useMemo } from "react";
import { useMapStore } from "@/store/use-map-store";
import { useFilteredData } from "@/hooks/use-filtered-data";
import { SystemTable } from "@/components/systems/system-table";
import { SystemForm } from "@/components/systems/system-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Filter, X, FolderOpen } from "lucide-react";

export default function SystemsPage() {
  const allSystems = useMapStore((s) => s.systems);
  const allDomains = useMapStore((s) => s.domains);
  const toggleSystemInProfile = useMapStore((s) => s.toggleSystemInProfile);
  const { systems, domains, activeProfile, activeProfileId } = useFilteredData();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDomainIds, setSelectedDomainIds] = useState([]);

  function toggleFilter(domainId) {
    setSelectedDomainIds((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId]
    );
  }

  function clearFilters() {
    setSelectedDomainIds([]);
  }

  const filteredSystems = useMemo(() => {
    if (selectedDomainIds.length === 0) return systems;
    return systems.filter((sys) =>
      selectedDomainIds.every((did) => sys.domainIds.includes(did))
    );
  }, [systems, selectedDomainIds]);

  const domainMap = useMemo(() => {
    const m = {};
    for (const d of allDomains) {
      m[d.id] = d;
    }
    return m;
  }, [allDomains]);

  const profileSystemIds = activeProfile
    ? new Set(activeProfile.systemIds)
    : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Systems</h1>
          {activeProfile && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <FolderOpen className="size-3" />
              {activeProfile.name}
            </span>
          )}
        </div>
        {allSystems.length > 0 && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Add System
          </Button>
        )}
      </div>

      {systems.length > 0 && domains.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="size-3.5" />
                Filter by Domain
                {selectedDomainIds.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5">
                    {selectedDomainIds.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <div className="max-h-64 overflow-y-auto p-2">
                <div className="grid gap-0.5">
                  {domains.map((domain) => {
                    const checked = selectedDomainIds.includes(domain.id);
                    return (
                      <label
                        key={domain.id}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleFilter(domain.id)}
                        />
                        <span
                          className="inline-block size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: domain.color }}
                        />
                        <span className="truncate">{domain.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {selectedDomainIds.map((did) => {
            const d = domainMap[did];
            if (!d) return null;
            return (
              <Badge
                key={d.id}
                className="cursor-pointer gap-1 text-white"
                style={{ backgroundColor: d.color }}
                onClick={() => toggleFilter(d.id)}
              >
                {d.name}
                <X className="size-3" />
              </Badge>
            );
          })}

          {selectedDomainIds.length > 1 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>
      )}

      {allSystems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="mb-1 text-lg font-medium">No systems yet</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Systems represent the tools and platforms in your tech stack.
          </p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Add System
          </Button>
        </div>
      ) : systems.length === 0 && activeProfile ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="mb-1 text-lg font-medium">No systems in this profile</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Edit the profile to add systems, or switch to &ldquo;All Systems&rdquo; to see everything.
          </p>
        </div>
      ) : (
        <SystemTable
          systems={filteredSystems}
          domains={allDomains}
          activeProfileId={activeProfileId}
          profileSystemIds={profileSystemIds}
          onToggleProfileSystem={activeProfileId ? (systemId) => toggleSystemInProfile(activeProfileId, systemId) : null}
        />
      )}

      <SystemForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
