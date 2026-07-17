import { MapLoadingSkeleton } from "@/components/map/MapLoadingSkeleton";
import { STATIONS } from "@/lib/bacteria/usgs";

export function HoochSkeleton() {
  return (
    <div className="hooch-skeleton" aria-busy="true" role="status" aria-label="checking poop levels">
      <div className="skeleton-verdict">
        <div className="skeleton-line skeleton-line-lg" />
        <div className="skeleton-line skeleton-line-full" />
      </div>

      <h2 className="stations-heading">River map</h2>
      <MapLoadingSkeleton className="skeleton-map" />

      <h2 className="stations-heading">Monitoring stations</h2>
      <ul className="station-list">
        {STATIONS.map((station) => (
          <li key={station.id} className="station skeleton-station">
            <span className="skeleton-line skeleton-line-sm" />
            <span className="skeleton-line skeleton-line-xs" />
            <span className="skeleton-line skeleton-line-xs" />
          </li>
        ))}
        <li className="station-list-more learn-more-skeleton">
          <span className="skeleton-line skeleton-line-sm" />
        </li>
      </ul>
    </div>
  );
}
