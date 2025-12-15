// components/EarthquakeMapSelector.tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Rectangle, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Define the types for coordinates and props
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

export interface EarthquakeMapSelectorProps {
  /** Callback fired when coordinates are applied */
  onApplyCoordinates?: (coords: CoordinateBounds) => void;
  /** Initial coordinates (optional) */
  initialCoordinates?: CoordinateBounds;
  /** Center position of the map [lat, lng] */
  mapCenter?: [number, number];
  /** Initial zoom level of the map */
  mapZoom?: number;
}

export default function EarthquakeMapSelector({
  onApplyCoordinates,
  initialCoordinates,
  mapCenter = [20, 0],
  mapZoom = 2
}: EarthquakeMapSelectorProps) {
  const [bounds, setBounds] = useState<Bounds>(null);
  const [firstPoint, setFirstPoint] = useState<Point | null>(null);
  const [secondPoint, setSecondPoint] = useState<Point | null>(null);
  const [coordinates, setCoordinates] = useState<CoordinateBounds>({
    minLat: initialCoordinates?.minLat || null,
    maxLat: initialCoordinates?.maxLat || null,
    minLng: initialCoordinates?.minLng || null,
    maxLng: initialCoordinates?.maxLng || null
  });

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
    }
  }, [initialCoordinates]);

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
  };

  // Apply the selection to filters
  const applySelection = (): void => {
    if (coordinates.minLat !== null && 
        coordinates.maxLat !== null && 
        coordinates.minLng !== null && 
        coordinates.maxLng !== null) {
      console.log("Applied coordinates:", coordinates);
      
      // Call the callback if provided
      if (onApplyCoordinates) {
        onApplyCoordinates(coordinates);
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
    }
  }, [firstPoint, secondPoint]);

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

  return (
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
        
        <div className="h-96 border rounded-md overflow-hidden">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler />
            {bounds && (
              <Rectangle 
                bounds={[
                  [bounds[0].lat, bounds[0].lng],
                  [bounds[1].lat, bounds[1].lng]
                ]}
                pathOptions={{ color: 'blue', weight: 2, opacity: 0.7, fillOpacity: 0.2 }}
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
            <Button disabled={!hasValidBounds()}>Apply Selection</Button>
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
  );
}