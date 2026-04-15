"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useFilteredData } from "@/hooks/use-filtered-data";

export function CategoryBreakdown() {
  const { categories, systems } = useFilteredData();

  const breakdown = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        count: systems.filter((system) =>
          (system.categoryIds || []).includes(category.id)
        ).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [categories, systems]);

  const maxCount = Math.max(...breakdown.map((item) => item.count), 1);

  if (breakdown.length === 0) return null;

  return (
    <div className="space-y-2">
      {breakdown.map(({ category, count }) => (
        <Link
          key={category.id}
          href="/systems"
          className="group flex items-center gap-3"
        >
          <span className="w-32 truncate text-sm font-medium group-hover:underline">
            {category.name}
          </span>
          <div className="relative h-5 flex-1 overflow-hidden rounded bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded transition-all"
              style={{
                width: `${Math.max((count / maxCount) * 100, 2)}%`,
                backgroundColor: category.color,
              }}
            />
          </div>
          <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">
            {count}
          </span>
        </Link>
      ))}
    </div>
  );
}
