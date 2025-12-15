import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { GeoJSONFeature } from '@/types/geoJson';

export async function GET(request: NextRequest) {
  try {
    // Get and forward all query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString(); // Converts all params to a string

    // Forward request to the backend API with full query
    const response = await axios.get<GeoJSONFeature[]>(
      `http://localhost:8000/earthquakes/?count=20&${queryString}`
    );

    // Validate response
    if (!response.data || !Array.isArray(response.data)) {
      return NextResponse.json(
        { error: 'Invalid data received from earthquake API' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data, { status: 200 });

  } catch (error) {
    console.error('Error fetching earthquake data:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;

      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}

export const config = {
  runtime: 'edge',
};
