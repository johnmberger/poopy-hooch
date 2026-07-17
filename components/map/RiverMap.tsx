"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { MapLoadingSkeleton } from "@/components/map/MapLoadingSkeleton";
import type { StationReading } from "@/lib/bacteria/usgs";
import { MapPreconnect } from "@/components/map/MapPreconnect";

const RiverMapClient = dynamic(() => import("./RiverMapClient"), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

interface RiverMapProps {
  stations: StationReading[];
}

export function RiverMap({ stations }: RiverMapProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [mapInteractive, setMapInteractive] = useState(true);
  const [needsTouchGuard, setNeedsTouchGuard] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoadMap) return;

    const media = window.matchMedia("(pointer: coarse)");

    const sync = (coarse: boolean) => {
      setNeedsTouchGuard(coarse);
      setMapInteractive(!coarse);
    };

    sync(media.matches);
    media.addEventListener("change", (event) => sync(event.matches));
    return () => media.removeEventListener("change", (event) => sync(event.matches));
  }, [shouldLoadMap]);

  return (
    <figure className="river-map">
      <h2 className="stations-heading">River map</h2>
      <p className="section-note">
        River color blends between monitoring stations downstream. Zoom in for put-ins.
      </p>
      <div
        ref={frameRef}
        className={`river-map-frame${mapInteractive ? " is-interactive" : ""}`}
      >
        {shouldLoadMap && <MapPreconnect />}
        {shouldLoadMap ? (
          <RiverMapClient stations={stations} interactive={mapInteractive} />
        ) : (
          <MapLoadingSkeleton />
        )}
        {needsTouchGuard && !mapInteractive && (
          <button
            type="button"
            className="map-explore-btn"
            onClick={() => setMapInteractive(true)}
          >
            Tap to explore map
          </button>
        )}
      </div>
      <div className="map-legend">
        <span className="map-legend-item">
          <span className="map-legend-swatch low" aria-hidden="true" /> not poopy
        </span>
        <span className="map-legend-item">
          <span className="map-legend-swatch high" aria-hidden="true" /> poopy
        </span>
        <span className="map-legend-item">
          <span className="map-legend-swatch putin" aria-hidden="true" /> put-in
        </span>
      </div>
    </figure>
  );
}
