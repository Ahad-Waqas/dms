// types/aftershocks.ts

/**
 * Properties specific to aftershock data collection
 */
export interface AftershockCollectionProperties {
  aftershock_risk: boolean;
  likely_window_days: number;
  region_center: [number, number]; // [latitude, longitude]
  radius_km: number;
}

/**
 * GeoJSON Feature for earthquake data
 */
export interface EarthquakeFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [longitude, latitude, depth]
  };
  properties: {
    earthquake_id: string;
    gdacs_id: string | null;
    mag: number;
    reported_at: string;
    source: string;
    region_id: string | null;
    usgs_id: string;
    title: string;
  };
}

/**
 * Complete aftershocks response format
 */
export interface AftershocksResponse {
  type: 'FeatureCollection';
  properties: AftershockCollectionProperties;
  features: EarthquakeFeature[];
}