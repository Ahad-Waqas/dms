export interface EarthquakeData {
  id: number;
  earthquake_id: string;
  magnitude: number;
  depth: number;
  time: Date;
  location: Location;
  place: string;
}
type Location = string | PointLocation | CoordinateLocation;

interface PointLocation {
  type: 'Point';
  coordinates: [number, number];
}

interface CoordinateLocation {
  latitude: number;
  longitude: number;
}
