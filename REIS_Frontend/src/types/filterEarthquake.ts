export interface filterStateEarthquake {
  min_magnitude: number | null;
  max_magnitude: number | null;
  min_depth: number | null;
  max_depth: number | null;
  min_lat: number | null;
  max_lat: number | null;
  min_lon: number | null;
  max_lon: number | null;
  start_time: string | null;
  end_time: string | null;
}

// types/filterFlood.ts
export interface filterStateFlood {
  start_time: string | null;
  end_time: string | null;
  min_lat: number | null;
  max_lat: number | null;
  min_lon: number | null;
  max_lon: number | null;
  severity_level: string | null;
}

// types/filterWildfire.ts
export interface filterStateWildfire {
  start_time: string | null;
  end_time: string | null;
  min_lat: number | null;
  max_lat: number | null;
  min_lon: number | null;
  max_lon: number | null;
  severity_level: string | null;
}
