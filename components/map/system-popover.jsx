"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useMapStore } from "@/store/use-map-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function SystemNodePopover({ system, position, onClose }) {
  const domains = useMapStore((s) => s.domains);
  const getConnectionCount = useMapStore((s) => s.getConnectionCount);
  const ref = useRef(null);

  const assignedDomains = domains.filter((d) =>
    system.domainIds.includes(d.id)
  );
  const connectionCount = getConnectionCount(system.id);

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
  const top = Math.min(position.y + 8, window.innerHeight - 200);

  return (
    <div
      ref={ref}
      className="fixed z-50 w-64 rounded-lg border bg-popover p-3 text-sm shadow-lg"
      style={{ left, top }}
    >
      <div className="mb-2 font-medium">{system.name}</div>
      {system.vendor && (
        <p className="mb-1 text-xs text-muted-foreground">{system.vendor}</p>
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
      <p className="mb-3 text-xs text-muted-foreground">
        {connectionCount} {connectionCount === 1 ? "connection" : "connections"}
      </p>
      <Button asChild size="sm" variant="outline" className="w-full">
        <Link href={`/systems/${system.id}`}>
          View Details
          <ExternalLink className="size-3" />
        </Link>
      </Button>
    </div>
  );
}
