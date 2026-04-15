"use client";

import { useMapStore } from "@/store/use-map-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";

export function CategoryPicker({ systemId }) {
  const categories = useMapStore((s) => s.categories);
  const system = useMapStore((s) => s.systems.find((sys) => sys.id === systemId));
  const toggleSystemCategory = useMapStore((s) => s.toggleSystemCategory);

  const assignedCount = system?.categoryIds?.length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          {assignedCount > 0 ? `Categories (${assignedCount})` : "Add Categories"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="max-h-64 overflow-y-auto p-2">
          {categories.length === 0 ? (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
              No categories created yet.
            </p>
          ) : (
            <div className="grid gap-0.5">
              {categories.map((category) => {
                const checked = system?.categoryIds?.includes(category.id) ?? false;
                return (
                  <label
                    key={category.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() =>
                        toggleSystemCategory(systemId, category.id)
                      }
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
          )}
        </div>
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-1.5"
            disabled
          >
            <Plus className="size-3.5" />
            Create Category
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
