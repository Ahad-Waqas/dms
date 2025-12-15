// app/api/earthquakes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { GeoJSONFeature } from '@/types/geoJson';
import { AftershocksResponse } from '@/types/aftershocks';


export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const count = searchParams.get('earthquake_id') || '20';
    // console.log('Earthquake ID:', count);
    
    // Make request to the earthquakes API
    const response = await axios.get<AftershocksResponse>(
          `http://localhost:8000/earthquakes/aftershocks/${count}`,
          { 
            // Add proper headers and timeout
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        // console.log('Response from earthquake API:', response.data);
    
    // Validate response data
    // if (!response.data || !Array.isArray(response.data)) {
    //   return NextResponse.json(
    //     { error: 'Invalid data received from earthquake API' },
    //     { status: 500 }
    //   );
    // }
    
    // Process the data if needed
    // console.log('Received earthquake data:', response.data);
    
    // Return the processed data
    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    
    // Handle different error types
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      
      return NextResponse.json(
        { error: message },
        { status }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
}

// Optional: Handle other methods
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}

export const config = {
  runtime: 'edge', // Optional: Use edge runtime for better performance if available in your Next.js version
};