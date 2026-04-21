"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MapInspectorContent } from "@/components/map/map-inspector/map-inspector-content";

export function MapInspectorShell({
  selection,
  setSelection,
  isDesktop,
  onClear,
  ...contentProps
}) {
  const body = (
    <MapInspectorContent
      selection={selection}
      setSelection={setSelection}
      {...contentProps}
    />
  );

  if (isDesktop) {
    return (
      <aside className="flex w-[min(22rem,40vw)] shrink-0 flex-col border-l border-border bg-background">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{body}</div>
      </aside>
    );
  }

  return (
    <Sheet
      open={selection.kind !== "empty"}
      onOpenChange={(open) => {
        if (!open) onClear?.();
      }}
    >
      <SheetContent side="bottom" className="max-h-[85vh] gap-0 overflow-y-auto px-4 pt-6 pb-6">
        <SheetHeader className="sr-only">
          <SheetTitle>Inspector</SheetTitle>
          <SheetDescription>Details for the selected map item.</SheetDescription>
        </SheetHeader>
        {body}
      </SheetContent>
    </Sheet>
  );
}
