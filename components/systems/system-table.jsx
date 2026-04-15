"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useMapStore } from "@/store/use-map-store";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

export function SystemTable({
  systems,
  domains,
  categories,
  profileSystemIds,
  onToggleProfileSystem,
}) {
  const getConnectionCount = useMapStore((s) => s.getConnectionCount);

  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const domainMap = useMemo(() => {
    const m = {};
    for (const d of domains) {
      m[d.id] = d;
    }
    return m;
  }, [domains]);

  const categoryMap = useMemo(() => {
    const m = {};
    for (const c of categories) {
      m[c.id] = c;
    }
    return m;
  }, [categories]);

  const sorted = useMemo(() => {
    const copy = [...systems];
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "vendor":
          return dir * (a.vendor || "").localeCompare(b.vendor || "");
        case "domains":
          return dir * (a.domainIds.length - b.domainIds.length);
        case "categories":
          return dir * ((a.categoryIds || []).length - (b.categoryIds || []).length);
        case "connections":
          return dir * (getConnectionCount(a.id) - getConnectionCount(b.id));
        case "createdAt":
          return dir * (a.createdAt - b.createdAt);
        default:
          return 0;
      }
    });

    return copy;
  }, [systems, sortKey, sortDir, getConnectionCount]);

  if (systems.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {onToggleProfileSystem && <TableHead className="w-10">In Profile</TableHead>}
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
            <span className="inline-flex items-center gap-1">
              Name
              <ArrowUpDown className="size-3 text-muted-foreground" />
            </span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("vendor")}>
            <span className="inline-flex items-center gap-1">
              Vendor
              <ArrowUpDown className="size-3 text-muted-foreground" />
            </span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("domains")}>
            <span className="inline-flex items-center gap-1">
              Domains
              <ArrowUpDown className="size-3 text-muted-foreground" />
            </span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("categories")}>
            <span className="inline-flex items-center gap-1">
              Categories
              <ArrowUpDown className="size-3 text-muted-foreground" />
            </span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("connections")}>
            <span className="inline-flex items-center gap-1">
              Connections
              <ArrowUpDown className="size-3 text-muted-foreground" />
            </span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("createdAt")}>
            <span className="inline-flex items-center gap-1">
              Date Added
              <ArrowUpDown className="size-3 text-muted-foreground" />
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((sys) => (
          <TableRow key={sys.id}>
            {onToggleProfileSystem && (
              <TableCell>
                <Checkbox
                  checked={profileSystemIds?.has(sys.id) ?? false}
                  onCheckedChange={() => onToggleProfileSystem(sys.id)}
                />
              </TableCell>
            )}
            <TableCell className="font-medium">
              <Link href={`/systems/${sys.id}`} className="hover:underline">
                {sys.name}
              </Link>
            </TableCell>
            <TableCell>{sys.vendor || "—"}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {sys.domainIds.map((did) => {
                  const d = domainMap[did];
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
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {(sys.categoryIds || []).map((cid) => {
                  const c = categoryMap[cid];
                  if (!c) return null;
                  return (
                    <Badge
                      key={c.id}
                      className="text-white"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.name}
                    </Badge>
                  );
                })}
              </div>
            </TableCell>
            <TableCell>{getConnectionCount(sys.id)}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(sys.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
