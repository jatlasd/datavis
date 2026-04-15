"use client";

import { useState } from "react";
import Link from "next/link";
import { useMapStore } from "@/store/use-map-store";
import { useFilteredData } from "@/hooks/use-filtered-data";
import { DEFAULT_DOMAINS } from "@/lib/constants";
import { DomainCard } from "@/components/domains/domain-card";
import { DomainForm } from "@/components/domains/domain-form";
import { ProfileSystemsPickerDialog } from "@/components/profiles/profile-systems-picker-dialog";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from "lucide-react";

export default function DomainsPage() {
  const allDomains = useMapStore((s) => s.domains);
  const seedDefaultDomains = useMapStore((s) => s.seedDefaultDomains);
  const { domains, activeProfile } = useFilteredData();
  const [formOpen, setFormOpen] = useState(false);
  const [profilePickerOpen, setProfilePickerOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Domains</h1>
          {activeProfile && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <FolderOpen className="size-3" />
              {activeProfile.name}
            </span>
          )}
        </div>
        {allDomains.length > 0 && (
          <div className="flex items-center gap-2">
            {activeProfile && (
              <Button variant="outline" onClick={() => setProfilePickerOpen(true)}>
                Select Existing Systems
              </Button>
            )}
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              {activeProfile ? "Create Global Domain" : "Add Domain"}
            </Button>
          </div>
        )}
      </div>

      {allDomains.length === 0 ? (
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
      ) : domains.length === 0 && activeProfile ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="mb-1 text-lg font-medium">No domains in this profile</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Domains are shared globally. Add systems to this profile to see linked domains here, or edit a system to assign existing domains.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setProfilePickerOpen(true)}>
              Select Existing Systems
            </Button>
            <Button asChild>
              <Link href="/systems">Go to Systems</Link>
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

      <DomainForm
        key={`new-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
      <ProfileSystemsPickerDialog
        key={`${activeProfile?.id || "no-profile"}-${profilePickerOpen ? "open" : "closed"}`}
        open={profilePickerOpen}
        onOpenChange={setProfilePickerOpen}
        profile={activeProfile}
      />
    </div>
  );
}
