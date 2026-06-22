/** Popular CRNRA tubing put-ins along the monitored stretch. */
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
    lat: 33.903483,
    lng: -84.443612,
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
