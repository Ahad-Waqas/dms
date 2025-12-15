import { GeoJSONFeature } from '@/types/geoJson';
import { EarthquakeData } from '@/types/earthquakeData';






export function convertGeoJSONToEarthquakeData(geojsonData: GeoJSONFeature[]): EarthquakeData[] {
  return geojsonData.map((feature, index) => {
    const { geometry, properties } = feature;
    const [longitude, latitude, depth] = geometry.coordinates;
    
    const time = new Date(properties.reported_at);
    
    // Create location string in POINT format 
    // (maintaining compatibility with the parseCoordinates function in the component)
    const locationString = `POINT(${longitude} ${latitude})`;
    
    // Use title as place if available, fallback to region_id or coordinates
    const place = properties.title || properties.region_id || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    
    // Create earthquake object
    const earthquake: EarthquakeData = {
      id: index + 12348, // Starting from 12348 to avoid collision with existing IDs
      earthquake_id: properties.earthquake_id,
      magnitude: properties.mag, // Updated to use 'mag' instead of 'magnitude'
      depth: depth || 10, // Default depth if not provided
      time,
      location: locationString,
      place
    };
    
    return earthquake;
  });
}