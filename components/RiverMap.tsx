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
  const [mapInteractive, setMapInteractive] = useState(true);
  const [needsTouchGuard, setNeedsTouchGuard] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");

    const sync = (coarse: boolean) => {
      setNeedsTouchGuard(coarse);
      setMapInteractive(!coarse);
    };

    sync(media.matches);
    media.addEventListener("change", (event) => sync(event.matches));
    return () => media.removeEventListener("change", (event) => sync(event.matches));
  }, []);

  return (
    <figure className="river-map">
      <figcaption className="stations-heading">River map</figcaption>
      <p className="section-note">Stations, river sections, and put-ins.</p>
      <div
        className={`river-map-frame${mapInteractive ? " is-interactive" : ""}`}
      >
        <MapPreconnect />
        <RiverMapClient
          river={river}
          stations={stations}
          interactive={mapInteractive}
        />
        {needsTouchGuard && !mapInteractive && (
          <button
            type="button"
            className="map-explore-btn"
            onClick={() => setMapInteractive(true)}
          >
            Tap to explore map
            <span className="map-explore-hint">So scrolling doesn&apos;t move the map</span>
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
