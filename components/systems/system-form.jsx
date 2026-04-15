"use client";

import { useState } from "react";
import { useMapStore } from "@/store/use-map-store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function SystemForm({ open, onOpenChange, system }) {
  const addSystem = useMapStore((s) => s.addSystem);
  const updateSystem = useMapStore((s) => s.updateSystem);
  const categories = useMapStore((s) => s.categories);

  const [name, setName] = useState(system?.name ?? "");
  const [vendor, setVendor] = useState(system?.vendor ?? "");
  const [url, setUrl] = useState(system?.url ?? "");
  const [description, setDescription] = useState(system?.description ?? "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(system?.categoryIds ?? []);

  function toggleCategory(categoryId) {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    if (system) {
      updateSystem(system.id, {
        name: name.trim(),
        vendor: vendor.trim() || null,
        url: url.trim() || null,
        description: description.trim() || null,
        categoryIds: selectedCategoryIds,
      });
      toast.success(`"${name.trim()}" updated`);
    } else {
      addSystem({
        name: name.trim(),
        vendor: vendor.trim() || null,
        url: url.trim() || null,
        description: description.trim() || null,
        domainIds: [],
        categoryIds: selectedCategoryIds,
      });
      toast.success(`"${name.trim()}" created`);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{system ? "Edit System" : "New System"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="system-name">Name</Label>
            <Input
              id="system-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Salesforce"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="system-vendor">Vendor</Label>
            <Input
              id="system-vendor"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Salesforce Inc."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="system-url">URL</Label>
            <Input
              id="system-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="system-description">Description</Label>
            <Textarea
              id="system-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this system do?"
              rows={3}
            />
          </div>
          {categories.length > 0 && (
            <div className="grid gap-2">
              <Label>Categories ({selectedCategoryIds.length} selected)</Label>
              <div className="max-h-40 space-y-0.5 overflow-y-auto rounded-md border p-2">
                {categories.map((category) => {
                  const checked = selectedCategoryIds.includes(category.id);
                  return (
                    <label
                      key={category.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleCategory(category.id)}
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
          )}
          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>
              {system ? "Save Changes" : "Create System"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
