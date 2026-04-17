"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "datapus.map-tutorial.seen";

function readSeen() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

function writeSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {}
}

export function useMapTutorial() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (readSeen()) return;
    const id = window.requestAnimationFrame(() => setIsOpen(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const start = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    writeSeen();
  }, []);

  return { isOpen, start, close };
}
