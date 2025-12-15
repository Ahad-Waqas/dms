import axios from "axios";

// Types and interfaces for each disaster type
interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number];
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

export type SeverityLevel = "minor" | "moderate" | "severe" | "catastrophic";
export type Point = [number, number]; // [longitude, latitude]
export type LinearRing = Point[];
export type Polygon = LinearRing[];
export type MultiPolygon = Polygon[];

export interface Epicenter {
  type: "POINT";
  coordinates: Point;
}

// Flood Feature Types
export interface FloodProperties {
  flood_id: string;
  gdacs_id: string;
  severity_level: SeverityLevel;
  reported_at: string;
  source: string;
  epicenter: Epicenter;
}

export interface FloodGeometry {
  type: "MultiPolygon";
  coordinates: MultiPolygon;
}

export interface FloodFeature {
  type: "Feature";
  geometry: FloodGeometry;
  properties: FloodProperties;
}

export type FloodData = FloodFeature[];

// Fire Feature Types
export interface FireProperties {
  fire_id: string;
  gdacs_id: string;
  severity_level: SeverityLevel;
  reported_at: string;
  source: string;
  epicenter: Epicenter;
}

export interface FireGeometry {
  type: "MultiPolygon";
  coordinates: MultiPolygon;
}

export interface FireFeature {
  type: "Feature";
  geometry: FireGeometry;
  properties: FireProperties;
}

export type FireData = FireFeature[];

// Common types
type HeatmapData = {
  date: string;
  count: number;
};

interface SeverityMatrix {
  type: string;
  months: string[];
  values: number[];
}

// Helper function to convert severity level string to numeric value
const severityLevelToValue = (level: SeverityLevel): number => {
  switch (level) {
    case "minor":
      return 3;
    case "moderate":
      return 6;
    case "severe":
      return 9;
    case "catastrophic":
      return 12;
    default:
      return 0;
  }
};

// Individual heatmap functions for each disaster type
export const getMonthlyEarthquakesHeatmap = async (): Promise<HeatmapData[]> => {
  const heatmapData: Record<string, { total: number; count: number }> = {};

  for (let month = 0; month < 12; month++) {
    const start = new Date(2024, month, 1);
    const end = new Date(2024, month + 1, 0); // last day of the month

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    try {
      const res = await axios.get<GeoJSONFeature[]>(
        `/api/earthquake?start_time=${startStr}&end_time=${endStr}&count=20`
      );

      res.data.forEach((feature) => {
        const date = new Date(feature.properties.reported_at).toISOString().split("T")[0];
        const mag = feature.properties.mag;

        if (!heatmapData[date]) {
          heatmapData[date] = { total: 0, count: 0 };
        }

        heatmapData[date].total += mag;
        heatmapData[date].count += 1;
      });
    } catch (err) {
      console.error(`Failed to load earthquake data for ${startStr} - ${endStr}`, err);
    }
  }

  // Convert to array of { date, count: avgMagnitude }
  return Object.entries(heatmapData).map(([date, { total, count }]) => ({
    date,
    count: parseFloat((total / count).toFixed(2)), // avg magnitude rounded to 2 decimals
  }));
};

export const getMonthlyFloodHeatmap = async (): Promise<HeatmapData[]> => {
  const heatmapData: Record<string, { total: number; count: number }> = {};

  for (let month = 0; month < 12; month++) {
    const start = new Date(2024, month, 1);
    const end = new Date(2024, month + 1, 0); // last day of the month

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    try {
      const res = await axios.get<FloodFeature[]>(
        `/api/flood?start_time=${startStr}&end_time=${endStr}&count=20`
      );

      res.data.forEach((feature) => {
        const date = new Date(feature.properties.reported_at).toISOString().split("T")[0];
        const severityLevel = severityLevelToValue(feature.properties.severity_level);

        if (!heatmapData[date]) {
          heatmapData[date] = { total: 0, count: 0 };
        }

        heatmapData[date].total += severityLevel;
        heatmapData[date].count += 1;
      });
    } catch (err) {
      console.error(`Failed to load flood data for ${startStr} - ${endStr}`, err);
    }
  }

  return Object.entries(heatmapData).map(([date, { total, count }]) => ({
    date,
    count: parseFloat((total / count).toFixed(2)), // avg severity rounded to 2 decimals
  }));
};

export const getMonthlyWildfireHeatmap = async (): Promise<HeatmapData[]> => {
  const heatmapData: Record<string, { total: number; count: number }> = {};

  for (let month = 0; month < 12; month++) {
    const start = new Date(2024, month, 1);
    const end = new Date(2024, month + 1, 0); // last day of the month

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    try {
      const res = await axios.get<FireFeature[]>(
        `/api/wildfire?start_time=${startStr}&end_time=${endStr}&count=20`
      );

      res.data.forEach((feature) => {
        const date = new Date(feature.properties.reported_at).toISOString().split("T")[0];
        const severityLevel = severityLevelToValue(feature.properties.severity_level);

        if (!heatmapData[date]) {
          heatmapData[date] = { total: 0, count: 0 };
        }

        heatmapData[date].total += severityLevel;
        heatmapData[date].count += 1;
      });
    } catch (err) {
      console.error(`Failed to load wildfire data for ${startStr} - ${endStr}`, err);
    }
  }

  return Object.entries(heatmapData).map(([date, { total, count }]) => ({
    date,
    count: parseFloat((total / count).toFixed(2)), // avg intensity rounded to 2 decimals
  }));
};

// Combined function to generate the complete severity matrix
export const generateCombinedSeverityMatrix = async (): Promise<SeverityMatrix[]> => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Initialize results with default values
  const earthquakeValues: number[] = Array(12).fill(0);
  const floodValues: number[] = Array(12).fill(0);
  const wildfireValues: number[] = Array(12).fill(0);
  
  // Initialize counters to calculate averages
  const earthquakeCounts: number[] = Array(12).fill(0);
  const floodCounts: number[] = Array(12).fill(0);
  const wildfireCounts: number[] = Array(12).fill(0);

  // Process all disaster types
  for (let month = 0; month < 12; month++) {
    const start = new Date(2024, month, 1);
    const end = new Date(2024, month + 1, 0); // last day of the month

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    // Fetch earthquake data
    try {
      const res = await axios.get<GeoJSONFeature[]>(
        `/api/earthquake?start_time=${startStr}&end_time=${endStr}&count=20`
      );

      res.data.forEach((feature) => {
        earthquakeValues[month] += feature.properties.mag;
        earthquakeCounts[month]++;
      });
    } catch (err) {
      console.error(`Failed to load earthquake data for ${startStr} - ${endStr}`, err);
    }

    // Fetch flood data
    try {
      const res = await axios.get<FloodFeature[]>(
        `/api/flood?start_time=${startStr}&end_time=${endStr}&count=20`
      );

      res.data.forEach((feature) => {
        floodValues[month] += severityLevelToValue(feature.properties.severity_level);
        floodCounts[month]++;
      });
    } catch (err) {
      console.error(`Failed to load flood data for ${startStr} - ${endStr}`, err);
    }

    // Fetch wildfire data
    try {
      const res = await axios.get<FireFeature[]>(
        `/api/wildfire?start_time=${startStr}&end_time=${endStr}&count=20`
      );

      res.data.forEach((feature) => {
        wildfireValues[month] += severityLevelToValue(feature.properties.severity_level);
        wildfireCounts[month]++;
      });
    } catch (err) {
      console.error(`Failed to load wildfire data for ${startStr} - ${endStr}`, err);
    }
  }

  // Calculate averages for each month
  for (let i = 0; i < 12; i++) {
    earthquakeValues[i] = earthquakeCounts[i] > 0 
      ? parseFloat((earthquakeValues[i] / earthquakeCounts[i]).toFixed(1)) 
      : 0;
    
    floodValues[i] = floodCounts[i] > 0 
      ? parseFloat((floodValues[i] / floodCounts[i]).toFixed(1)) 
      : 0;
    
    wildfireValues[i] = wildfireCounts[i] > 0 
      ? parseFloat((wildfireValues[i] / wildfireCounts[i]).toFixed(1)) 
      : 0;
  }

  // Create the severity matrix
  const severityMatrix: SeverityMatrix[] = [
    {
      type: "Earthquake",
      months,
      values: earthquakeValues,
    },
    {
      type: "Flood",
      months,
      values: floodValues,
    },
    {
      type: "Wildfire",
      months,
      values: wildfireValues,
    },
  ];

  return severityMatrix;
};

// Example usage (for testing purposes)
// const severityMatrix = await generateCombinedSeverityMatrix();
// console.log(JSON.stringify(severityMatrix, null, 2));