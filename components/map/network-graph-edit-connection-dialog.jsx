"use client";

import { CONNECTION_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NetworkGraphEditConnectionDialog({
  editingConnectionId,
  editingSourceName,
  editingTargetName,
  editingConnectionType,
  editingConnectionNote,
  setEditingConnectionType,
  setEditingConnectionNote,
  onClose,
  onSave,
}) {
  return (
    <Dialog
      open={Boolean(editingConnectionId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Relationship</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSave} className="grid gap-4">
          <div className="text-xs text-muted-foreground">
            {editingSourceName} &rarr; {editingTargetName}
          </div>
          <div className="grid gap-2">
            <Label>Connection Type</Label>
            <Select value={editingConnectionType} onValueChange={setEditingConnectionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {CONNECTION_TYPES.map((connectionType) => (
                  <SelectItem key={connectionType.value} value={connectionType.value}>
                    <div className="flex flex-col">
                      <span>{connectionType.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {connectionType.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-connection-note">Note</Label>
            <Textarea
              id="edit-connection-note"
              value={editingConnectionNote}
              onChange={(event) => setEditingConnectionNote(event.target.value)}
              placeholder="Any context about this connection"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!editingConnectionType}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
