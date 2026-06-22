/** Popular CRNRA tubing put-ins along the monitored stretch. */
import { STATIONS } from "@/lib/usgs";

function stationCoords(stationId: string) {
  const station = STATIONS.find((s) => s.id === stationId);
  if (!station) throw new Error(`Unknown station: ${stationId}`);
  return { lat: station.lat, lng: station.lng };
}

export const PUT_INS = [
  {
    id: "jones-bridge",
    name: "Jones Bridge",
    lat: 34.000082,
    lng: -84.239318,
    labelDirection: "left" as const,
  },
  {
    id: "garrards-landing",
    name: "Garrard's Landing",
    lat: 33.973125,
    lng: -84.264439,
    labelDirection: "right" as const,
  },
  {
    id: "powers-island",
    name: "Powers Island",
    ...stationCoords("02335880"),
    labelDirection: "left" as const,
  },
  {
    id: "east-palisades",
    name: "East Palisades",
    lat: 33.878195,
    lng: -84.442721,
    labelDirection: "left" as const,
  },
] as const;

export type LabelDirection = (typeof PUT_INS)[number]["labelDirection"];
