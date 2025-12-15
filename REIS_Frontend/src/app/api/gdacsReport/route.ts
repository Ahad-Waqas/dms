import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const gdacsId = searchParams.get('gdacs_id');
    const type = searchParams.get('type');
    const userId = searchParams.get('user_id');

    // Validation
    if (!gdacsId || !type || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: gdacs_id, type, and user_id are required' },
        { status: 400 }
      );
    }

    // Forward request to the backend API
    const response = await axios.post(
      `http://localhost:8000/report/?gdacs_id=${gdacsId}&eventtype=${type}&user_id=${userId}`
    );

    // Return the data
    return NextResponse.json(response.data, { status: 200 });

  } catch (error) {
    console.error('Error fetching disaster data:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;

      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json(
      { error: 'Failed to fetch disaster data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const gdacsId = searchParams.get('gdacs_id');
    const type = searchParams.get('type');
    const userId = searchParams.get('user_id');

    // Validation
    if (!gdacsId || !type || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: gdacs_id, type, and user_id are required' },
        { status: 400 }
      );
    }

    // Forward request to the backend API
    const response = await axios.get(
      `http://localhost:8000/report/?gdacs_id=${gdacsId}&eventtype=${type}&user_id=${userId}`
    );

    // Return the data
    return NextResponse.json(response.data, { status: 200 });

  } catch (error) {
    console.error('Error fetching disaster data:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;

      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json(
      { error: 'Failed to fetch disaster data' },
      { status: 500 }
    );
  }
}

export const config = {
  runtime: 'edge',
};