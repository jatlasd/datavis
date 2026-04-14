"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Server, Layers, Network, FolderOpen, ChevronsUpDown, Check, Globe } from "lucide-react";
import { useMapStore } from "@/store/use-map-store";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Profiles", href: "/profiles", icon: FolderOpen },
  { title: "Systems", href: "/systems", icon: Server },
  { title: "Domains", href: "/domains", icon: Layers },
  { title: "Map", href: "/map", icon: Network },
];

export function AppSidebar() {
  const pathname = usePathname();
  const profiles = useMapStore((s) => s.profiles);
  const activeProfileId = useMapStore((s) => s.activeProfileId);
  const setActiveProfile = useMapStore((s) => s.setActiveProfile);

  const activeProfile = activeProfileId
    ? profiles.find((p) => p.id === activeProfileId)
    : null;

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <span className="text-lg font-bold">Datapus</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="mt-1 flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 truncate">
              {activeProfile ? (
                <>
                  <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{activeProfile.name}</span>
                </>
              ) : (
                <>
                  <Globe className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">All Systems</span>
                </>
              )}
            </div>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setActiveProfile(null)}>
              <Globe className="size-3.5" />
              All Systems
              {!activeProfileId && <Check className="ml-auto size-3.5" />}
            </DropdownMenuItem>
            {profiles.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Profiles</DropdownMenuLabel>
                {profiles.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => setActiveProfile(p.id)}>
                    <FolderOpen className="size-3.5" />
                    <span className="truncate">{p.name}</span>
                    {activeProfileId === p.id && <Check className="ml-auto size-3.5" />}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profiles">
                Manage Profiles
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href)
                    }
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
