"use client";

import { useState, useMemo } from "react";
import { useMapStore } from "@/store/use-map-store";
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
import { Plus, Filter, X } from "lucide-react";

export default function SystemsPage() {
  const systems = useMapStore((s) => s.systems);
  const domains = useMapStore((s) => s.domains);
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
    for (const d of domains) {
      m[d.id] = d;
    }
    return m;
  }, [domains]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Systems</h1>
        {systems.length > 0 && (
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

      {systems.length === 0 ? (
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
      ) : (
        <SystemTable systems={filteredSystems} domains={domains} />
      )}

      <SystemForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
