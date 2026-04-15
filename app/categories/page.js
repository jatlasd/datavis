"use client";

import { useState } from "react";
import { useMapStore } from "@/store/use-map-store";
import { useFilteredData } from "@/hooks/use-filtered-data";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryForm } from "@/components/categories/category-form";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, FolderOpen } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesPage() {
  const allCategories = useMapStore((s) => s.categories);
  const seedDefaultCategories = useMapStore((s) => s.seedDefaultCategories);
  const deleteCategory = useMapStore((s) => s.deleteCategory);
  const { categories, activeProfile } = useFilteredData();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function handleEdit(category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteCategory(deleteTarget.id);
    toast.success(`"${name}" deleted`);
    setDeleteTarget(null);
  }

  function handleFormOpenChange(open) {
    setFormOpen(open);
    if (!open) setEditingCategory(null);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          {activeProfile && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <FolderOpen className="size-3" />
              {activeProfile.name}
            </span>
          )}
        </div>
        {allCategories.length > 0 && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Add Category
          </Button>
        )}
      </div>

      {allCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="mb-1 text-lg font-medium">No categories yet</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Categories classify what each platform does.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              Add Category
            </Button>
            <Button variant="outline" onClick={() => seedDefaultCategories(DEFAULT_CATEGORIES)}>
              Load Defaults
            </Button>
          </div>
        </div>
      ) : categories.length === 0 && activeProfile ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="mb-1 text-lg font-medium">No categories in this profile</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Add systems to this profile to see their categories here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CategoryForm
        key={`${editingCategory?.id || "new"}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        category={editingCategory}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the category and unlink it from all systems. This action cannot be undone.
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
