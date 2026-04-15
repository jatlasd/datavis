"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useMapStore } from "@/store/use-map-store";
import { CATEGORY_COLORS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CategoryForm({ open, onOpenChange, category }) {
  const addCategory = useMapStore((s) => s.addCategory);
  const updateCategory = useMapStore((s) => s.updateCategory);

  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLORS[0].value);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (category) {
      updateCategory(category.id, {
        name: trimmedName,
        description: description.trim() || null,
        color,
      });
      toast.success(`"${trimmedName}" updated`);
    } else {
      addCategory({
        name: trimmedName,
        description: description.trim() || null,
        color,
      });
      toast.success(`"${trimmedName}" created`);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Assessment"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What capability does this category represent?"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((c) => (
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
              {category ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
