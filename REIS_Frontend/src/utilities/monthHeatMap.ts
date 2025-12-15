import axios from "axios";

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

type HeatmapData = {
  date: string;
  count: number; // now represents average magnitude (intensity)
};

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
      console.error(`Failed to load data for ${startStr} - ${endStr}`, err);
    }
  }

  // Convert to array of { date, count: avgMagnitude }
  return Object.entries(heatmapData).map(([date, { total, count }]) => ({
    date,
    count: parseFloat((total / count).toFixed(2)), // avg magnitude rounded to 2 decimals
  }));
};
