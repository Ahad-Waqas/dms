import { filterStateFlood } from "@/types/filterEarthquake";

export function floodQueryString(filter: filterStateFlood): string {
  return Object.entries(filter)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(
      ([key, value]) => `${key}=${encodeURIComponent(value as string)}`
    )
    .join("&");
}