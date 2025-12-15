"use client";
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from 'react'
import { MapType, MapView } from '@/types/maptypes';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { AlertDialogTitle, AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { Input } from '@/components/ui/input';
import { filterStateEarthquake , filterStateFlood ,filterStateWildfire } from '@/types/filterEarthquake';
import { GeoJSONFeature } from '@/types/geoJson';
import axios from 'axios';
import { set } from 'date-fns';
import { quakeQueryString } from '@/utilities/E_query';
import { FloodFeature } from '@/types/floodJson';
import { FireFeature } from '@/types/fireJson';
import { floodQueryString } from '@/utilities/F_query';
import { toast } from 'sonner';
import { wildfireQueryString } from '@/utilities/W-query';
import { useSearchParams } from 'next/navigation';

// Dynamically import map components with SSR disabled
const DisasterMap = dynamic(() => import('@/components/earthquake/HeatmapLayer'), { ssr: false });
const WildFireMap = dynamic(() => import('@/components/dashboard/wildFire'), { ssr: false });
const FloodMap = dynamic(() => import('@/components/dashboard/floodmap'), { ssr: false });
const EarthquakeMapSelector = dynamic(() => import('@/components/earthquake/MapSelector'), { ssr: false });
const FloodMapSelector = dynamic(() => import('@/components/dashboard/floodPredict'), { ssr: false });
const CesiumMap = dynamic(() => import('@/components/cesium/CesiumMap'), { ssr: false });

// Add filter state types for flood and wildfire



const page = () => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [mapType, setMapType] = useState<MapType>('heatmap');
  const [mapView, setMapView] = useState<MapView>('streets');
  const [selectedTab, setSelectedTab] = useState<'earthquake' | 'flood' | 'wildfire'>('earthquake');
  const [earthquakeData, setEarthquakeData] = useState<GeoJSONFeature[]>([]);
  const [floodData, setFloodData] = useState<FloodFeature[]>([]);
  const [wildfireData, setWildfireData] = useState<FireFeature[]>([]);
  const [user_id, setUser_id] = useState<string | null>(null);
  
  // Set initial tab from URL parameter
  useEffect(() => {
    if (tabParam && (tabParam === 'earthquake' || tabParam === 'flood' || tabParam === 'wildfire')) {
      setSelectedTab(tabParam);
    }
  }, [tabParam]);
  // Earthquake filter state
  const [earthquakeFilter, setEarthquakeFilter] = useState<filterStateEarthquake>({
    min_magnitude: null,
    max_magnitude: null,
    min_depth: null,
    max_depth: null,
    min_lat: null,
    max_lat: null,
    min_lon: null,
    max_lon: null,
    start_time: null,
    end_time: null,
  });

  // Flood filter state
  const [floodFilter, setFloodFilter] = useState<filterStateFlood>({
  start_time: null,
  end_time: null,
  min_lat: null,
  max_lat: null,
  min_lon: null,
  max_lon: null,
  severity_level: null,
});

  // Wildfire filter state
  const [wildfireFilter, setWildfireFilter] = useState<filterStateWildfire>({
  start_time: null,
  end_time: null,
  min_lat: null,
  max_lat: null,
  min_lon: null,
  max_lon: null,
  severity_level: null,
});

  // Handle earthquake filter changes
  const handleEarthquakeFilterChange = (field: keyof filterStateEarthquake, value: string) => {
    setEarthquakeFilter((prev) => ({
      ...prev,
      [field]: value === '' ? null : (field.includes('time') ? value : parseFloat(value))
    }));
  };

  useEffect(() => {
    //get local storage data
    setUser_id(localStorage.getItem('user_id'));
  }, []);
  // Handle flood filter changes
  const handleFloodFilterChange = (
  field: keyof filterStateFlood, 
  value: string
) => {
  setFloodFilter((prev: filterStateFlood) => ({
    ...prev,
    [field]: value === '' ? null : (field === 'start_time' || field === 'end_time' || field === 'severity_level') ? value : Number(value)
  }));
};

  // Handle wildfire filter changes
  const handleWildfireFilterChange = (
  field: string, 
  value: string
) => {
  // Map the UI field names to the API parameter names
  const fieldMapping: Record<string, keyof filterStateWildfire> = {
    'minIntensity': 'severity_level',
    'minDate': 'start_time',
    'maxDate': 'end_time',
    'minLatitude': 'min_lat',
    'maxLatitude': 'max_lat',
    'minLongitude': 'min_lon',
    'maxLongitude': 'max_lon'
  };
  
  // If the field exists in our mapping, update the state
  const apiField = fieldMapping[field];
  if (apiField) {
    setWildfireFilter((prev: filterStateWildfire) => ({
      ...prev,
      [apiField]: value === '' ? null : (apiField === 'start_time' || apiField === 'end_time' || apiField === 'severity_level') ? value : Number(value)
    }));
  }
};
  // Handle earthquake coordinate selection
  const handleEarthquakeCoordinateSelection = (coords: {
    minLat: number | null;
    maxLat: number | null;
    minLng: number | null;
    maxLng: number | null;
  }) => {
    setEarthquakeFilter((prev) => ({
      ...prev,
      min_lat: coords.minLat,
      max_lat: coords.maxLat,
      min_lon: coords.minLng,
      max_lon: coords.maxLng
      
    }));
  };

  // Handle flood coordinate selection
  const handleFloodCoordinateSelection = (coordinates: {
  minLat: number | null;
  maxLat: number | null;
  minLng: number | null;
  maxLng: number | null;
}) => {
  setFloodFilter((prev: filterStateFlood) => ({
    ...prev,
    min_lat: coordinates.minLat,
    max_lat: coordinates.maxLat,
    min_lon: coordinates.minLng,
    max_lon: coordinates.maxLng
  }));}

  // Handle wildfire coordinate selection
  const handleWildfireCoordinateSelection = (coords: {
  minLat: number | null;
  maxLat: number | null;
  minLng: number | null;
  maxLng: number | null;
}) => {
  setWildfireFilter((prev: filterStateWildfire) => ({
    ...prev,
    min_lat: coords.minLat,
    max_lat: coords.maxLat,
    min_lon: coords.minLng,
    max_lon: coords.maxLng
  }));
};

  useEffect(() =>{
    const getAlerts = async () => {
    try{
      const res = await axios.get<GeoJSONFeature[]>("/api/earthquake")
      setEarthquakeData(res.data);
    }
    catch(err){
      console.error("Failed to load alerts", err);
    }
    }
    getAlerts();
  },[])

  useEffect(() => {
    const getAlerts = async () => {
      try {
        const res = await axios.get<FloodFeature[]>("/api/flood?count=20");
        setFloodData(res.data);
      }
      catch (err) {
        console.error("Failed to load alerts", err);
      }
    }
    getAlerts();
  }
  , []);
  useEffect(() => {
    const getAlerts = async () => {
      try {
        const res = await axios.get<FireFeature[]>("/api/wildfire?count=20");
        setWildfireData(res.data);
        
      }
      catch (err) {
        console.error("Failed to load alerts", err);
      }
    }
    getAlerts();
  }
  , []);


  // Handle filter submissions
  const handleEarthquakeFilterSubmit = () => {
    console.log('Earthquake filter submitted:', earthquakeFilter);
    const res = quakeQueryString(earthquakeFilter);
    console.log('Earthquake query string:', res);
    fetchFilteredEarthquakeData(res);
    //clear filter state
    setEarthquakeFilter({
      min_magnitude: null,
      max_magnitude: null,
      min_depth: null,
      max_depth: null,
      min_lat: null,
      max_lat: null,
      min_lon: null,
      max_lon: null,
      start_time: null,
      end_time: null,
    });
  };
  // Fetch filtered earthquake data
   const fetchFilteredEarthquakeData = async (query : String) => {
    try {
      setEarthquakeData([]);
      const res = await axios.get<GeoJSONFeature[]>(`/api/earthquake?${query}`);
      if(res.data.length === 0){
        toast.error('No earthquake data found for the selected filters.');
        return;
      }
      if(res.data.length > 0){
        toast.success('Earthquake data found for the selected filters.');
        setEarthquakeData(res.data);
      }
      
    } catch (error) {
      console.error('Error fetching filtered earthquake data:', error);
    }
  }

  // Flood filter submission handler
const handleFloodFilterSubmit = () => {
  console.log('Flood filter submitted:', floodFilter);
  const res = floodQueryString(floodFilter);
  console.log('Flood query string:', res);
  fetchFilteredFloodData(res);
  // Clear filter state
  setFloodFilter({
    start_time: null,
    end_time: null,
    min_lat: null,
    max_lat: null,
    min_lon: null,
    max_lon: null,
    severity_level: null,
  });
};

// Fetch filtered flood data
const fetchFilteredFloodData = async (query: string) => {
  try {
    setFloodData([]);
    const res = await axios.get<FloodFeature[]>(`/api/flood?${query}`);
    if(res.data.length === 0){
      toast.error('No flood data found for the selected filters.');
      return;
    }
      
    if(res.data.length > 0){
    setFloodData(res.data);
    }
  } catch (error) {
    console.error('Error fetching filtered flood data:', error);
  }
};

  const handleWildfireFilterSubmit = () => {
  console.log('Wildfire filter submitted:', wildfireFilter);
  const res = wildfireQueryString(wildfireFilter);
  console.log('Wildfire query string:', res);
  fetchFilteredWildfireData(res);
  // Clear filter state
  setWildfireFilter({
    start_time: null,
    end_time: null,
    min_lat: null,
    max_lat: null,
    min_lon: null,
    max_lon: null,
    severity_level: null,
  });
};

// Fetch filtered wildfire data
const fetchFilteredWildfireData = async (query: string) => {
  try {
    setWildfireData([]);
    const res = await axios.get<FireFeature[]>(`/api/wildfire?${query}`);
    if(res.data.length === 0){
      toast.error('No wildfire data found for the selected filters.');
      return;
    }
    if(res.data.length > 0){
      toast.success('Wildfire data found for the selected filters.');
      setWildfireData(res.data);
    }
  } catch (error) {
    console.error('Error fetching filtered wildfire data:', error);
  }
};

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-4">Disasters</h1>
      <p className="text-center mb-1">
        Please select a disaster type from down below to view the corresponding map.
      </p>
      
      <div className="flex flex-wrap gap-4 justify-between px-10 mb-4">
        {/* Earthquake Filter Button */}
        {selectedTab === 'earthquake' && (
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className='w-[40%]'>
                Filter Earthquakes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className='text-center'>
                  Filter Earthquakes
                </AlertDialogTitle>
                <AlertDialogDescription className='overflow-y-scroll h-[500px] scroll-m-4'>
                  <p className="text-center mb-1">
                    Please select the filters you would like to apply to the earthquake data. Required fields are marked with an asterisk (*).
                  </p>
                  <div className="flex flex-wrap gap-4">
  <Input
    type="number"
    placeholder="Min Magnitude"
    className="w-[40%]"
    onChange={(e) => handleEarthquakeFilterChange('min_magnitude', e.target.value)}
  />
  <Input
    type="number"
    placeholder="Max Magnitude"
    className="w-[40%]"
    onChange={(e) => handleEarthquakeFilterChange('max_magnitude', e.target.value)}
  />
  <Input
    type="number"
    placeholder="Min Depth"
    className="w-[40%]"
    onChange={(e) => handleEarthquakeFilterChange('min_depth', e.target.value)}
  />
  <Input
    type="number"
    placeholder="Max Depth"
    className="w-[40%]"
    onChange={(e) => handleEarthquakeFilterChange('max_depth', e.target.value)}
  />
  <Input
    type="number"
    placeholder="Min Latitude"
    className="w-[40%]"
    value={earthquakeFilter.min_lat !== null ? earthquakeFilter.min_lat : ''}
    onChange={(e) => handleEarthquakeFilterChange('min_lat', e.target.value)}
  />
  <Input
    type="number"
    placeholder="Max Latitude"
    className="w-[40%]"
    value={earthquakeFilter.max_lat !== null ? earthquakeFilter.max_lat : ''}
    onChange={(e) => handleEarthquakeFilterChange('max_lat', e.target.value)}
  />
  <Input
    type="number"
    placeholder="Min Longitude"
    className="w-[40%]"
    value={earthquakeFilter.min_lon !== null ? earthquakeFilter.min_lon : ''}
    onChange={(e) => handleEarthquakeFilterChange('min_lon', e.target.value)}
  />
  <Input
    type="number"
    placeholder="Max Longitude"
    className="w-[40%]"
    value={earthquakeFilter.max_lon !== null ? earthquakeFilter.max_lon : ''}
    onChange={(e) => handleEarthquakeFilterChange('max_lon', e.target.value)}
  />
  <Input
    type="date"
    placeholder="Start Date"
    className="w-[40%]"
    onChange={(e) => handleEarthquakeFilterChange('start_time', e.target.value)}
  />
  <Input
    type="date"
    placeholder="End Date"
    className="w-[40%]"
    onChange={(e) => handleEarthquakeFilterChange('end_time', e.target.value)}
  />
</div>

                  
                  {/* Pass necessary props to EarthquakeMapSelector */}
                  <EarthquakeMapSelector 
                    onApplyCoordinates={handleEarthquakeCoordinateSelection}
                    initialCoordinates={{
                      minLat: earthquakeFilter.min_lat,
                      maxLat: earthquakeFilter.max_lat,
                      minLng: earthquakeFilter.min_lon,
                      maxLng: earthquakeFilter.max_lon
                    }}
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogTrigger asChild>
                  <Button type="submit" onClick={handleEarthquakeFilterSubmit}>Submit</Button>
                </AlertDialogTrigger>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Flood Filter Button */}
        {selectedTab === 'flood' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className='w-[40%]'>
                Filter Floods
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className='text-center'>
                  Filter Floods
                </AlertDialogTitle>
                <AlertDialogDescription className='overflow-y-scroll h-[500px] scroll-m-4'>
                  <p className="text-center mb-1">
                    Please select the filters you would like to apply to the flood data. Required fields are marked with an asterisk (*).
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Input
                      type="text"
                      placeholder="minor, moderate, major"
                      className="w-full"
                      value={floodFilter.severity_level !== null ? floodFilter.severity_level : ''}
                      onChange={(e) => handleFloodFilterChange('severity_level', e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="Start Time"
                      className="w-full"
                      value={floodFilter.start_time || ''}
                      onChange={(e) => handleFloodFilterChange('start_time', e.target.value)}
                    />
                    
                    <Input
                      type="date"
                      placeholder="End Time"
                      className="w-full"
                      value={floodFilter.end_time || ''}
                      onChange={(e) => handleFloodFilterChange('end_time', e.target.value)}
                    />
                    
                    <Input
                      type="number"
                      placeholder="Min Latitude"
                      className="w-full"
                      value={floodFilter.min_lat !== null ? floodFilter.min_lat : ''}
                      onChange={(e) => handleFloodFilterChange('min_lat', e.target.value)}
                    />
                    
                    <Input
                      type="number"
                      placeholder="Max Latitude"
                      className="w-full"
                      value={floodFilter.max_lat !== null ? floodFilter.max_lat : ''}
                      onChange={(e) => handleFloodFilterChange('max_lat', e.target.value)}
                    />
                    
                    <Input
                      type="number"
                      placeholder="Min Longitude"
                      className="w-full"
                      value={floodFilter.min_lon !== null ? floodFilter.min_lon : ''}
                      onChange={(e) => handleFloodFilterChange('min_lon', e.target.value)}
                    />
                    
                    <Input
                      type="number"
                      placeholder="Max Longitude"
                      className="w-full"
                      value={floodFilter.max_lon !== null ? floodFilter.max_lon : ''}
                      onChange={(e) => handleFloodFilterChange('max_lon', e.target.value)}
                    />
                  </div>


// Keep EarthquakeMapSelector but update the property names to match the new structure
<EarthquakeMapSelector 
  onApplyCoordinates={handleFloodCoordinateSelection}
  initialCoordinates={{
    minLat: floodFilter.min_lat,
    maxLat: floodFilter.max_lat,
    minLng: floodFilter.min_lon,
    maxLng: floodFilter.max_lon
  }}
/>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogTrigger asChild>
                  <Button type="submit" onClick={handleFloodFilterSubmit}>Submit</Button>
                </AlertDialogTrigger>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Wildfire Filter Button */}
        {selectedTab === 'wildfire' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className='w-[40%]'>
                Filter Wildfires
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className='text-center'>
                  Filter Wildfires
                </AlertDialogTitle>
                <AlertDialogDescription className='overflow-y-scroll h-[500px] scroll-m-4'>
                  <p className="text-center mb-1">
                    Please select the filters you would like to apply to the wildfire data. Required fields are marked with an asterisk (*).
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Input
                      type="text"
                      placeholder="Severity Level"
                      className="w-full"
                      value={wildfireFilter.severity_level !== null ? wildfireFilter.severity_level : ''}
                      onChange={(e) => handleWildfireFilterChange('minIntensity', e.target.value)}
                    />
                    
                    <Input
                      type="date"
                      placeholder="Start Time"
                      className="w-full"
                      value={wildfireFilter.start_time || ''}
                      onChange={(e) => handleWildfireFilterChange('minDate', e.target.value)}
                    />
                    
                    <Input
                      type="date"
                      placeholder="End Time"
                      className="w-full"
                      value={wildfireFilter.end_time || ''}
                      onChange={(e) => handleWildfireFilterChange('maxDate', e.target.value)}
                    />
                    
                    <Input
                      type="number"
                      placeholder="Min Latitude"
                      className="w-full"
                      value={wildfireFilter.min_lat !== null ? wildfireFilter.min_lat : ''}
                      onChange={(e) => handleWildfireFilterChange('minLatitude', e.target.value)}
                    />
                    
                    <Input
                      type="number"
                      placeholder="Max Latitude"
                      className="w-full"
                      value={wildfireFilter.max_lat !== null ? wildfireFilter.max_lat : ''}
                      onChange={(e) => handleWildfireFilterChange('maxLatitude', e.target.value)}
                    />
                    
                    <Input
                      type="number"
                      placeholder="Min Longitude"
                      className="w-full"
                      value={wildfireFilter.min_lon !== null ? wildfireFilter.min_lon : ''}
                      onChange={(e) => handleWildfireFilterChange('minLongitude', e.target.value)}
                    />
                    
                    <Input
                      type="number"
                      placeholder="Max Longitude"
                      className="w-full"
                      value={wildfireFilter.max_lon !== null ? wildfireFilter.max_lon : ''}
                      onChange={(e) => handleWildfireFilterChange('maxLongitude', e.target.value)}
                    />
                  </div>
                  
                  {/* Use EarthquakeMapSelector component for wildfire as well */}
                  <EarthquakeMapSelector 
                    onApplyCoordinates={handleWildfireCoordinateSelection}
                    initialCoordinates={{
                      minLat: wildfireFilter.min_lat,
                      maxLat: wildfireFilter.max_lat,
                      minLng: wildfireFilter.min_lon,
                      maxLng: wildfireFilter.max_lon
                    }}
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogTrigger asChild>
                  <Button type="submit" onClick={handleWildfireFilterSubmit}>Submit</Button>
                </AlertDialogTrigger>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Map type and view selectors */}
        <div className="flex gap-4">
          <Select value={mapType} onValueChange={(value) => setMapType(value as MapType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Map Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heatmap">Heatmap</SelectItem>
              <SelectItem value="markers">Markers</SelectItem>
              <SelectItem value="clusters">Clusters</SelectItem>
              <SelectItem value="polygons">Polygons</SelectItem>
            </SelectContent>
          </Select>

          <Select value={mapView} onValueChange={(value) => setMapView(value as MapView)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Map View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="streets">Streets</SelectItem>
              <SelectItem value="satellite">Satellite</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
              <SelectItem value="cesium">Cesium 3D</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={(val) => setSelectedTab(val as typeof selectedTab)} className='w-full px-10'>
        <TabsList className='w-full'>
          <TabsTrigger value='earthquake' className='w-full'>Earthquake</TabsTrigger>
          <TabsTrigger value='flood' className='w-full'>Flood</TabsTrigger>
          <TabsTrigger value='wildfire' className='w-full'>Wildfire</TabsTrigger>
        </TabsList>

        <TabsContent value='earthquake'>
          {!earthquakeData && <p className="text-center">Loading...</p>}
          {earthquakeData.length > 0 &&
          <div className="h-[700px] rounded-lg overflow-hidden border ">
            {mapView === 'cesium' ? (
              <CesiumMap earthquakes={earthquakeData} />
            ) : (
              <DisasterMap geojsonData={earthquakeData} mapType={mapType} mapView={mapView} interactive={true} />
            )}
          </div>
          }
        </TabsContent>

        <TabsContent value='flood'>
          <div className="flex gap-4 h-auto flex-col">
          <div className="h-[700px] rounded-lg overflow-hidden border ">
            {mapView === 'cesium' ? (
              <CesiumMap floodData={floodData} />
            ) : (
              <FloodMap disaster={floodData} mapType={mapType} mapView={mapView} interactive={true} />
            )}
          </div>
          <div className="flex gap-4 font-bold text-2xl">
            Risk calculation
            </div>
          {
            !user_id &&
            <div className="flex justify-center w-full text-center flex-col gap-4 items-center p-4">
                This is a premium feature. Please login to your account to access it.
              <Button className='w-[20%]' onClick={() => window.location.href = '/auth/login'}>
              Login
              </Button>

            </div>
          }
          {user_id &&
          <div className="rounded-lg border ">
            <FloodMapSelector/>
          </div>
          }
          </div>
        </TabsContent>

        <TabsContent value='wildfire'>
          <div className="h-[700px] rounded-lg overflow-hidden border ">
            {mapView === 'cesium' ? (
              <CesiumMap wildfireData={wildfireData} />
            ) : (
              <WildFireMap disaster={wildfireData} mapView={mapView} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default page;