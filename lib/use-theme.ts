"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

export function readDocumentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Subscribe to `data-theme` on `<html>` (defaults to dark). */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(root.dataset.theme === "light" ? "light" : "dark");
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
