"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useMapStore } from "@/store/use-map-store";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

export function SystemTable({ systems, domains }) {
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

  function SortableHead({ column, children }) {
    return (
      <TableHead
        className="cursor-pointer select-none"
        onClick={() => handleSort(column)}
      >
        <span className="inline-flex items-center gap-1">
          {children}
          <ArrowUpDown className="size-3 text-muted-foreground" />
        </span>
      </TableHead>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHead column="name">Name</SortableHead>
          <SortableHead column="vendor">Vendor</SortableHead>
          <SortableHead column="domains">Domains</SortableHead>
          <SortableHead column="connections">Connections</SortableHead>
          <SortableHead column="createdAt">Date Added</SortableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((sys) => (
          <TableRow key={sys.id}>
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
