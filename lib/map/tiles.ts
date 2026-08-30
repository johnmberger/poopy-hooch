/** Voyager raster tiles (Carto). Requires a free key: https://carto.com/basemaps/apikey */
export function voyagerTileUrl(): string {
  const key = process.env.NEXT_PUBLIC_CARTO_API_KEY?.trim();
  if (key) {
    return `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`;
  }
  // Local dev fallback — OSM tiles don't need a key.
  return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
}

export function usesCartoTiles(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CARTO_API_KEY?.trim());
}
