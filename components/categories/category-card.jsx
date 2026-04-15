"use client";

import { useMapStore } from "@/store/use-map-store";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export function CategoryCard({ category, onEdit, onDelete }) {
  const systemCount = useMapStore((s) =>
    s.systems.filter((sys) => (sys.categoryIds || []).includes(category.id)).length
  );

  return (
    <Card className="h-full" style={{ borderLeft: `4px solid ${category.color}` }}>
      <CardHeader>
        <CardTitle>{category.name}</CardTitle>
        {category.description && (
          <CardDescription className="line-clamp-2">
            {category.description}
          </CardDescription>
        )}
        <p className="text-xs text-muted-foreground">
          {systemCount} {systemCount === 1 ? "system" : "systems"}
        </p>
      </CardHeader>
      <CardFooter className="gap-2 pt-0">
        <Button size="sm" variant="outline" onClick={() => onEdit(category)}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(category)}>
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
