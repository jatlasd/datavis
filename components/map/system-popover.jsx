"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useMapStore } from "@/store/use-map-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink } from "lucide-react";

export function SystemNodePopover({ system, position, onClose }) {
  const liveSystem = useMapStore((s) =>
    s.systems.find((entry) => entry.id === system.id)
  );
  const domains = useMapStore((s) => s.domains);
  const categories = useMapStore((s) => s.categories);
  const toggleSystemCategory = useMapStore((s) => s.toggleSystemCategory);
  const getConnectionCount = useMapStore((s) => s.getConnectionCount);
  const ref = useRef(null);

  const assignedDomains = domains.filter((d) =>
    (liveSystem?.domainIds || []).includes(d.id)
  );
  const assignedCategories = categories.filter((c) =>
    (liveSystem?.categoryIds || []).includes(c.id)
  );
  const connectionCount = getConnectionCount(liveSystem?.id || system.id);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const left = Math.min(position.x + 8, window.innerWidth - 280);
  const top = Math.min(position.y + 8, window.innerHeight - 360);

  return (
    <div
      ref={ref}
      className="fixed z-50 w-64 rounded-lg border bg-popover p-3 text-sm shadow-lg"
      style={{ left, top }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="mb-2 font-medium">{liveSystem?.name || system.name}</div>
      {(liveSystem?.vendor || system.vendor) && (
        <p className="mb-1 text-xs text-muted-foreground">{liveSystem?.vendor || system.vendor}</p>
      )}
      {assignedDomains.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {assignedDomains.map((d) => (
            <Badge
              key={d.id}
              className="text-white"
              style={{ backgroundColor: d.color }}
            >
              {d.name}
            </Badge>
          ))}
        </div>
      )}
      {assignedCategories.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {assignedCategories.map((c) => (
            <Badge
              key={c.id}
              className="text-white"
              style={{ backgroundColor: c.color }}
            >
              {c.name}
            </Badge>
          ))}
        </div>
      )}
      <p className="mb-3 text-xs text-muted-foreground">
        {connectionCount} {connectionCount === 1 ? "connection" : "connections"}
      </p>
      <div className="mb-3">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          Categories
        </p>
        {categories.length === 0 ? (
          <p className="text-xs text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="max-h-28 space-y-0.5 overflow-y-auto rounded border p-1">
            {categories.map((category) => {
              const checked = (liveSystem?.categoryIds || []).includes(category.id);
              return (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-muted"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() =>
                      toggleSystemCategory(liveSystem?.id || system.id, category.id)
                    }
                  />
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="truncate">{category.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
      <Button asChild size="sm" variant="outline" className="w-full">
        <Link href={`/systems/${liveSystem?.id || system.id}`}>
          View Details
          <ExternalLink className="size-3" />
        </Link>
      </Button>
    </div>
  );
}
