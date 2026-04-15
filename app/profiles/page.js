"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMapStore } from "@/store/use-map-store";
import { ProfileForm } from "@/components/profiles/profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, FolderOpen, MoreVertical, Pencil, Copy, Trash2, Server, Check } from "lucide-react";
import { toast } from "sonner";

export default function ProfilesPage() {
  const profiles = useMapStore((s) => s.profiles);
  const systems = useMapStore((s) => s.systems);
  const profileDomains = useMapStore((s) => s.profileDomains);
  const activeProfileId = useMapStore((s) => s.activeProfileId);
  const setActiveProfile = useMapStore((s) => s.setActiveProfile);
  const deleteProfile = useMapStore((s) => s.deleteProfile);
  const duplicateProfile = useMapStore((s) => s.duplicateProfile);
  const router = useRouter();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function handleEdit(profile) {
    setEditingProfile(profile);
    setFormOpen(true);
  }

  function handleFormClose(val) {
    setFormOpen(val);
    if (!val) setEditingProfile(null);
  }

  function handleDuplicate(profile) {
    const dup = duplicateProfile(profile.id);
    if (dup) toast.success(`Duplicated as "${dup.name}"`);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteProfile(deleteTarget.id);
    toast.success(`Deleted "${deleteTarget.name}"`);
    setDeleteTarget(null);
  }

  function handleActivate(profile) {
    setActiveProfile(profile.id);
    toast.success(`Switched to "${profile.name}"`);
    router.push("/");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Profiles</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Create Profile
        </Button>
      </div>

      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
            <FolderOpen className="size-6 text-muted-foreground" />
          </div>
          <p className="mb-1 text-lg font-medium">No profiles yet</p>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Profiles let you save curated subsets of your systems. Create one to focus on a specific area like administrative tools or instructional platforms.
          </p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Create Profile
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => {
            const isActive = activeProfileId === profile.id;
            const systemCount = profile.systemIds.filter((sid) =>
              systems.some((s) => s.id === sid)
            ).length;
            const globalDomainCount = (profile.globalDomainIds || []).length;
            const localDomainCount = profileDomains.filter(
              (domain) => domain.profileId === profile.id
            ).length;

            return (
              <Card key={profile.id} className={isActive ? "ring-2 ring-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <span className="truncate">{profile.name}</span>
                        {isActive && (
                          <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Active
                          </span>
                        )}
                      </CardTitle>
                      {profile.description && (
                        <CardDescription className="mt-1">{profile.description}</CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="shrink-0">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(profile)}>
                          <Pencil className="size-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(profile)}>
                          <Copy className="size-3.5" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(profile)}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Server className="size-3.5" />
                      {systemCount} {systemCount === 1 ? "system" : "systems"}
                    </div>
                    <div>
                      Domains: {globalDomainCount} global, {localDomainCount} profile-local
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  {isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setActiveProfile(null);
                        toast.success("Switched to All Systems");
                      }}
                    >
                      <Check className="size-3.5" />
                      Active — Click to Deactivate
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleActivate(profile)}
                    >
                      <FolderOpen className="size-3.5" />
                      Activate
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <ProfileForm
        key={editingProfile?.id || "new"}
        open={formOpen}
        onOpenChange={handleFormClose}
        editingProfile={editingProfile}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &ldquo;{deleteTarget?.name}&rdquo;? This removes the profile only — your systems and connections are not affected.
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
  );
}
