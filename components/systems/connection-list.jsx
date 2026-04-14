"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMapStore } from "@/store/use-map-store";
import { getConnectionLabel, CONNECTION_TYPES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X, ArrowRight } from "lucide-react";

export function ConnectionList({ systemId }) {
  const connections = useMapStore((s) => s.connections);
  const systems = useMapStore((s) => s.systems);
  const deleteConnection = useMapStore((s) => s.deleteConnection);

  const systemConnections = useMemo(
    () =>
      connections.filter(
        (c) => c.sourceId === systemId || c.targetId === systemId
      ),
    [connections, systemId]
  );

  const systemsById = useMemo(
    () => new Map(systems.map((sys) => [sys.id, sys])),
    [systems]
  );

  const grouped = useMemo(() => {
    const groups = {};
    for (const conn of systemConnections) {
      const isSource = conn.sourceId === systemId;
      const label = getConnectionLabel(conn.type, isSource);
      const otherId = isSource ? conn.targetId : conn.sourceId;
      const other = systemsById.get(otherId);

      if (!groups[label]) groups[label] = [];
      groups[label].push({ ...conn, other, label });
    }

    const typeOrder = CONNECTION_TYPES.map((t) => t.label);
    const inverseOrder = CONNECTION_TYPES.map((t) => t.inverseLabel);
    const allLabels = [...new Set([...typeOrder, ...inverseOrder])];

    return Object.entries(groups).sort(([a], [b]) => {
      const ai = allLabels.indexOf(a);
      const bi = allLabels.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [systemConnections, systemId, systemsById]);

  if (systemConnections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No connections yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([label, items]) => (
        <div key={label}>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            {label}
          </h3>
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                <Link
                  href={`/systems/${item.other?.id}`}
                  className="font-medium hover:underline"
                >
                  {item.other?.name || "Unknown"}
                </Link>
                {item.note && (
                  <span className="truncate text-xs text-muted-foreground">
                    — {item.note}
                  </span>
                )}
                <div className="ml-auto">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <X className="size-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove connection?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the connection to &ldquo;{item.other?.name}&rdquo;.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => deleteConnection(item.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
