/**
 * TypeScript implementation of earthquake intensity heatmap generator
 * Designed to work with SQLAlchemy model data format
 */

/**
 * Interfaces matching SQLAlchemy model structure
 */
interface EarthquakeData {
  id?: number;
  usgs_id?: string;
  magnitude: number;
  depth: number;
  time?: Date;
  location: string | GeoJSONPoint | LocationCoordinates;
  place?: string;
}

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  count: number;
}

interface HeatmapOptions {
  pointCount?: number;
  maxRadius?: number;
}

/**
 * Generates a heatmap data array for earthquake intensity visualization
 * based on SQLAlchemy model data format
 * 
 * @param earthquakeData - Earthquake data matching SQLAlchemy model
 * @param options - Configuration options
 * @returns Array of points with lat, lng, and intensity (count) values
 */
function generateEarthquakeHeatmap(
  earthquakeData: EarthquakeData, 
  options: HeatmapOptions = {}
): HeatmapPoint[] {
  // Default options
  const pointCount: number = options.pointCount || 2000;
  const maxRadius: number = options.maxRadius || 200; // km
  
  // Parse the location from SQLAlchemy Geography type
  const coordinates: LocationCoordinates = parseLocation(earthquakeData.location);
  
  // Extract earthquake data
  const { magnitude, depth } = earthquakeData;
  const { latitude, longitude } = coordinates;
  
  // Calculate effective radius based on magnitude and depth
  const effectiveRadius: number = calculateEffectiveRadius(magnitude, depth, maxRadius);
  
  // Array to store our heatmap data points
  const heatmapData: HeatmapPoint[] = [];
  
  // Generate points in the circular region with distance-based intensity
  for (let i = 0; i < pointCount; i++) {
    // Generate random angle and distance from epicenter
    const angle: number = Math.random() * 2 * Math.PI;
    
    // Use square root distribution for more natural clustering near epicenter
    const distanceFactor: number = Math.sqrt(Math.random());
    const distance: number = distanceFactor * effectiveRadius;
    
    // Calculate intensity at this point
    const intensity: number = calculateIntensityAtPoint(magnitude, depth, distance, effectiveRadius);
    
    // Convert polar coordinates to Cartesian (km)
    const dx: number = distance * Math.cos(angle);
    const dy: number = distance * Math.sin(angle);
    
    // Convert km offsets to lat/lng
    // Approximate conversion (adequate for small distances)
    // 111.32 km per degree of latitude at the equator
    // Longitude degrees vary by latitude
    const latOffset: number = dy / 111.32;
    const lngOffset: number = dx / (111.32 * Math.cos(latitude * Math.PI / 180));
    
    const lat: number = latitude + latOffset;
    const lng: number = longitude + lngOffset;
    
    // Add some natural variation in intensity
    const jitter: number = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    const count: number = Math.round(intensity * jitter);
    
    heatmapData.push({ lat, lng, count });
  }
  
  return heatmapData;
}

/**
 * Parse location data from SQLAlchemy Geography type
 * Handles both POINT format and GeoJSON string
 * 
 * @param location - Location data from SQL Geography column
 * @returns Object with latitude and longitude properties
 */
function parseLocation(
  location: string | GeoJSONPoint | LocationCoordinates
): LocationCoordinates {
  // If location is already an object with lat/lng properties
  if (typeof location === 'object' && location !== null) {
    if ('latitude' in location && 'longitude' in location) {
      return {
        latitude: (location as LocationCoordinates).latitude,
        longitude: (location as LocationCoordinates).longitude
      };
    } else if ('type' in location && location.type === 'Point' && 'coordinates' in location) {
      // Handle GeoJSON Point object
      const geoJson = location as GeoJSONPoint;
      return {
        longitude: geoJson.coordinates[0],
        latitude: geoJson.coordinates[1]
      };
    }
  }
  
  // If location is a string (PostGIS or GeoJSON)
  if (typeof location === 'string') {
    // Handle PostGIS POINT format: 'POINT(longitude latitude)'
    if (location.startsWith('POINT')) {
      const match = location.match(/POINT\(\s*([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\s*\)/i);
      if (match) {
        return {
          // PostGIS POINT format is 'POINT(longitude latitude)'
          longitude: parseFloat(match[1]),
          latitude: parseFloat(match[2])
        };
      }
    }
    
    // Try to parse as GeoJSON
    try {
      const geoJson = JSON.parse(location);
      if (geoJson.type === 'Point' && Array.isArray(geoJson.coordinates)) {
        // GeoJSON Point format has [longitude, latitude]
        return {
          longitude: geoJson.coordinates[0],
          latitude: geoJson.coordinates[1]
        };
      }
    } catch (e) {
      // Not valid JSON, continue to other formats
    }
  }
  
  // Default coordinates if parsing fails
  console.warn('Could not parse location data, using default coordinates');
  return { latitude: 0, longitude: 0 };
}

/**
 * Calculate the effective radius of earthquake impact based on magnitude and depth
 * 
 * @param magnitude - Earthquake magnitude (Richter scale)
 * @param depth - Depth in kilometers
 * @param maxRadius - Maximum radius to cap the calculation
 * @returns Effective radius in kilometers
 */
function calculateEffectiveRadius(
  magnitude: number, 
  depth: number, 
  maxRadius: number
): number {
  // Wells and Coppersmith (1994) relationship for rupture length
  // log(L) = a + b × M, where L is rupture length in km, M is magnitude
  // a = -2.44, b = 0.59 for all fault types
  const ruptureLength: number = Math.pow(10, -2.44 + 0.59 * magnitude);
  
  // Estimate felt area radius using magnitude
  // Use relationship between magnitude and felt area radius
  // R ≈ 10^(0.45*M - 0.64) - simplified from USGS empirical data
  const baseRadius: number = Math.pow(10, 0.45 * magnitude - 0.64);
  
  // Depth attenuation factor
  // Deeper earthquakes have energy distributed over larger areas before reaching surface
  // But with reduced peak intensity at epicenter
  // Empirical approximation: depth factor = e^(-depth/depthScale)
  const depthScale: number = 25; // km
  const depthFactor: number = Math.min(1, Math.exp(-depth / depthScale) + 0.1);
  
  // For very shallow earthquakes, radius is mostly determined by magnitude
  // For deeper earthquakes, radius increases but intensity decreases
  const depthAdjustment: number = 1 + (depth / 50); // Deeper quakes affect wider areas
  
  // Calculate final effective radius
  const effectiveRadius: number = baseRadius * depthAdjustment * depthFactor;
  
  // Cap at maximum radius
  return Math.min(effectiveRadius, maxRadius);
}

/**
 * Calculate intensity value at a specific point based on earthquake properties and distance
 * 
 * @param magnitude - Earthquake magnitude
 * @param depth - Depth in kilometers
 * @param distance - Distance from epicenter in kilometers
 * @param effectiveRadius - Calculated effective radius
 * @returns Intensity value (1-10 scale)
 */
function calculateIntensityAtPoint(
  magnitude: number, 
  depth: number, 
  distance: number, 
  effectiveRadius: number
): number {
  // Intensity at epicenter using magnitude-MMI relationship
  // Approximation: MMI = 1.5M + 0.5 (for shallow earthquakes at epicenter)
  let epicenterIntensity: number = 1.5 * magnitude + 0.5;
  
  // Depth attenuation (deeper earthquakes have less surface intensity)
  // I = I₀ * e^(-α*h) where α is attenuation coefficient
  const depthAttenuationFactor: number = Math.exp(-0.05 * depth);
  epicenterIntensity *= depthAttenuationFactor;
  
  // Distance attenuation using inverse square law approximation
  // Simplified from complicated seismic wave propagation formulas
  // Closer points have higher intensity
  let distanceAttenuation: number;
  if (distance < 0.1) {
    // Avoid division by near-zero
    distanceAttenuation = 1;
  } else {
    // Attenuation with distance
    distanceAttenuation = 1 / (1 + Math.pow(distance / (effectiveRadius * 0.2), 1.5));
  }
  
  // Calculate final intensity (scale 1-10 for heatmap visualization)
  const rawIntensity: number = epicenterIntensity * distanceAttenuation;
  return Math.max(1, Math.min(10, rawIntensity));
}

/**
 * Example usage with data in SQLAlchemy model format
 */
function example(): HeatmapPoint[] {
  // Sample earthquake data in SQLAlchemy model format
  const earthquakeData: EarthquakeData = {
    id: 12345,
    usgs_id: "us7000jllz",
    magnitude: 6.8,
    depth: 15.5,
    time: new Date("2023-10-15T08:30:45"),
    location: "POINT(-118.2437 34.0522)", // PostGIS format (longitude latitude)
    place: "Los Angeles, California"
  };
  
  // Generate heatmap data
  const heatmapData: HeatmapPoint[] = generateEarthquakeHeatmap(earthquakeData, {
    pointCount: 2500
  });
  
  console.log(`Generated ${heatmapData.length} heatmap points`);
  console.log('Sample data points:');
  console.log(heatmapData.slice(0, 5));
  
  return heatmapData;
}

// Example with GeoJSON location format
function exampleWithGeoJson(): HeatmapPoint[] {
  const earthquakeData: EarthquakeData = {
    id: 12346,
    usgs_id: "us7000abcd",
    magnitude: 7.2,
    depth: 25.0,
    time: new Date("2023-11-20T14:15:32"),
    // GeoJSON Point format as string
    location: JSON.stringify({
      type: "Point",
      coordinates: [139.7671, 35.6812] // Tokyo coordinates (longitude, latitude)
    }),
    place: "Tokyo, Japan"
  };
  
  const heatmapData: HeatmapPoint[] = generateEarthquakeHeatmap(earthquakeData);
  console.log(`Generated ${heatmapData.length} points for Tokyo earthquake`);
  
  return heatmapData;
}

// Example with object location format
function exampleWithObjectLocation(): HeatmapPoint[] {
  const earthquakeData: EarthquakeData = {
    id: 12347, 
    usgs_id: "us7000wxyz",
    magnitude: 5.5,
    depth: 8.2,
    time: new Date("2023-12-05T03:45:12"),
    // Simple object with latitude/longitude
    location: {
      latitude: 37.7749,
      longitude: -122.4194 // San Francisco coordinates
    },
    place: "San Francisco, California"
  };
  
  const heatmapData: HeatmapPoint[] = generateEarthquakeHeatmap(earthquakeData);
  console.log(`Generated ${heatmapData.length} points for San Francisco earthquake`);
  
  return heatmapData;
}

// Direct GeoJSON object example
function exampleWithGeoJsonObject(): HeatmapPoint[] {
  const earthquakeData: EarthquakeData = {
    magnitude: 6.5,
    depth: 12.0,
    // GeoJSON Point as direct object (not string)
    location: {
      type: 'Point',
      coordinates: [-74.0060, 40.7128] // New York coordinates
    } as GeoJSONPoint,
    place: "New York, NY"
  };
  
  const heatmapData: HeatmapPoint[] = generateEarthquakeHeatmap(earthquakeData);
  console.log(`Generated ${heatmapData.length} points for New York earthquake`);
  
  return heatmapData;
}

// Export for module usage
export {
  generateEarthquakeHeatmap,
  parseLocation,
  calculateEffectiveRadius,
  calculateIntensityAtPoint,
};