"use client";

import { useEffect, useState } from "react";

export function useNarrowChart(): boolean {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 480px)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 480px)");
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return narrow;
}
