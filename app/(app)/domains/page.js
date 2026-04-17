"use client";

import { useState } from "react";
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
  const profileDomains = useMapStore((s) => s.profileDomains);
  const seedDefaultDomains = useMapStore((s) => s.seedDefaultDomains);
  const { domains, activeProfile } = useFilteredData();
  const [formOpen, setFormOpen] = useState(false);
  const [formScope, setFormScope] = useState("global");
  const [profilePickerOpen, setProfilePickerOpen] = useState(false);
  const visibleGlobalDomains = domains.filter((domain) => !domain.profileId);
  const visibleProfileDomains = domains.filter((domain) => domain.profileId);
  const hasAnyVisibleDomains = domains.length > 0;

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
        {(allDomains.length > 0 || (activeProfile && profileDomains.length > 0)) && (
          <div className="flex items-center gap-2">
            {activeProfile && (
              <Button variant="outline" onClick={() => setProfilePickerOpen(true)}>
                Select Existing Systems
              </Button>
            )}
            {activeProfile && (
              <Button
                variant="outline"
                onClick={() => {
                  setFormScope("profile");
                  setFormOpen(true);
                }}
              >
                <Plus className="size-4" />
                Create Profile Domain
              </Button>
            )}
            <Button
              onClick={() => {
                setFormScope("global");
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              {activeProfile ? "Create Global Domain" : "Add Domain"}
            </Button>
          </div>
        )}
      </div>

      {!activeProfile && allDomains.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="mb-1 text-lg font-medium">No domains yet</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Domains group your systems into functional areas.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setFormScope("global");
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add Domain
            </Button>
            <Button variant="outline" onClick={() => seedDefaultDomains(DEFAULT_DOMAINS)}>
              Load Defaults
            </Button>
          </div>
        </div>
      ) : activeProfile && !hasAnyVisibleDomains ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="mb-1 text-lg font-medium">No domains in this profile</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Select global domains for this profile or create profile-local domains.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setFormScope("profile");
                setFormOpen(true);
              }}
            >
              Create Profile Domain
            </Button>
            <Button
              onClick={() => {
                setFormScope("global");
                setFormOpen(true);
              }}
            >
              Create Global Domain
            </Button>
          </div>
        </div>
      ) : activeProfile ? (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Profile Domains
            </h2>
            {visibleProfileDomains.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No profile-local domains yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProfileDomains.map((d) => (
                  <DomainCard key={d.id} domain={d} />
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Global Domains In Profile
            </h2>
            {visibleGlobalDomains.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No global domains selected for this profile.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleGlobalDomains.map((d) => (
                  <DomainCard key={d.id} domain={d} />
                ))}
              </div>
            )}
          </section>
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
        scope={formScope}
        profileId={activeProfile?.id || null}
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
