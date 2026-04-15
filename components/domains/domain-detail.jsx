"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMapStore } from "@/store/use-map-store";
import { DomainForm } from "@/components/domains/domain-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
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
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DomainDetail({ domainId }) {
  const router = useRouter();
  const allSystems = useMapStore((s) => s.systems);
  const allDomains = useMapStore((s) => s.domains);
  const profileDomains = useMapStore((s) => s.profileDomains);
  const deleteDomain = useMapStore((s) => s.deleteDomain);
  const deleteProfileDomain = useMapStore((s) => s.deleteProfileDomain);

  const combinedDomains = useMemo(
    () => [...allDomains, ...profileDomains],
    [allDomains, profileDomains]
  );
  const domain = useMemo(
    () => combinedDomains.find((entry) => entry.id === domainId),
    [combinedDomains, domainId]
  );
  const systems = useMemo(
    () => allSystems.filter((sys) => sys.domainIds.includes(domainId)),
    [allSystems, domainId]
  );

  const [editOpen, setEditOpen] = useState(false);
  const isProfileDomain = Boolean(domain?.profileId);

  if (!domain) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 text-center">
        <p className="text-muted-foreground">Domain not found.</p>
      </div>
    );
  }

  const crossDomainMap = {};
  for (const sys of systems) {
    for (const did of sys.domainIds) {
      if (did === domainId) continue;
      crossDomainMap[did] = (crossDomainMap[did] || 0) + 1;
    }
  }
  const crossDomainEntries = Object.entries(crossDomainMap)
    .map(([did, count]) => {
      const d = combinedDomains.find((dom) => dom.id === did);
      return d ? { domain: d, count } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count);

  function handleDelete() {
    const name = domain.name;
    if (isProfileDomain) {
      deleteProfileDomain(domainId);
    } else {
      deleteDomain(domainId);
    }
    toast.success(`"${name}" deleted`);
    router.push("/domains");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="inline-block size-4 rounded-full"
            style={{ backgroundColor: domain.color }}
          />
          <h1 className="text-2xl font-semibold tracking-tight">{domain.name}</h1>
          <Badge variant={isProfileDomain ? "default" : "secondary"}>
            {isProfileDomain ? "Profile Domain" : "Global Domain"}
          </Badge>
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
                <AlertDialogTitle>Delete &ldquo;{domain.name}&rdquo;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the domain and unlink all its systems.
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

      {domain.description && (
        <p className="mb-8 text-sm text-muted-foreground">{domain.description}</p>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-medium">
          Systems ({systems.length})
        </h2>
        {systems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No systems in this domain yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Other Domains</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systems.map((sys) => (
                <TableRow key={sys.id}>
                  <TableCell className="font-medium">
                    <Link href={`/systems/${sys.id}`} className="hover:underline">
                      {sys.name}
                    </Link>
                  </TableCell>
                  <TableCell>{sys.vendor || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {sys.domainIds
                        .filter((did) => did !== domainId)
                        .map((did) => {
                          const d = combinedDomains.find((dom) => dom.id === did);
                          if (!d) return null;
                          return (
                            <Badge
                              key={d.id}
                              className="text-white"
                              style={{ backgroundColor: d.color }}
                            >
                              {d.name}
                            </Badge>
                          );
                        })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {crossDomainEntries.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-medium">Cross-Domain Overlap</h2>
          <ul className="space-y-1 text-sm">
            {crossDomainEntries.map(({ domain: d, count }) => (
              <li key={d.id} className="flex items-center gap-2">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="font-medium">{d.name}</span>
                <span className="text-muted-foreground">
                  {count} shared {count === 1 ? "system" : "systems"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <DomainForm
        key={`${domain.id}-${editOpen ? "open" : "closed"}`}
        open={editOpen}
        onOpenChange={setEditOpen}
        domain={domain}
        scope={isProfileDomain ? "profile" : "global"}
        profileId={domain.profileId || null}
      />
    </div>
  );
}
