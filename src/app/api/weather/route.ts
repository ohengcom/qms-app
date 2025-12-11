/**
 * Weather API Route
 *
 * Fetches current weather and forecast data
 */

import { NextResponse } from 'next/server';
import { getCurrentWeather, getWeatherForecast } from '@/lib/weather-service';

// Default location: Shanghai, China
const DEFAULT_LATITUDE = 31.2304;
const DEFAULT_LONGITUDE = 121.4737;
const DEFAULT_LOCATION_NAME = '上海';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('lat') || String(DEFAULT_LATITUDE));
    const longitude = parseFloat(searchParams.get('lon') || String(DEFAULT_LONGITUDE));
    const locationName = searchParams.get('location') || DEFAULT_LOCATION_NAME;

    // Validate parameters
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: 'Invalid latitude or longitude' }, { status: 400 });
    }

    // Fetch current weather
    const currentWeather = await getCurrentWeather(latitude, longitude);

    // Fetch forecast
    const forecast = await getWeatherForecast(latitude, longitude);

    return NextResponse.json({
      success: true,
      current: currentWeather,
      forecast,
      location: {
        name: locationName,
        latitude,
        longitude,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch weather data',
      },
      { status: 500 }
    );
  }
}
