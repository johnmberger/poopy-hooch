/** Snap lat/lng to the nearest point on a GeoJSON LineString ([lng, lat] vertices). */
export function snapToRiverLine(
  line: [number, number][],
  point: { lat: number; lng: number },
): { lat: number; lng: number } {
  let minDist = Infinity;
  let bestLng = point.lng;
  let bestLat = point.lat;

  for (let i = 0; i < line.length - 1; i++) {
    const [lng, lat] = nearestPointOnSegment(line[i], line[i + 1], [point.lng, point.lat]);
    const dist = distanceSquared(point.lat, point.lng, lat, lng);
    if (dist < minDist) {
      minDist = dist;
      bestLng = lng;
      bestLat = lat;
    }
  }

  return { lat: bestLat, lng: bestLng };
}

function nearestPointOnSegment(
  a: [number, number],
  b: [number, number],
  p: [number, number],
): [number, number] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return a;

  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return [a[0] + t * dx, a[1] + t * dy];
}

function distanceSquared(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  return dLat * dLat + dLng * dLng;
}
