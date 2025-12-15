import { filterStateWildfire } from "@/types/filterEarthquake";

export function wildfireQueryString(filter: filterStateWildfire): string {
  return Object.entries(filter)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(
      ([key, value]) => `${key}=${encodeURIComponent(value as string)}`
    )
    .join("&");
}