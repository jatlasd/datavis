"use client";

import { useState } from "react";
import { useMapStore } from "@/store/use-map-store";
import { CONNECTION_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ConnectionForm({ open, onOpenChange, sourceSystemId }) {
  const systems = useMapStore((s) => s.systems);
  const addConnection = useMapStore((s) => s.addConnection);
  const connectionExists = useMapStore((s) => s.connectionExists);
  const getSystem = useMapStore((s) => s.getSystem);

  const [targetId, setTargetId] = useState("");
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  function handleOpenChange(next) {
    if (next) {
      setTargetId("");
      setType("");
      setNote("");
      setSearch("");
    }
    onOpenChange(next);
  }

  const availableTargets = systems.filter(
    (s) => s.id !== sourceSystemId
  );

  const filteredTargets = availableTargets.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!targetId || !type) return;

    if (connectionExists(sourceSystemId, targetId, type)) {
      toast.error("This connection already exists");
      return;
    }

    const target = getSystem(targetId);
    addConnection({
      sourceId: sourceSystemId,
      targetId,
      type,
      note: note.trim() || null,
    });
    toast.success(`Connected to "${target?.name}"`);
    handleOpenChange(false);
  }

  const selectedTarget = systems.find((s) => s.id === targetId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Connection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Target System</Label>
            {targetId && selectedTarget ? (
              <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{selectedTarget.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setTargetId("")}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Command className="rounded-md border" shouldFilter={false}>
                <CommandInput
                  placeholder="Search systems..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>No systems found.</CommandEmpty>
                  <CommandGroup>
                    {filteredTargets.map((s) => (
                      <CommandItem
                        key={s.id}
                        value={s.id}
                        onSelect={(val) => {
                          setTargetId(val);
                          setSearch("");
                        }}
                      >
                        {s.name}
                        {s.vendor && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {s.vendor}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Connection Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {CONNECTION_TYPES.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value}>
                    <div className="flex flex-col">
                      <span>{ct.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {ct.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="connection-note">Note (optional)</Label>
            <Input
              id="connection-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any context about this connection"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!targetId || !type}>
              Add Connection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
