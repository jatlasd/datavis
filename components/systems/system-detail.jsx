"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMapStore } from "@/store/use-map-store";
import { useFilteredData } from "@/hooks/use-filtered-data";
import { SystemForm } from "@/components/systems/system-form";
import { DomainPicker } from "@/components/systems/domain-picker";
import { CategoryPicker } from "@/components/systems/category-picker";
import { ConnectionForm } from "@/components/systems/connection-form";
import { ConnectionList } from "@/components/systems/connection-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Pencil, Trash2, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";

export function SystemDetail({ systemId }) {
  const router = useRouter();
  const systems = useMapStore((s) => s.systems);
  const { domains } = useFilteredData();
  const categories = useMapStore((s) => s.categories);
  const connections = useMapStore((s) => s.connections);
  const deleteSystem = useMapStore((s) => s.deleteSystem);

  const system = useMemo(
    () => systems.find((entry) => entry.id === systemId),
    [systems, systemId]
  );

  const [editOpen, setEditOpen] = useState(false);
  const [connectionFormOpen, setConnectionFormOpen] = useState(false);

  if (!system) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 text-center">
        <p className="text-muted-foreground">System not found.</p>
      </div>
    );
  }

  const assignedDomains = domains.filter((d) => system.domainIds.includes(d.id));
  const assignedCategories = categories.filter((c) =>
    (system.categoryIds || []).includes(c.id)
  );
  const connectionCount = connections.filter(
    (c) => c.sourceId === systemId || c.targetId === systemId
  ).length;

  function handleDelete() {
    const name = system.name;
    deleteSystem(systemId);
    toast.success(`"${name}" deleted`);
    router.push("/systems");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{system.name}</h1>
          {system.vendor && (
            <p className="mt-1 text-sm text-muted-foreground">{system.vendor}</p>
          )}
          {system.url && (
            <a
              href={system.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {system.url}
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &ldquo;{system.name}&rdquo;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the system and all its connections. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {system.description && (
        <p className="mb-8 text-sm text-muted-foreground">{system.description}</p>
      )}

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-lg font-medium">Domains</h2>
          <DomainPicker systemId={systemId} />
        </div>
        {assignedDomains.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
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
        ) : (
          <p className="text-sm text-muted-foreground">No domains assigned yet.</p>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-lg font-medium">Categories</h2>
          <CategoryPicker systemId={systemId} />
        </div>
        {assignedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {assignedCategories.map((category) => (
              <Badge
                key={category.id}
                className="text-white"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No categories assigned yet.</p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-lg font-medium">
            Connections ({connectionCount})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConnectionFormOpen(true)}
          >
            <Plus className="size-3.5" />
            Add Connection
          </Button>
        </div>
        <ConnectionList systemId={systemId} />
      </section>

      <SystemForm
        key={`${system.id}-${editOpen ? "open" : "closed"}`}
        open={editOpen}
        onOpenChange={setEditOpen}
        system={system}
      />
      <ConnectionForm
        open={connectionFormOpen}
        onOpenChange={setConnectionFormOpen}
        sourceSystemId={systemId}
      />
    </div>
  );
}
