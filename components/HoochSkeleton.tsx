import type { ReactNode } from "react";

import { STATIONS } from "@/lib/usgs";

export function HoochSkeleton({ intro }: { intro: ReactNode }) {
  return (
    <div className="hooch-skeleton" aria-busy="true" aria-label="checking poop levels">
      <div className="skeleton-verdict">
        <div className="skeleton-line skeleton-line-lg" />
        <div className="skeleton-line skeleton-line-full" />
      </div>

      <p className="stations-heading">The river</p>
      <div className="skeleton-map" />

      {intro}

      <p className="stations-heading">The spots</p>
      <ul className="station-list">
        {STATIONS.map((station) => (
          <li key={station.id} className="station skeleton-station">
            <span className="skeleton-line skeleton-line-sm" />
            <span className="skeleton-line skeleton-line-xs" />
          </li>
        ))}
      </ul>
    </div>
  );
}
