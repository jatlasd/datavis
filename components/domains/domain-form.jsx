"use client";

import { useState, useEffect } from "react";
import { useMapStore } from "@/store/use-map-store";
import { DOMAIN_COLORS } from "@/lib/constants";
import { toast } from "sonner";
import { Check } from "lucide-react";
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

export function DomainForm({ open, onOpenChange, domain }) {
  const addDomain = useMapStore((s) => s.addDomain);
  const updateDomain = useMapStore((s) => s.updateDomain);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DOMAIN_COLORS[0].value);

  useEffect(() => {
    if (open) {
      setName(domain?.name ?? "");
      setDescription(domain?.description ?? "");
      setColor(domain?.color ?? DOMAIN_COLORS[0].value);
    }
  }, [open, domain]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    if (domain) {
      updateDomain(domain.id, { name: name.trim(), description: description.trim() || null, color });
      toast.success(`"${name.trim()}" updated`);
    } else {
      addDomain({ name: name.trim(), description: description.trim() || null, color });
      toast.success(`"${name.trim()}" created`);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{domain ? "Edit Domain" : "New Domain"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="domain-name">Name</Label>
            <Input
              id="domain-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Student Information"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="domain-description">Description</Label>
            <Textarea
              id="domain-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this domain cover?"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {DOMAIN_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-label={c.label}
                  className={`flex size-6 items-center justify-center rounded-full transition-all ${
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-offset-background"
                      : "hover:scale-110"
                  }`}
                  style={{
                    backgroundColor: c.value,
                    ...(color === c.value ? { "--tw-ring-color": c.value } : {}),
                  }}
                  onClick={() => setColor(c.value)}
                >
                  {color === c.value && <Check className="size-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>
              {domain ? "Save Changes" : "Create Domain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
