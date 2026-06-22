import { STATIONS } from "@/lib/usgs";

export function HoochSkeleton() {
  return (
    <div className="hooch-skeleton" aria-busy="true" aria-label="checking poop levels">
      <div className="skeleton-verdict">
        <div className="skeleton-line skeleton-line-lg" />
        <div className="skeleton-line skeleton-line-full" />
      </div>

      <p className="stations-heading">River map</p>
      <div className="skeleton-map" />

      <p className="stations-heading">Monitoring stations</p>
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
