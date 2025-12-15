export interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number];
  };
  properties: {
    earthquake_id: string;
    gdacs_id: string | null;
    mag: number;         // Changed from 'magnitude' to 'mag'
    reported_at: string;
    source: string;
    region_id: string | null;
    usgs_id: string;
    title: string;       // Added new field 'title'
  };
}