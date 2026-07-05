/** CRNRA tubing put-ins along the monitored stretch. */
import type { FeatureCollection, LineString } from "geojson";

import riverData from "@/data/chattahoochee-river.json";
import { snapToRiverLine } from "@/lib/snap-to-river";
import { STATIONS } from "@/lib/usgs";

export type LabelDirection = "left" | "right" | "top" | "bottom";

export type PutIn = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  labelDirection: LabelDirection;
  /** Show when map zoom >= this value. Omit (or 0) for default view. */
  minZoom?: number;
};

/** Zoom level at which detail put-ins appear. */
export const PUT_IN_DETAIL_ZOOM = 12;

const riverOutline = (riverData as FeatureCollection).features.find(
  (f) => f.properties?.kind === "river-outline",
)?.geometry as LineString | undefined;

const RIVER_LINE = (riverOutline?.coordinates ?? []) as [number, number][];

function stationCoords(stationId: string) {
  const station = STATIONS.find((s) => s.id === stationId);
  if (!station) throw new Error(`Unknown station: ${stationId}`);
  return { lat: station.lat, lng: station.lng };
}

function snapPutIn(putIn: PutIn): PutIn {
  if (RIVER_LINE.length === 0) return putIn;
  const snapped = snapToRiverLine(RIVER_LINE, putIn);
  return { ...putIn, ...snapped };
}

const RAW_PUT_INS: PutIn[] = [
  {
    id: "jones-bridge",
    name: "Jones Bridge",
    lat: 34.000082,
    lng: -84.239318,
    labelDirection: "left",
  },
  {
    id: "garrards-landing",
    name: "Garrard's Landing",
    lat: 33.973125,
    lng: -84.264439,
    labelDirection: "right",
  },
  {
    id: "morgan-falls",
    name: "Morgan Falls",
    lat: 33.9680862,
    lng: -84.3836708,
    labelDirection: "right",
  },
  {
    id: "johnson-ferry",
    name: "Johnson Ferry",
    lat: 33.9455,
    lng: -84.4041,
    labelDirection: "left",
  },
  {
    id: "powers-island",
    name: "Powers Island",
    ...stationCoords("02335880"),
    labelDirection: "left",
  },
  {
    id: "east-palisades",
    name: "East Palisades",
    lat: 33.878195,
    lng: -84.442721,
    labelDirection: "left",
  },
  {
    id: "abbotts-bridge",
    name: "Abbotts Bridge",
    lat: 34.027778,
    lng: -84.191667,
    labelDirection: "top",
  },
  {
    id: "medlock-bridge",
    name: "Medlock Bridge",
    ...stationCoords("02335000"),
    labelDirection: "bottom",
    minZoom: PUT_IN_DETAIL_ZOOM,
  },
  {
    id: "island-ford",
    name: "Island Ford",
    lat: 33.984722,
    lng: -84.242222,
    labelDirection: "left",
    minZoom: PUT_IN_DETAIL_ZOOM,
  },
  {
    id: "cochran-shoals",
    name: "Cochran Shoals",
    lat: 33.915556,
    lng: -84.378611,
    labelDirection: "right",
    minZoom: PUT_IN_DETAIL_ZOOM,
  },
  {
    id: "west-palisades",
    name: "West Palisades",
    lat: 33.894167,
    lng: -84.449722,
    labelDirection: "right",
    minZoom: PUT_IN_DETAIL_ZOOM,
  },
  {
    id: "whitewater-creek",
    name: "Whitewater Creek",
    lat: 33.8776,
    lng: -84.4399,
    labelDirection: "left",
    minZoom: PUT_IN_DETAIL_ZOOM,
  },
  {
    id: "paces-mill",
    name: "Paces Mill",
    lat: 33.86,
    lng: -84.454444,
    labelDirection: "left",
    minZoom: PUT_IN_DETAIL_ZOOM,
  },
];

export const PUT_INS: PutIn[] = RAW_PUT_INS.map(snapPutIn);

export function putInsForZoom(zoom: number): PutIn[] {
  return PUT_INS.filter((putIn) => zoom >= (putIn.minZoom ?? 0));
}

export function defaultPutIns(): PutIn[] {
  return putInsForZoom(PUT_IN_DETAIL_ZOOM - 1);
}
