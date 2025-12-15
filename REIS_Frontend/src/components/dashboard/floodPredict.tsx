// components/EarthquakeMapSelector.tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Rectangle, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { url } from 'inspector';
import { useTheme } from 'next-themes';
import axios from 'axios';
import { set } from 'date-fns';

// Define the types for coordinates
type Point = {
  lat: number;
  lng: number;
};

type CoordinateBounds = {
  minLat: number | null;
  maxLat: number | null;
  minLng: number | null;
  maxLng: number | null;
};

type Bounds = [Point, Point] | null;

export default function FloodMapSelector() {
  // Local variables that were previously props
  const mapCenter: [number, number] = [20, 0];
  const mapZoom: number = 2;
  const initialCoordinates: CoordinateBounds = {
    minLat: null,
    maxLat: null,
    minLng: null,
    maxLng: null
  };

  const [bounds, setBounds] = useState<Bounds>(null);
  const [firstPoint, setFirstPoint] = useState<Point | null>(null);
  const [secondPoint, setSecondPoint] = useState<Point | null>(null);
  const [coordinates, setCoordinates] = useState<CoordinateBounds>(initialCoordinates);
  const [areaError, setAreaError] = useState<string | null>(null);
  const [currentArea, setCurrentArea] = useState<number | null>(null);
  const [riskScores, setRiskScores] = useState<number>(); // Adjust type as needed
  const [loading, setLoading] = useState(false);
  
  const MAX_AREA = 5.5;

  // Initialize with initial coordinates if provided
  useEffect(() => {
    if (initialCoordinates && 
        initialCoordinates.minLat !== null && 
        initialCoordinates.maxLat !== null && 
        initialCoordinates.minLng !== null && 
        initialCoordinates.maxLng !== null) {
      const minLat = initialCoordinates.minLat;
      const maxLat = initialCoordinates.maxLat;
      const minLng = initialCoordinates.minLng;
      const maxLng = initialCoordinates.maxLng;
      
      setBounds([
        { lat: minLat, lng: minLng },
        { lat: maxLat, lng: maxLng }
      ]);
      
      setFirstPoint({ lat: minLat, lng: minLng });
      setSecondPoint({ lat: maxLat, lng: maxLng });
      setCoordinates({ minLat, maxLat, minLng, maxLng });
      
      // Calculate area
      const area = calculateArea(minLat, maxLat, minLng, maxLng);
      checkAreaLimit(area);
    }
  }, []);

  // Calculate area based on coordinates
  const calculateArea = (minLat: number, maxLat: number, minLng: number, maxLng: number): number => {
    const latDiff = Math.abs(maxLat - minLat);
    const lngDiff = Math.abs(maxLng - minLng);
    return latDiff * lngDiff;
  };

  // Check if area exceeds limit and set error message if it does
  const checkAreaLimit = (area: number): boolean => {
    setCurrentArea(area);
    
    if (area > MAX_AREA) {
      setAreaError(`Selection area (${area.toFixed(2)} sq units) exceeds the maximum allowed (${MAX_AREA} sq units).`);
      return false;
    } else {
      setAreaError(null);
      return true;
    }
  };

  // Reset the selection
  const resetSelection = (): void => {
    setFirstPoint(null);
    setSecondPoint(null);
    setBounds(null);
    setCoordinates({
      minLat: null,
      maxLat: null,
      minLng: null,
      maxLng: null
    });
    setAreaError(null);
    setCurrentArea(null);
  };

  // Apply the selection to filters
  const applySelection = (): void => {
    if (coordinates.minLat !== null && 
        coordinates.maxLat !== null && 
        coordinates.minLng !== null && 
        coordinates.maxLng !== null) {
      
      // Check area one more time before applying
      const area = calculateArea(
        coordinates.minLat,
        coordinates.maxLat,
        coordinates.minLng,
        coordinates.maxLng
      );
      
      if (checkAreaLimit(area)) {
        console.log("Applied coordinates:", coordinates);
        // Handle the application of coordinates locally
        // You could add additional state variables to track applied filters
      }
    }
  };

  // Calculate bounds when two points are selected
  useEffect(() => {
    if (firstPoint && secondPoint) {
      const minLat = Math.min(firstPoint.lat, secondPoint.lat);
      const maxLat = Math.max(firstPoint.lat, secondPoint.lat);
      const minLng = Math.min(firstPoint.lng, secondPoint.lng);
      const maxLng = Math.max(firstPoint.lng, secondPoint.lng);
      
      setBounds([
        { lat: minLat, lng: minLng },
        { lat: maxLat, lng: maxLng }
      ]);
      
      setCoordinates({ minLat, maxLat, minLng, maxLng });
      
      // Calculate and check area
      const area = calculateArea(minLat, maxLat, minLng, maxLng);
      checkAreaLimit(area);
    }
  }, [firstPoint, secondPoint]);

const searchForRisk = async () => {
  if (!hasValidBounds()) {
    alert("Please select a valid area on the map.");
    return;
  }
  setLoading(true);
  try {
    setRiskScores(0);
  const res = await axios.get(`/api/floodRisk?min_lat=${coordinates.minLat}&max_lat=${coordinates.maxLat}&min_lon=${coordinates.minLng}&max_lon=${coordinates.maxLng}&grid_size=0.1&past_days=3`);
  const data = res.data;
  setRiskScores(parseFloat((data.properties.average_risk * 100).toFixed(2)));

  setLoading(false);
  } catch (error) {
    console.error("Error fetching flood risk data:", error);
    setRiskScores(0);
    setLoading(false);
  }

}
  // Map click handler component
  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        const roundedLat = Math.round(lat * 100) / 100;
        const roundedLng = Math.round(lng * 100) / 100;
        
        if (!firstPoint) {
          setFirstPoint({ lat: roundedLat, lng: roundedLng });
        } else if (!secondPoint) {
          setSecondPoint({ lat: roundedLat, lng: roundedLng });
        } else {
          // If both points are already set, start over with a new first point
          setFirstPoint({ lat: roundedLat, lng: roundedLng });
          setSecondPoint(null);
          setBounds(null);
          setAreaError(null);
          setCurrentArea(null);
        }
      }
    });
    
    return null;
  }

  // Helper function to determine if we have valid bounds
  const hasValidBounds = (): boolean => {
    return coordinates.minLat !== null && 
           coordinates.maxLat !== null && 
           coordinates.minLng !== null && 
           coordinates.maxLng !== null;
  };

  // Check if selection is valid (has bounds and area is within limit)
  const isSelectionValid = (): boolean => {
    return hasValidBounds() && !areaError;
  };
  const {theme} = useTheme()
  const [themeSelected, setThemeSelected] = useState({
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  useEffect(() => {
  if(theme === 'dark'){
    setThemeSelected({
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
    }
    else if(theme === 'light'){
        setThemeSelected({
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
    }
    }, [theme]);

  return (
    <>
    <Card className="w-full mb-4 mt-4">
      <CardHeader>
        <CardTitle className="text-center">Select Region on Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm">
          {!firstPoint 
            ? "Click on the map to set the first corner of your region" 
            : !secondPoint 
              ? "Now click to set the opposite corner" 
              : "Region selected. Click 'Apply Selection' to filter earthquakes in this area or click on the map to reset and start over."}
        </div>
        
        {areaError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{areaError}</AlertDescription>
          </Alert>
        )}
        
        <div className="h-96 border rounded-md overflow-hidden">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution={themeSelected.attribution}
              url={themeSelected.url}
            />
            <MapClickHandler />
            {bounds && (
              <Rectangle 
                bounds={[
                  [bounds[0].lat, bounds[0].lng],
                  [bounds[1].lat, bounds[1].lng]
                ]}
                pathOptions={{ 
                  color: areaError ? 'red' : 'blue', 
                  weight: 2, 
                  opacity: 0.7, 
                  fillOpacity: 0.2 
                }}
              />
            )}
          </MapContainer>
        </div>
        
        {hasValidBounds() && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div>Min Latitude: {coordinates.minLat}</div>
            <div>Max Latitude: {coordinates.maxLat}</div>
            <div>Min Longitude: {coordinates.minLng}</div>
            <div>Max Longitude: {coordinates.maxLng}</div>
            {currentArea !== null && (
              <div className="col-span-2">
                Area: {currentArea.toFixed(2)} sq units 
                {currentArea > MAX_AREA ? 
                  ` (exceeds maximum of ${MAX_AREA} sq units)` : 
                  ` (within maximum of ${MAX_AREA} sq units)`
                }
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={resetSelection} 
          disabled={!firstPoint}
        >
          Reset Selection
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!isSelectionValid()}>Apply Selection</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apply Region Filter</AlertDialogTitle>
              <AlertDialogDescription>
                This will filter earthquakes to only show those within the selected region:
                {hasValidBounds() && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>Min Latitude: {coordinates.minLat}</div>
                    <div>Max Latitude: {coordinates.maxLat}</div>
                    <div>Min Longitude: {coordinates.minLng}</div>
                    <div>Max Longitude: {coordinates.maxLng}</div>
                    {currentArea !== null && (
                      <div className="col-span-2">
                        Area: {currentArea.toFixed(2)} sq units
                      </div>
                    )}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={applySelection}>Apply</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
    
    
    
      <Card className="w-full mb-4 mt-4">
        <CardHeader>
          <CardTitle className="text-center">Flood Risk Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            {loading && <p>Loading... This may take a while while we ascertain the flood risk in your area</p>}
            <p>Flood Risk Score: {riskScores}/10</p>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button onClick={searchForRisk} className="mb-4">Search for Flood Risk</Button>
          </CardFooter>
        
      </Card>
    
    </>
  );
}