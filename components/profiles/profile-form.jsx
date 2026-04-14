"use client";

import { useState, useMemo } from "react";
import { useMapStore } from "@/store/use-map-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export function ProfileForm({ open, onOpenChange, editingProfile = null }) {
  const systems = useMapStore((s) => s.systems);
  const domains = useMapStore((s) => s.domains);
  const createProfile = useMapStore((s) => s.createProfile);
  const updateProfile = useMapStore((s) => s.updateProfile);

  const [name, setName] = useState(editingProfile?.name || "");
  const [description, setDescription] = useState(editingProfile?.description || "");
  const [selectedSystemIds, setSelectedSystemIds] = useState(
    editingProfile?.systemIds || []
  );

  const isEditing = !!editingProfile;

  function resetForm() {
    setName("");
    setDescription("");
    setSelectedSystemIds([]);
  }

  function handleOpenChange(val) {
    if (!val) resetForm();
    onOpenChange(val);
  }

  function toggleSystem(systemId) {
    setSelectedSystemIds((prev) =>
      prev.includes(systemId)
        ? prev.filter((id) => id !== systemId)
        : [...prev, systemId]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (isEditing) {
      updateProfile(editingProfile.id, {
        name: trimmed,
        description: description.trim() || null,
        systemIds: selectedSystemIds,
      });
      toast.success(`Updated "${trimmed}"`);
    } else {
      createProfile({
        name: trimmed,
        description: description.trim() || null,
        systemIds: selectedSystemIds,
      });
      toast.success(`Created "${trimmed}"`);
    }
    resetForm();
    onOpenChange(false);
  }

  const domainMap = useMemo(() => {
    const m = {};
    for (const d of domains) m[d.id] = d;
    return m;
  }, [domains]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Profile" : "Create Profile"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this profile's name, description, or systems."
                : "A profile is a curated subset of your systems."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Administrative Tools"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-desc">Description</Label>
              <Textarea
                id="profile-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            {systems.length > 0 && (
              <div className="space-y-2">
                <Label>Systems ({selectedSystemIds.length} selected)</Label>
                <div className="max-h-52 space-y-0.5 overflow-y-auto rounded-md border p-2">
                  {systems.map((sys) => {
                    const checked = selectedSystemIds.includes(sys.id);
                    const sysDomains = sys.domainIds
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
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isEditing ? "Save Changes" : "Create Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
