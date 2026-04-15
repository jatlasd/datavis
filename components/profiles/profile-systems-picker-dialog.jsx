"use client";

import { useMemo, useState } from "react";
import { useMapStore } from "@/store/use-map-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { toast } from "sonner";

export function ProfileSystemsPickerDialog({ open, onOpenChange, profile }) {
  const systems = useMapStore((s) => s.systems);
  const domains = useMapStore((s) => s.domains);
  const categories = useMapStore((s) => s.categories);
  const updateProfile = useMapStore((s) => s.updateProfile);

  const [selectedSystemIds, setSelectedSystemIds] = useState(profile?.systemIds || []);
  const [search, setSearch] = useState("");
  const [selectedDomainIds, setSelectedDomainIds] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const domainMap = useMemo(() => {
    const m = {};
    for (const d of domains) m[d.id] = d;
    return m;
  }, [domains]);

  const categoryMap = useMemo(() => {
    const m = {};
    for (const c of categories) m[c.id] = c;
    return m;
  }, [categories]);

  const filterDomains = useMemo(() => {
    const ids = new Set(systems.flatMap((sys) => sys.domainIds || []));
    return domains.filter((domain) => ids.has(domain.id));
  }, [systems, domains]);

  const filterCategories = useMemo(() => {
    const ids = new Set(systems.flatMap((sys) => sys.categoryIds || []));
    return categories.filter((category) => ids.has(category.id));
  }, [systems, categories]);

  const filteredSystems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return systems.filter((sys) => {
      const matchesSearch =
        query.length === 0 ||
        sys.name.toLowerCase().includes(query) ||
        (sys.vendor || "").toLowerCase().includes(query);
      const matchesDomains =
        selectedDomainIds.length === 0 ||
        selectedDomainIds.every((did) => (sys.domainIds || []).includes(did));
      const matchesCategories =
        selectedCategoryIds.length === 0 ||
        selectedCategoryIds.every((cid) =>
          (sys.categoryIds || []).includes(cid)
        );
      return matchesSearch && matchesDomains && matchesCategories;
    });
  }, [systems, search, selectedDomainIds, selectedCategoryIds]);

  function toggleSystem(systemId) {
    setSelectedSystemIds((prev) =>
      prev.includes(systemId)
        ? prev.filter((id) => id !== systemId)
        : [...prev, systemId]
    );
  }

  function toggleDomainFilter(domainId) {
    setSelectedDomainIds((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId]
    );
  }

  function toggleCategoryFilter(categoryId) {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }

  function selectFilteredSystems() {
    const filteredIds = filteredSystems.map((sys) => sys.id);
    setSelectedSystemIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  }

  function clearFilteredSystems() {
    const filteredIdSet = new Set(filteredSystems.map((sys) => sys.id));
    setSelectedSystemIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
  }

  function handleSave() {
    if (!profile) return;
    updateProfile(profile.id, { systemIds: selectedSystemIds });
    toast.success(`Updated systems in "${profile.name}"`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Existing Systems</DialogTitle>
          <DialogDescription>
            Choose systems from the shared catalog for {profile?.name || "this profile"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label>Systems ({selectedSystemIds.length} selected)</Label>
            {selectedSystemIds.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedSystemIds([])}>
                Clear all selected
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search systems by name or vendor"
              className="h-8 w-full sm:w-72"
            />

            {filterDomains.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Filter className="size-3.5" />
                    Filter domains
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
                      {filterDomains.map((domain) => {
                        const checked = selectedDomainIds.includes(domain.id);
                        return (
                          <label
                            key={domain.id}
                            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleDomainFilter(domain.id)}
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
            )}

            {filterCategories.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Filter className="size-3.5" />
                    Filter categories
                    {selectedCategoryIds.length > 0 && (
                      <Badge variant="secondary" className="ml-1.5">
                        {selectedCategoryIds.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                  <div className="max-h-64 overflow-y-auto p-2">
                    <div className="grid gap-0.5">
                      {filterCategories.map((category) => {
                        const checked = selectedCategoryIds.includes(category.id);
                        return (
                          <label
                            key={category.id}
                            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleCategoryFilter(category.id)}
                            />
                            <span
                              className="inline-block size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="truncate">{category.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {(selectedDomainIds.length > 0 || selectedCategoryIds.length > 0) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDomainIds([]);
                  setSelectedCategoryIds([]);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedDomainIds.map((did) => {
              const domain = domainMap[did];
              if (!domain) return null;
              return (
                <Badge
                  key={domain.id}
                  className="cursor-pointer gap-1 text-white"
                  style={{ backgroundColor: domain.color }}
                  onClick={() => toggleDomainFilter(domain.id)}
                >
                  {domain.name}
                  <X className="size-3" />
                </Badge>
              );
            })}
            {selectedCategoryIds.map((cid) => {
              const category = categoryMap[cid];
              if (!category) return null;
              return (
                <Badge
                  key={category.id}
                  className="cursor-pointer gap-1 text-white"
                  style={{ backgroundColor: category.color }}
                  onClick={() => toggleCategoryFilter(category.id)}
                >
                  {category.name}
                  <X className="size-3" />
                </Badge>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-2 py-1.5 text-xs text-muted-foreground">
            <span>
              Showing {filteredSystems.length} of {systems.length} systems
            </span>
            <div className="flex items-center gap-1.5">
              <Button type="button" variant="ghost" size="sm" onClick={selectFilteredSystems}>
                Select shown
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearFilteredSystems}>
                Clear shown
              </Button>
            </div>
          </div>

          <div className="max-h-72 space-y-0.5 overflow-y-auto rounded-md border p-2">
            {filteredSystems.map((sys) => {
              const checked = selectedSystemIds.includes(sys.id);
              const sysDomains = (sys.domainIds || [])
                .map((did) => domainMap[did])
                .filter(Boolean);
              return (
                <label
                  key={sys.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleSystem(sys.id)}
                  />
                  <span className="flex-1 truncate">{sys.name}</span>
                  {sysDomains.length > 0 && (
                    <div className="flex gap-1">
                      {sysDomains.slice(0, 3).map((d) => (
                        <span
                          key={d.id}
                          className="inline-block size-2 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                      ))}
                    </div>
                  )}
                </label>
              );
            })}
            {filteredSystems.length === 0 && (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                No systems match the current filters.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Profile Systems
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
