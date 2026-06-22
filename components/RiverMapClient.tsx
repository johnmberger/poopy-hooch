"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, Popup, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";
import type { Feature, FeatureCollection, LineString } from "geojson";
import type { TooltipOptions, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

import { PUT_INS } from "@/lib/put-ins";
import type { RiskLevel, StationReading } from "@/lib/usgs";

const CLEAN = "#4ade80";
const POOPY = "#f87171";
const PUT_IN = "#93c5fd";

interface RiverMapClientProps {
  river: FeatureCollection;
  stations: StationReading[];
  interactive: boolean;
}

function MapInteraction({ interactive }: { interactive: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (interactive) {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    } else {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    }
  }, [map, interactive]);

  return null;
}

function segmentRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return a === "high" || b === "high" ? "high" : "low";
}

function labelTooltipProps(side: "left" | "right"): Pick<TooltipOptions, "direction" | "offset"> {
  return side === "right"
    ? { direction: "right", offset: [8, 0] }
    : { direction: "left", offset: [-8, 0] };
}

function FitBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap();

  useEffect(() => {
    const fit = () => {
      const padding: [number, number] =
        window.innerWidth < 480 ? [56, 20] : [28, 28];
      map.fitBounds(bounds, { padding });
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [map, bounds]);

  return null;
}

export default function RiverMapClient({ river, stations, interactive }: RiverMapClientProps) {
  const segmentRisks = useMemo(
    () => [segmentRisk(stations[0].risk, stations[1].risk), segmentRisk(stations[1].risk, stations[2].risk)],
    [stations],
  );

  const bounds = useMemo((): LatLngBounds => {
    const outline = river.features.find((f) => f.properties?.kind === "river-outline");
    const points: [number, number][] = [
      ...PUT_INS.map((p) => [p.lat, p.lng] as [number, number]),
      ...stations.map((s) => [s.lat, s.lng] as [number, number]),
    ];

    if (outline?.geometry.type === "LineString") {
      points.push(
        ...(outline.geometry as LineString).coordinates.map(
          ([lng, lat]) => [lat, lng] as [number, number],
        ),
      );
    }

    if (points.length === 0) {
      return latLngBounds([
        [33.85, -84.46],
        [34.0, -84.2],
      ]);
    }

    return latLngBounds(points);
  }, [river, stations]);

  const outline = river.features.find((f) => f.properties?.kind === "river-outline") as
    | Feature<LineString>
    | undefined;
  const segments = river.features.filter((f) => f.properties?.kind === "river-segment") as Feature<LineString>[];

  return (
    <MapContainer
      center={[33.93, -84.32]}
      zoom={11}
      scrollWheelZoom={false}
      className="river-map-container"
      attributionControl={false}
    >
      <MapInteraction interactive={interactive} />
      <FitBounds bounds={bounds} />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      {outline && (
        <GeoJSON
          data={outline}
          pathOptions={{ color: "#2a2a2a", weight: 12, opacity: 1, lineCap: "round", lineJoin: "round" }}
        />
      )}

      {segments.map((segment, index) => (
        <GeoJSON
          key={segment.properties?.segmentIndex ?? index}
          data={segment}
          pathOptions={{
            color: segmentRisks[index] === "low" ? CLEAN : POOPY,
            weight: 7,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      ))}

      {PUT_INS.map((putIn) => (
        <CircleMarker
          key={putIn.id}
          center={[putIn.lat, putIn.lng]}
          radius={5}
          pathOptions={{
            color: "#fff",
            weight: 1.5,
            fillColor: PUT_IN,
            fillOpacity: 0.95,
          }}
        >
          <Tooltip
            permanent
            {...labelTooltipProps(putIn.labelDirection)}
            className="map-label map-label-putin"
          >
            {putIn.name}
          </Tooltip>
        </CircleMarker>
      ))}

      {stations.map((station) => (
        <CircleMarker
          key={station.id}
          center={[station.lat, station.lng]}
          radius={8}
          pathOptions={{
            color: "#000",
            weight: 2,
            fillColor: station.risk === "low" ? CLEAN : POOPY,
            fillOpacity: 1,
          }}
        >
          <Tooltip
            permanent
            {...labelTooltipProps(station.labelDirection)}
            className="map-label map-label-station"
          >
            {station.name}
          </Tooltip>
          <Popup className="map-popup">
            {station.risk === "low" ? "clean" : "poopy"} · {Math.round(station.eColi)}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
