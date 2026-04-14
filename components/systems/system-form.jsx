"use client";

import { useState, useEffect } from "react";
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

export function SystemForm({ open, onOpenChange, system }) {
  const addSystem = useMapStore((s) => s.addSystem);
  const updateSystem = useMapStore((s) => s.updateSystem);

  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName(system?.name ?? "");
      setVendor(system?.vendor ?? "");
      setUrl(system?.url ?? "");
      setDescription(system?.description ?? "");
    }
  }, [open, system]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    if (system) {
      updateSystem(system.id, {
        name: name.trim(),
        vendor: vendor.trim() || null,
        url: url.trim() || null,
        description: description.trim() || null,
      });
      toast.success(`"${name.trim()}" updated`);
    } else {
      addSystem({
        name: name.trim(),
        vendor: vendor.trim() || null,
        url: url.trim() || null,
        description: description.trim() || null,
        domainIds: [],
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
