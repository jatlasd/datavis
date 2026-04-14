"use client";

import { useMapStore } from "@/store/use-map-store";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";

export function ActiveProfileBadge() {
  const activeProfileId = useMapStore((s) => s.activeProfileId);
  const profiles = useMapStore((s) => s.profiles);

  if (!activeProfileId) return null;

  const profile = profiles.find((p) => p.id === activeProfileId);
  if (!profile) return null;

  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      <FolderOpen className="size-3" />
      {profile.name}
    </Badge>
  );
}
