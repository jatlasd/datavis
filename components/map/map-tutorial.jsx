"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TUTORIAL_STEPS = [
  {
    id: "welcome",
    title: "Welcome to the Map",
    body: "The map visualises your systems and how they connect. Drag to pan, scroll or pinch to zoom, and click anything to learn more. Let's take a quick tour.",
  },
  {
    id: "search",
    target: "search",
    title: "Search for a system",
    body: "Type a name to highlight matching systems. When exactly one matches, the map centers on it.",
    placement: "bottom",
  },
  {
    id: "edge-mode",
    target: "edge-mode",
    title: "Edge display mode",
    body: "Separate draws every relationship as its own line. Grouped bundles parallel edges so a cluttered graph stays readable.",
    placement: "bottom",
  },
  {
    id: "filters-toggle",
    target: "filters-toggle",
    title: "Show or hide filters",
    body: "Collapse this panel when you need more canvas. A badge appears while filters are active.",
    placement: "bottom",
  },
  {
    id: "domains",
    target: "filters-domains",
    title: "Domain filters",
    body: "Click domain chips to narrow the map to specific domains. Selecting several combines them.",
    placement: "bottom",
    optional: true,
  },
  {
    id: "types",
    target: "filters-types",
    title: "Connection type filters",
    body: "Limit the graph to the relationship types you care about — depends-on, calls, owns, and so on.",
    placement: "bottom",
    optional: true,
  },
  {
    id: "layout-direction",
    target: "layout-direction",
    title: "Layout direction",
    body: "Flip between left-to-right and top-down layouts to match how you like to read your system map.",
    placement: "bottom",
  },
  {
    id: "relayout",
    target: "relayout",
    title: "Re-layout",
    body: "Run the auto-layout again after filtering or rearranging nodes to restore a clean structure.",
    placement: "bottom",
  },
  {
    id: "fit-view",
    target: "fit-view",
    title: "Fit to view",
    body: "Zoom and pan so every visible node fits nicely on screen.",
    placement: "bottom",
  },
  {
    id: "graph",
    target: "graph",
    title: "Interact with nodes",
    body: "Click a node to select it, drag to reposition, and Shift-click to multi-select. Right-click a node to hide it, pin it, or isolate it with just its neighbours. Click any edge to edit that relationship.",
    placement: "center",
  },
  {
    id: "hidden",
    target: "hidden-nodes",
    title: "Reveal hidden nodes",
    body: "Hidden nodes stay out of the way until you bring them back here.",
    placement: "bottom",
    optional: true,
  },
  {
    id: "isolate",
    target: "isolate",
    title: "Clear isolate mode",
    body: "When you've isolated a node, use this button to return to the full map.",
    placement: "bottom",
    optional: true,
  },
  {
    id: "replay",
    target: "replay",
    title: "Replay this tour any time",
    body: "Stuck on something later? Click here to see the walkthrough again.",
    placement: "bottom",
  },
];

const SPOTLIGHT_PADDING = 8;

function getTargetRect(id) {
  if (typeof document === "undefined") return null;
  const el = document.querySelector(`[data-tutorial="${id}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  const style = window.getComputedStyle(el);
  if (style.visibility === "hidden" || style.display === "none") return null;
  return rect;
}

function computePanelPosition({ rect, placement, panelSize, viewport }) {
  const gap = 12;
  const margin = 12;
  const pw = panelSize.width;
  const ph = panelSize.height;

  if (!rect || placement === "center") {
    return {
      top: Math.max(margin, (viewport.height - ph) / 2),
      left: Math.max(margin, (viewport.width - pw) / 2),
    };
  }

  let top;
  let left;
  const spotTop = rect.top - SPOTLIGHT_PADDING;
  const spotBottom = rect.bottom + SPOTLIGHT_PADDING;
  const spotLeft = rect.left - SPOTLIGHT_PADDING;
  const spotRight = rect.right + SPOTLIGHT_PADDING;

  const fitsBelow = spotBottom + gap + ph + margin <= viewport.height;
  const fitsAbove = spotTop - gap - ph - margin >= 0;
  const fitsRight = spotRight + gap + pw + margin <= viewport.width;
  const fitsLeft = spotLeft - gap - pw - margin >= 0;

  const order =
    placement === "top"
      ? ["top", "bottom", "right", "left"]
      : placement === "left"
        ? ["left", "right", "bottom", "top"]
        : placement === "right"
          ? ["right", "left", "bottom", "top"]
          : ["bottom", "top", "right", "left"];

  let chosen = null;
  for (const p of order) {
    if (p === "bottom" && fitsBelow) {
      chosen = "bottom";
      break;
    }
    if (p === "top" && fitsAbove) {
      chosen = "top";
      break;
    }
    if (p === "right" && fitsRight) {
      chosen = "right";
      break;
    }
    if (p === "left" && fitsLeft) {
      chosen = "left";
      break;
    }
  }

  if (!chosen) {
    return {
      top: Math.max(margin, (viewport.height - ph) / 2),
      left: Math.max(margin, (viewport.width - pw) / 2),
    };
  }

  if (chosen === "bottom") {
    top = spotBottom + gap;
    left = rect.left + rect.width / 2 - pw / 2;
  } else if (chosen === "top") {
    top = spotTop - gap - ph;
    left = rect.left + rect.width / 2 - pw / 2;
  } else if (chosen === "right") {
    top = rect.top + rect.height / 2 - ph / 2;
    left = spotRight + gap;
  } else {
    top = rect.top + rect.height / 2 - ph / 2;
    left = spotLeft - gap - pw;
  }

  left = Math.max(margin, Math.min(left, viewport.width - pw - margin));
  top = Math.max(margin, Math.min(top, viewport.height - ph - margin));
  return { top, left };
}

function findNextIndex(start, direction, steps) {
  let next = start;
  while (next >= 0 && next < steps.length) {
    const step = steps[next];
    if (!step.target || !step.optional) return next;
    if (getTargetRect(step.target)) return next;
    next += direction;
  }
  return -1;
}

export function MapTutorial({ onClose }) {
  const visibleSteps = useMemo(() => TUTORIAL_STEPS, []);
  const [stepIndex, setStepIndex] = useState(() => {
    const found = findNextIndex(0, 1, TUTORIAL_STEPS);
    return found === -1 ? 0 : found;
  });
  const [rect, setRect] = useState(null);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight,
  }));
  const [panelSize, setPanelSize] = useState({ width: 320, height: 160 });
  const panelRef = useRef(null);

  const advance = useCallback(
    (direction) => {
      setStepIndex((prev) => {
        const next = findNextIndex(prev + direction, direction, visibleSteps);
        return next === -1 ? prev : next;
      });
    },
    [visibleSteps]
  );

  const step = visibleSteps[stepIndex];

  const handleNext = useCallback(() => {
    const nextIdx = findNextIndex(stepIndex + 1, 1, visibleSteps);
    if (nextIdx === -1) {
      onClose?.();
      return;
    }
    setStepIndex(nextIdx);
  }, [onClose, stepIndex, visibleSteps]);

  const handleBack = useCallback(() => {
    if (stepIndex === 0) return;
    advance(-1);
  }, [advance, stepIndex]);

  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        handleNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleBack();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, handleNext, handleBack]);

  useLayoutEffect(() => {
    if (!step) return;
    function measure() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      if (step.target && step.placement !== "center") {
        setRect(getTargetRect(step.target));
      } else {
        setRect(null);
      }
      if (panelRef.current) {
        const box = panelRef.current.getBoundingClientRect();
        setPanelSize((prev) => {
          if (Math.abs(prev.width - box.width) < 0.5 && Math.abs(prev.height - box.height) < 0.5) {
            return prev;
          }
          return { width: box.width, height: box.height };
        });
      }
    }
    measure();
    const id = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [stepIndex, step]);

  if (!step) return null;
  if (typeof document === "undefined") return null;

  const isMobile = viewport.width < 640;
  const isCenter = step.placement === "center" || !step.target || !rect;

  const panelStyle = (() => {
    if (isMobile) {
      return {
        left: 12,
        right: 12,
        bottom: 12,
        width: "auto",
        maxWidth: "calc(100vw - 24px)",
      };
    }
    const pos = computePanelPosition({
      rect: isCenter ? null : rect,
      placement: isCenter ? "center" : step.placement || "bottom",
      panelSize,
      viewport,
    });
    return {
      top: pos.top,
      left: pos.left,
      width: panelSize.width,
    };
  })();

  const spotlightStyle = rect
    ? {
        top: rect.top - SPOTLIGHT_PADDING,
        left: rect.left - SPOTLIGHT_PADDING,
        width: rect.width + SPOTLIGHT_PADDING * 2,
        height: rect.height + SPOTLIGHT_PADDING * 2,
      }
    : null;

  const total = visibleSteps.length;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-tutorial-title"
    >
      {spotlightStyle ? (
        <div
          className="pointer-events-none absolute rounded-lg ring-2 ring-foreground/40 ring-offset-2 ring-offset-background/0 transition-all duration-200"
          style={{
            ...spotlightStyle,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",
          }}
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 bg-black/45 transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <div
        className="pointer-events-auto absolute inset-0"
        aria-hidden="true"
        onClick={(event) => event.stopPropagation()}
      />

      <div
        ref={panelRef}
        style={panelStyle}
        className={cn(
          "pointer-events-auto absolute flex flex-col gap-3 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl ring-1 ring-foreground/10",
          !isMobile && "max-w-[min(360px,calc(100vw-24px))]"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Step {stepIndex + 1} of {total}
            </div>
            <h2
              id="map-tutorial-title"
              className="mt-1 font-heading text-sm font-semibold leading-tight"
            >
              {step.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutorial"
            className="-mr-1 -mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">{step.body}</p>

        <div className="flex items-center gap-1">
          {visibleSteps.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i === stepIndex
                  ? "bg-foreground"
                  : i < stepIndex
                    ? "bg-foreground/40"
                    : "bg-muted"
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 px-2 text-xs text-muted-foreground"
          >
            Skip
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={stepIndex === 0}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="size-3.5" />
              Back
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="h-7 px-2 text-xs"
            >
              {stepIndex === total - 1 ? "Finish" : "Next"}
              {stepIndex !== total - 1 && <ChevronRight className="size-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
