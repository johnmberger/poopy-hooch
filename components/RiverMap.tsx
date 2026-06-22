"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";

import type { StationReading } from "@/lib/usgs";
import { MapPreconnect } from "@/components/MapPreconnect";
import riverData from "@/data/chattahoochee-river.json";

const river = riverData as FeatureCollection;

const RiverMapClient = dynamic(() => import("./RiverMapClient"), {
  ssr: false,
  loading: () => <div className="river-map-loading" />,
});

interface RiverMapProps {
  stations: StationReading[];
}

export function RiverMap({ stations }: RiverMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInteractive, setMapInteractive] = useState(true);
  const [needsTouchGuard, setNeedsTouchGuard] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");

    const sync = (coarse: boolean) => {
      setNeedsTouchGuard(coarse);

      if (coarse) {
        setMapLoaded(false);
        setMapInteractive(false);
        return;
      }

      setMapInteractive(true);

      const loadMap = () => setMapLoaded(true);

      if (typeof requestIdleCallback === "function") {
        const idleId = requestIdleCallback(loadMap, { timeout: 2000 });
        return () => cancelIdleCallback(idleId);
      }

      const timeoutId = setTimeout(loadMap, 200);
      return () => clearTimeout(timeoutId);
    };

    let cleanup: (() => void) | undefined;
    const apply = (coarse: boolean) => {
      cleanup?.();
      cleanup = sync(coarse);
    };

    apply(media.matches);
    media.addEventListener("change", (event) => apply(event.matches));
    return () => {
      cleanup?.();
      media.removeEventListener("change", (event) => apply(event.matches));
    };
  }, []);

  const activateMap = () => {
    setMapLoaded(true);
    setMapInteractive(true);
  };

  return (
    <figure className="river-map">
      <figcaption className="stations-heading">The river</figcaption>
      <div
        className={`river-map-frame${mapInteractive ? " is-interactive" : ""}`}
      >
        {mapLoaded ? (
          <>
            <MapPreconnect />
            <RiverMapClient
              river={river}
              stations={stations}
              interactive={mapInteractive}
            />
          </>
        ) : (
          <div className="river-map-loading">Map loads on tap</div>
        )}
        {needsTouchGuard && !mapLoaded && (
          <button type="button" className="map-explore-btn" onClick={activateMap}>
            Tap to load map
          </button>
        )}
      </div>
      <div className="map-legend">
        <span className="map-legend-item">
          <span className="map-legend-swatch low" /> not poopy
        </span>
        <span className="map-legend-item">
          <span className="map-legend-swatch high" /> poopy
        </span>
        <span className="map-legend-item">
          <span className="map-legend-swatch putin" /> put-in
        </span>
      </div>
    </figure>
  );
}
