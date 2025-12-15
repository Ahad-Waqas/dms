import { filterStateEarthquake } from "@/types/filterEarthquake";

export function quakeQueryString(filter: filterStateEarthquake): string {
  return Object.entries(filter)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(
      ([key, value]) => `${key}=${encodeURIComponent(value as string)}`
    )
    .join("&");
}
