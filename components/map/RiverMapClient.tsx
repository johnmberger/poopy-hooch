"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, Popup, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";
import type { Feature, FeatureCollection, LineString } from "geojson";
import type { TooltipOptions, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

import { defaultPutIns, PUT_IN_DETAIL_ZOOM, putInsForZoom } from "@/lib/map/put-ins";
import { MapLoadingSkeleton } from "@/components/map/MapLoadingSkeleton";
import {
  RIVER_COLORS_DARK,
  RIVER_COLORS_LIGHT,
  riverSegmentGradient,
  type StationReading,
} from "@/lib/bacteria/usgs";
import { useTheme } from "@/lib/use-theme";
import riverData from "@/data/chattahoochee-river.json";

const river = riverData as FeatureCollection;

const TILE_VOYAGER = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
const TILE_VOYAGER_NOLABELS = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png";
const TILE_DARK_LABELS = "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png";

interface RiverMapClientProps {
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

function labelTooltipProps(side: "left" | "right" | "top" | "bottom"): Pick<TooltipOptions, "direction" | "offset"> {
  if (side === "right") return { direction: "right", offset: [8, 0] };
  if (side === "top") return { direction: "top", offset: [0, -8] };
  if (side === "bottom") return { direction: "bottom", offset: [0, 8] };
  return { direction: "left", offset: [-8, 0] };
}

function PutInsLayer({ markerStroke, fillColor }: { markerStroke: string; fillColor: string }) {
  const map = useMap();
  const [zoom, setZoom] = useState(PUT_IN_DETAIL_ZOOM - 1);
  const [paneReady, setPaneReady] = useState(() => Boolean(map.getPane("putInPane")));

  useLayoutEffect(() => {
    if (!map.getPane("putInPane")) {
      const pane = map.createPane("putInPane");
      pane.style.zIndex = "650";
    }
    setPaneReady(true);
  }, [map]);

  useEffect(() => {
    const update = () => setZoom(map.getZoom());
    map.whenReady(update);
    map.on("zoomend", update);
    return () => {
      map.off("zoomend", update);
    };
  }, [map]);

  if (!paneReady) return null;

  return (
    <>
      {putInsForZoom(zoom).map((putIn) => (
        <CircleMarker
          key={putIn.id}
          pane="putInPane"
          center={[putIn.lat, putIn.lng]}
          radius={putIn.minZoom ? 4 : 5}
          pathOptions={{
            color: markerStroke,
            weight: 1.5,
            fillColor,
            fillOpacity: 0.95,
          }}
        >
          <Tooltip
            permanent
            {...labelTooltipProps(putIn.labelDirection)}
            className={`map-label map-label-putin${putIn.minZoom ? " map-label-putin-detail" : ""}`}
          >
            {putIn.name}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}

function FitBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap();

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;

    const padding = (): [number, number] =>
      window.matchMedia("(max-width: 480px)").matches ? [56, 20] : [28, 28];

    const fit = () => {
      map.invalidateSize({ animate: false });
      map.fitBounds(bounds, { padding: padding(), animate: false });
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fit, 150);
    };

    map.whenReady(() => {
      requestAnimationFrame(fit);
    });

    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [map, bounds]);

  return null;
}

export default function RiverMapClient({ stations, interactive }: RiverMapClientProps) {
  const theme = useTheme();
  const isLight = theme === "light";
  const riverColors = isLight ? RIVER_COLORS_LIGHT : RIVER_COLORS_DARK;
  const outlineColor = isLight ? "#c5c9d0" : "#2a2a2a";
  const stationStroke = isLight ? "#111827" : "#000";
  const putInStroke = isLight ? "#111827" : "#fff";
  const putInFill = isLight ? "#1d4ed8" : "#93c5fd";
  const preferRetina =
    typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches;

  // Two-phase remount: drop the old Leaflet DOM completely before building the next theme.
  // Mobile Safari otherwise keeps the previous filtered tile composite.
  const [mapEpoch, setMapEpoch] = useState(0);
  const [mapMounted, setMapMounted] = useState(true);
  const [tilesReady, setTilesReady] = useState(false);

  useEffect(() => {
    setTilesReady(false);
    setMapMounted(false);

    const remount = window.setTimeout(() => {
      setMapEpoch((epoch) => epoch + 1);
      setMapMounted(true);
    }, 40);

    const fallback = window.setTimeout(() => setTilesReady(true), 2000);

    return () => {
      window.clearTimeout(remount);
      window.clearTimeout(fallback);
    };
  }, [theme]);

  const coloredSegments = useMemo(
    () =>
      river.features
        .filter((feature) => feature.properties?.kind === "river-segment")
        .flatMap((feature) => {
          const segment = feature as Feature<LineString>;
          const segmentIndex = segment.properties?.segmentIndex;
          if (typeof segmentIndex !== "number") return [];

          const upstream = stations[segmentIndex]?.risk;
          const downstream = stations[segmentIndex + 1]?.risk;
          if (!upstream || !downstream) return [];

          const coordinates = segment.geometry.coordinates.map(
            (point) => [point[0]!, point[1]!] as [number, number],
          );

          return riverSegmentGradient(upstream, downstream, coordinates, riverColors).map(
            (part, partIndex) => ({
              key: `${theme}-${segmentIndex}-${partIndex}`,
              color: part.color,
              coordinates: part.coordinates,
            }),
          );
        }),
    [stations, riverColors, theme],
  );

  const bounds = useMemo((): LatLngBounds => {
    const outlineFeature = river.features.find((f) => f.properties?.kind === "river-outline");
    const points: [number, number][] = [
      ...defaultPutIns().map((p) => [p.lat, p.lng] as [number, number]),
      ...stations.map((s) => [s.lat, s.lng] as [number, number]),
    ];

    if (outlineFeature?.geometry.type === "LineString") {
      points.push(
        ...(outlineFeature.geometry as LineString).coordinates.map(
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
  }, [stations]);

  const outline = river.features.find((f) => f.properties?.kind === "river-outline") as
    | Feature<LineString>
    | undefined;

  return (
    <div className={`river-map-viewport${tilesReady ? " is-ready" : ""}`} data-map-theme={theme}>
      {mapMounted ? (
        <MapContainer
          key={`${theme}-${mapEpoch}`}
          center={[33.93, -84.32]}
          zoom={11}
          scrollWheelZoom={false}
          fadeAnimation={false}
          zoomAnimation={false}
          markerZoomAnimation={false}
          className="river-map-container"
          attributionControl={false}
        >
          <MapInteraction interactive={interactive} />
          <FitBounds bounds={bounds} />

          {isLight ? (
            <TileLayer
              url={TILE_VOYAGER}
              detectRetina={preferRetina}
              eventHandlers={{
                load: () => setTilesReady(true),
              }}
            />
          ) : (
            <>
              <TileLayer
                url={TILE_VOYAGER_NOLABELS}
                className="river-map-base-tiles"
                detectRetina={preferRetina}
                eventHandlers={{
                  load: () => setTilesReady(true),
                }}
              />
              <TileLayer
                url={TILE_DARK_LABELS}
                className="river-map-label-tiles"
                detectRetina={preferRetina}
              />
            </>
          )}

          {outline && (
            <GeoJSON
              data={outline}
              pathOptions={{ color: outlineColor, weight: 12, opacity: 1, lineCap: "round", lineJoin: "round" }}
            />
          )}

          {coloredSegments.map((segment) => (
            <GeoJSON
              key={segment.key}
              data={
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: segment.coordinates,
                  },
                } as Feature<LineString>
              }
              pathOptions={{
                color: segment.color,
                weight: 7,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          ))}

          {stations.map((station) => (
            <CircleMarker
              key={station.id}
              center={[station.lat, station.lng]}
              radius={8}
              pathOptions={{
                color: stationStroke,
                weight: 2,
                fillColor: station.risk === "low" ? riverColors.clean : riverColors.poopy,
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

          <PutInsLayer markerStroke={putInStroke} fillColor={putInFill} />
        </MapContainer>
      ) : (
        <MapLoadingSkeleton overlay />
      )}
      {mapMounted && !tilesReady && <MapLoadingSkeleton overlay />}
    </div>
  );
}
