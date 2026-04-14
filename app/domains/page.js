"use client";

import { useState } from "react";
import { useMapStore } from "@/store/use-map-store";
import { DEFAULT_DOMAINS } from "@/lib/constants";
import { DomainCard } from "@/components/domains/domain-card";
import { DomainForm } from "@/components/domains/domain-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DomainsPage() {
  const domains = useMapStore((s) => s.domains);
  const seedDefaultDomains = useMapStore((s) => s.seedDefaultDomains);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Domains</h1>
        {domains.length > 0 && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Add Domain
          </Button>
        )}
      </div>

      {domains.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="mb-1 text-lg font-medium">No domains yet</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Domains group your systems into functional areas.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              Add Domain
            </Button>
            <Button variant="outline" onClick={() => seedDefaultDomains(DEFAULT_DOMAINS)}>
              Load Defaults
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => (
            <DomainCard key={d.id} domain={d} />
          ))}
        </div>
      )}

      <DomainForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
