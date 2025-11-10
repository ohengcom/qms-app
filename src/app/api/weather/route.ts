/**
 * Weather API Route
 *
 * Fetches current weather and provides quilt recommendations
 */

import { NextResponse } from 'next/server';
import { getCurrentWeather, getWeatherForecast } from '@/lib/weather-service';
import { recommendQuilts } from '@/lib/quilt-recommendation';
import { quiltRepository } from '@/lib/repositories/quilt.repository';

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
    const includeRecommendations = searchParams.get('recommendations') !== 'false';

    // Validate parameters
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: 'Invalid latitude or longitude' }, { status: 400 });
    }

    // Fetch current weather
    const currentWeather = await getCurrentWeather(latitude, longitude);

    // Fetch forecast
    const forecast = await getWeatherForecast(latitude, longitude);

    // Get quilt recommendations if requested
    let recommendations: any[] = [];
    if (includeRecommendations) {
      try {
        const quilts = await quiltRepository.findAll({});
        // Map quilts to the format expected by recommendQuilts
        const quiltData = quilts.map(q => ({
          id: q.id,
          name: q.name,
          type: q.fillMaterial || '',
          season: q.season,
          status: q.currentStatus,
        }));
        recommendations = await recommendQuilts(currentWeather, quiltData);
      } catch (error) {
        console.error('Failed to get quilt recommendations:', error);
        // Continue without recommendations
      }
    }

    return NextResponse.json({
      success: true,
      current: currentWeather,
      forecast,
      recommendations,
      location: {
        name: locationName,
        latitude,
        longitude,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch weather data',
      },
      { status: 500 }
    );
  }
}
