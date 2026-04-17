"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutGrid,
  Maximize,
  ArrowRightLeft,
  ArrowUpDown,
} from "lucide-react";

export function MapGraphControls({
  layoutDirection,
  onToggleDirection,
  onRelayout,
  onFitView,
}) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={onRelayout}
              data-tutorial="relayout"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Re-layout</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={onFitView}
              data-tutorial="fit-view"
            >
              <Maximize className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit to view</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={onToggleDirection}
              data-tutorial="layout-direction"
            >
              {layoutDirection === "LR" ? (
                <ArrowUpDown className="size-3.5" />
              ) : (
                <ArrowRightLeft className="size-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Switch to {layoutDirection === "LR" ? "top-down" : "left-right"} layout
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
