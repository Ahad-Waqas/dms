/**
 * TypeScript interface for the flood data GeoJSON
 */

/**
 * Represents the severity level of a flood
 */
export type SeverityLevel = "minor" | "moderate" | "severe";

/**
 * Represents a point with longitude and latitude
 */
export type Point = [number, number]; // [longitude, latitude]

/**
 * Represents a linear ring (closed line) of coordinates
 */
export type LinearRing = Point[];

/**
 * Represents a polygon (area) with an outer ring and optional inner rings (holes)
 */
export type Polygon = LinearRing[];

/**
 * Represents multiple polygons grouped together
 */
export type MultiPolygon = Polygon[];

/**
 * Represents the epicenter of a flood
 */
export interface Epicenter {
  type: "POINT";
  coordinates: Point;
}

/**
 * Properties associated with a flood feature
 */
export interface FloodProperties {
  flood_id: string;
  gdacs_id: string;
  severity_level: SeverityLevel;
  reported_at: string; // ISO date string format
  source: string;
  epicenter: Epicenter;
}

/**
 * Geometry representation of the flood affected area
 */
export interface FloodGeometry {
  type: "MultiPolygon";
  coordinates: MultiPolygon;
}

/**
 * A single flood feature in GeoJSON format
 */
export interface FloodFeature {
  type: "Feature";
  geometry: FloodGeometry;
  properties: FloodProperties;
}

/**
 * Collection of flood features
 */
export type FloodData = FloodFeature[];