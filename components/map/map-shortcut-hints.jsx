"use client";

const SHORTCUTS = [
  { key: "H", label: "Hide" },
  { key: "P", label: "Pin" },
  { key: "I", label: "Isolate" },
  { key: "C", label: "Connect" },
  { key: "R", label: "Rename" },
  { key: "E", label: "Edit" },
  { key: "V", label: "Details" },
  { key: "Esc", label: "Clear" },
];

export function MapShortcutHints({ active }) {
  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
      <div
        className={`pointer-events-auto flex items-center gap-2 rounded-full border bg-background/90 px-3 py-1.5 text-[11px] shadow-sm backdrop-blur transition-opacity ${
          active ? "opacity-100" : "opacity-60"
        }`}
      >
        <span className="mr-1 font-medium text-muted-foreground">
          {active ? "Shortcuts" : "Select a node for shortcuts"}
        </span>
        {SHORTCUTS.map((shortcut, index) => (
          <span key={shortcut.key} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-border">|</span>}
            <kbd
              className={`inline-flex min-w-5 items-center justify-center rounded border px-1 py-0.5 font-mono text-[10px] ${
                active
                  ? "border-foreground/30 bg-muted text-foreground"
                  : "border-border bg-muted/50 text-muted-foreground"
              }`}
            >
              {shortcut.key}
            </kbd>
            <span className={active ? "text-foreground" : "text-muted-foreground"}>
              {shortcut.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
