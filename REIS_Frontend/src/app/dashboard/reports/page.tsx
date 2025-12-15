'use client';

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, AlertTriangle, Users, Info, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

export default function DisasterEventPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get parameters from URL and localStorage
  const [gdacsId, setGdacsId] = useState<string | null>(null);
  const [disasterType, setDisasterType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [disasterData, setDisasterData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportFetched, setReportFetched] = useState(false);
  
  useEffect(() => {
    // Get parameters from URL
    const id = searchParams.get('gdacs_id');
    const type = searchParams.get('type')?.toUpperCase();
    
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Redirect to login if user ID is not found
      router.push('/auth/login');
    }
    
    // Set state values
    setGdacsId(id);
    setDisasterType(type);
    setUserId(storedUserId);
    
    // Redirect if required parameters are missing
    if (!id || !type) {
      router.push('/');
    }
  }, [searchParams, router]);

  const getExistingReport = async () => {
    if (!gdacsId || !disasterType || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(`/api/gdacsReport?gdacs_id=${gdacsId}&type=${disasterType}&user_id=${userId}`);
      if (res.status === 200) {
        console.log('Existing disaster data:', res.data);
        setDisasterData(res.data);
        setReportFetched(true);
      }
    } catch (error) {
      console.error('Error fetching existing disaster data:', error);
      setError('Failed to get the existing report. You can generate a new one.');
    } finally {
      setLoading(false);
    }
  };
  
  const generateNewReport = async () => {
    if (!gdacsId || !disasterType || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(`/api/gdacsReport?gdacs_id=${gdacsId}&type=${disasterType}&user_id=${userId}`);
      if (res.status === 200) {
        console.log('New disaster data:', res.data);
        setDisasterData(res.data);
        setReportFetched(true);
      }
    } catch (error) {
      console.error('Error generating new disaster data:', error);
      setError('Failed to generate a new report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get alert color based on level
  const getAlertColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'green': return 'bg-green-50 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'orange': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'red': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  // Initial form section to get report
  if (!reportFetched) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Disaster Event Report</CardTitle>
            <CardDescription>Get information about this disaster event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="gdacs_id" className="text-sm font-medium">GDACS ID</label>
                <input 
                  type="text" 
                  id="gdacs_id" 
                  value={gdacsId || ''} 
                  readOnly 
                  className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="disaster_type" className="text-sm font-medium">Disaster Type</label>
                <input 
                  type="text" 
                  id="disaster_type" 
                  value={disasterType || ''} 
                  readOnly 
                  className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700" 
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <button 
              onClick={getExistingReport}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Loading...' : 'Get Existing Report'}
            </button>
            
            {error && (
              <button 
                onClick={generateNewReport}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
              >
                {loading ? 'Generating...' : 'Generate New Report'}
              </button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-lg">Loading disaster data...</p>
      </div>
    );
  }

  if (!disasterData) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Disaster Event Not Found</h1>
        <p className="text-lg mb-6">The disaster event you're looking for could not be found.</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { properties } = disasterData;
  const fromDate = new Date(properties.fromdate);
  const toDate = new Date(properties.todate);
  const dateModified = new Date(properties.datemodified);
  
  const alertColorClass = getAlertColor(properties.alertlevel);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        {/* Header with alert level banner */}
        <div className={`${alertColorClass} p-4 rounded-lg border flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <img 
              src={properties.icon} 
              alt="Alert Icon" 
              className="w-10 h-10" 
            />
            <div>
              <h1 className="text-2xl font-bold">{properties.name}</h1>
              <p className="text-sm opacity-75">{properties.description}</p>
            </div>
          </div>
          <Badge variant="outline" className={`${alertColorClass} font-bold text-sm py-1 px-3`}>
            Alert Level: {properties.alertlevel}
          </Badge>
        </div>

        {/* User ID and GDACS ID info */}
        <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-slate-500">
          <div>User ID: {userId || 'Not available'}</div>
          <div>GDACS ID: {gdacsId} | Type: {disasterType}</div>
        </div>

        {/* Summary card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Event Summary</CardTitle>
              <Badge variant="outline">ID: {properties.eventid}</Badge>
            </div>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> 
              {properties.country} ({properties.iso3})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium">Duration:</span> {format(fromDate, 'PPP')} to {format(toDate, 'PPP')}
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Active Status</AlertTitle>
                <AlertDescription>
                  {properties.iscurrent === "true" ? "This is an active disaster event." : "This disaster event has ended."}
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-50 p-4 rounded-md dark:bg-slate-800">
                  <h3 className="font-medium text-sm mb-1 dark:text-slate-500">Location</h3>
                  <p className="text-sm text-muted-foreground">
                    Coordinates: {disasterData.geometry.coordinates[1]}, {disasterData.geometry.coordinates[0]}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-md dark:bg-slate-800">
                  <h3 className="font-medium text-sm mb-1 dark:text-slate-500">Data Source</h3>
                  <p className="text-sm text-muted-foreground">{properties.source}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">{properties.summary}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Last updated: {format(dateModified, 'PPpp')}
          </CardFooter>
        </Card>

        {/* Tabs for different data sections */}
        <Tabs defaultValue="impact">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="impact">Impact Data</TabsTrigger>
            <TabsTrigger value="maps">Maps & Imagery</TabsTrigger>
            <TabsTrigger value="details">Additional Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="impact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> 
                  People Affected
                </CardTitle>
              </CardHeader>
              <CardContent>
                {properties.sendai && properties.sendai.length > 0 ? (
                  <div className="space-y-4">
                    {properties.sendai.map((item, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-md dark:bg-slate-800">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{item.sendaivalue} people affected</span>
                          <Badge variant="outline">{item.region}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Reported: {format(new Date(item.dateinsert), 'PPp')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No detailed impact data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="maps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" /> 
                  Event Maps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Overview Map</h3>
                    <div className="aspect-video bg-slate-100 rounded-md overflow-hidden">
                      <img 
                        src={properties.images.overviewmap}
                        alt="Overview Map"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Flood Map</h3>
                    <div className="aspect-video bg-slate-100 rounded-md overflow-hidden">
                      <img 
                        src={properties.images.floodmap}
                        alt="Flood Map"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Rain Map</h3>
                    <div className="aspect-video bg-slate-100 rounded-md overflow-hidden">
                      <img 
                        src={properties.images.rainmap}
                        alt="Rain Map"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Population Map</h3>
                    <div className="aspect-video bg-slate-100 rounded-md overflow-hidden">
                      <img 
                        src={properties.images.populationmap}
                        alt="Population Map"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" /> 
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dark:bg-slate-800">
                    <div className="p-4 bg-slate-50 rounded-md">
                      <h3 className="font-medium mb-2">Severity</h3>
                      <p className="text-sm">{properties.severitydata.severitytext}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-md dark:bg-slate-800">
                      <h3 className="font-medium mb-2">Alert Scores</h3>
                      <div className="text-sm space-y-1">
                        <p>Overall: {properties.alertscore}</p>
                        <p>Episode: {properties.episodealertscore}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-md dark:bg-slate-800">
                    <h3 className="font-medium mb-2">Affected Countries</h3>
                    <div className="flex flex-wrap gap-2">
                      {properties.affectedcountries.map((country, index) => (
                        <Badge key={index} variant="outline">
                          {country.countryname} ({country.iso3})
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-md dark:bg-slate-800">
                    <h3 className="font-medium mb-2">External Links</h3>
                    <div className="space-y-2 text-sm">
                      <a href={properties.url.report} className="text-blue-600 hover:underline block">
                        Official Report
                      </a>
                      <a href={properties.url.media} className="text-blue-600 hover:underline block">
                        Media Coverage
                      </a>
                      <a href={properties.url.geometry} className="text-blue-600 hover:underline block">
                        Geometry Data
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}