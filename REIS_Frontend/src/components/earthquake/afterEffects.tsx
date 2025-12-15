import React, { useState, useEffect } from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

// Define the types used in the component
interface AftershockFeature {
  properties: {
    earthquake_id: string;
    mag: number;
    reported_at: string;
    title: string;
  };
}

interface AftershocksResponse {
  properties: {
    aftershock_risk: boolean;
    likely_window_days: number;
    region_center: [number, number];
    radius_km: number;
  };
  features: AftershockFeature[];
}

interface AfterEffectsProps {
  earthquake_id: string;
}

const AfterEffects = ({ earthquake_id }: AfterEffectsProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aftershockData, setAftershockData] = useState<AftershocksResponse | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchAftershockData = async () => {
      if (!open) return; // Only fetch when dialog is open
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get<AftershocksResponse>(
          `/api/aftershocks?earthquake_id=${earthquake_id}`,
        );
        console.log('Aftershock data:', response.data);
        setAftershockData(response.data);
      } catch (err) {
        console.error('Error fetching aftershock data:', err);
        setError('Failed to load aftershock data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAftershockData();
  }, [earthquake_id, open]);

  const formatCoordinates = (coords: [number, number]) => {
    return `${coords[0].toFixed(4)}°, ${coords[1].toFixed(4)}°`;
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full">
              View Aftershock Analysis
            </Button>
        </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            Aftershock Analysis
          </AlertDialogTitle>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="ml-2">Loading aftershock data...</span>
            </div>
          ) : error ? (
            <AlertDialogDescription className="text-red-500">
              {error}
            </AlertDialogDescription>
          ) : aftershockData ? (
            <>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  {aftershockData.properties.aftershock_risk ? (
                    <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
                  ) : (
                    <Check className="h-6 w-6 text-green-500 mr-2" />
                  )}
                  <AlertDialogDescription className="text-lg font-medium">
                    {aftershockData.properties.aftershock_risk 
                      ? 'Risk of aftershocks detected' 
                      : 'No significant aftershock risk'}
                  </AlertDialogDescription>
                </div>
                
                <div className=" p-4 rounded-md space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="">Likely Window:</span>
                    <span className="font-medium">{aftershockData.properties.likely_window_days} days</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <span className="">Region Center:</span>
                    <span className="font-medium">{formatCoordinates(aftershockData.properties.region_center)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <span className="">Radius:</span>
                    <span className="font-medium">{aftershockData.properties.radius_km} km</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <span className="">Aftershocks:</span>
                    <span className="font-medium">{aftershockData.features.length}</span>
                  </div>
                </div>
                
                {aftershockData.features.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Recent Aftershocks:</h3>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 text-left">Magnitude</th>
                            <th className="px-2 py-1 text-left">Date</th>
                            <th className="px-2 py-1 text-left">Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aftershockData.features.map((feature, index) => (
                            <tr key={feature.properties.earthquake_id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="px-2 py-1">{feature.properties.mag.toFixed(1)}</td>
                              <td className="px-2 py-1">{new Date(feature.properties.reported_at).toLocaleDateString()}</td>
                              <td className="px-2 py-1 truncate max-w-[150px]" title={feature.properties.title}>
                                {feature.properties.title}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {aftershockData.properties.aftershock_risk && (
                  <AlertDialogDescription className="text-amber-600 text-sm">
                    Stay prepared for potential aftershocks in this region for the next {aftershockData.properties.likely_window_days} days.
                  </AlertDialogDescription>
                )}
              </div>
            </>
          ) : (
            <AlertDialogDescription>
              No aftershock data available for this earthquake.
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          {aftershockData?.properties.aftershock_risk && (
            <AlertDialogAction className="bg-amber-500 hover:bg-amber-600">
              View Safety Info
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AfterEffects;