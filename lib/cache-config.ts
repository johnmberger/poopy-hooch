/** Shared TTL for USGS-backed data (matches page + route revalidate). */
export const DATA_REVALIDATE_SECONDS = 3600;

export const JSON_CACHE_CONTROL = `public, max-age=${DATA_REVALIDATE_SECONDS}, s-maxage=${DATA_REVALIDATE_SECONDS}, stale-while-revalidate=86400`;
