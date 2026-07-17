export function MapLoadingSkeleton({
  overlay = false,
  className,
}: {
  overlay?: boolean;
  className?: string;
}) {
  const classes = [
    "map-loading-skeleton",
    overlay ? "map-loading-skeleton--overlay" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} aria-busy="true" aria-label="Loading map">
      <span className="map-loading-skeleton-label">Loading map</span>
    </div>
  );
}
