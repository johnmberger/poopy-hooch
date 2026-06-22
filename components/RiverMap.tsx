"use client";

import dynamic from "next/dynamic";
import type { FeatureCollection } from "geojson";

import type { StationReading } from "@/lib/usgs";
import riverData from "@/data/chattahoochee-river.json";

const river = riverData as FeatureCollection;

const RiverMapClient = dynamic(() => import("./RiverMapClient"), {
  ssr: false,
  loading: () => <div className="river-map-loading">loading map…</div>,
});

interface RiverMapProps {
  stations: StationReading[];
}

export function RiverMap({ stations }: RiverMapProps) {
  return (
    <figure className="river-map">
      <figcaption className="stations-heading">The river</figcaption>
      <div className="river-map-frame">
        <RiverMapClient river={river} stations={stations} />
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
