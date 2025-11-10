/**
 * Weather Service
 *
 * Integrates with Open-Meteo API (free, no API key required)
 */

import { dbLogger } from './logger';

// Weather API configuration - Open-Meteo (free)
const WEATHER_API_BASE_URL = 'https://api.open-meteo.com/v1';

// Default location (Beijing, China)
const DEFAULT_LOCATION = {
  lat: 39.9042,
  lon: 116.4074,
  name: '北京',
};

/**
 * Weather data interfaces
 */
export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  pressure: number;
  visibility: number;
  timestamp: Date;
}

export interface WeatherForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

/**
 * Temperature change analysis
 */
export interface TemperatureChange {
  previousTemp: number;
  currentTemp: number;
  change: number;
  isSignificant: boolean;
  trend: 'warming' | 'cooling' | 'stable';
}

/**
 * Fetch current weather data
 */
export async function getCurrentWeather(
  lat: number = DEFAULT_LOCATION.lat,
  lon: number = DEFAULT_LOCATION.lon
): Promise<CurrentWeather> {
  try {
    const url = `${WEATHER_API_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&timezone=Asia/Shanghai`;

    dbLogger.info('Fetching current weather', { lat, lon });

    const response = await fetch(url, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    // Map weather code to description
    const weatherCode = current.weather_code;
    const description = getWeatherDescription(weatherCode);
    const icon = getWeatherIcon(weatherCode);

    const weather: CurrentWeather = {
      temperature: Math.round(current.temperature_2m * 10) / 10,
      feelsLike: Math.round(current.apparent_temperature * 10) / 10,
      humidity: current.relative_humidity_2m,
      description,
      icon,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      pressure: current.surface_pressure,
      visibility: 10000, // Open-Meteo doesn't provide visibility
      timestamp: new Date(),
    };

    return weather;
  } catch (error) {
    dbLogger.error('Failed to fetch current weather', error as Error);
    throw error;
  }
}

/**
 * Map WMO weather code to description (Chinese)
 */
function getWeatherDescription(code: number): string {
  if (code === 0) return '晴朗';
  if (code <= 3) return '多云';
  if (code <= 48) return '雾';
  if (code <= 57) return '毛毛雨';
  if (code <= 67) return '雨';
  if (code <= 77) return '雪';
  if (code <= 82) return '阵雨';
  if (code <= 86) return '阵雪';
  if (code <= 99) return '雷暴';
  return '未知';
}

/**
 * Map WMO weather code to icon code
 */
function getWeatherIcon(code: number): string {
  if (code === 0) return '01d'; // Clear sky
  if (code <= 3) return '02d'; // Partly cloudy
  if (code <= 48) return '50d'; // Fog
  if (code <= 67) return '10d'; // Rain
  if (code <= 77) return '13d'; // Snow
  if (code <= 82) return '09d'; // Shower
  if (code <= 99) return '11d'; // Thunderstorm
  return '02d';
}

/**
 * Fetch weather forecast (7 days)
 */
export async function getWeatherForecast(
  lat: number = DEFAULT_LOCATION.lat,
  lon: number = DEFAULT_LOCATION.lon
): Promise<WeatherForecast[]> {
  try {
    const url = `${WEATHER_API_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,relative_humidity_2m_mean,wind_speed_10m_max&timezone=Asia/Shanghai&forecast_days=7`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const daily = data.daily;

    const forecasts: WeatherForecast[] = daily.time.map((date: string, index: number) => {
      const weatherCode = daily.weather_code[index];
      const minTemp = daily.temperature_2m_min[index];
      const maxTemp = daily.temperature_2m_max[index];
      const avgTemp = (minTemp + maxTemp) / 2;

      return {
        date,
        minTemp: Math.round(minTemp * 10) / 10,
        maxTemp: Math.round(maxTemp * 10) / 10,
        avgTemp: Math.round(avgTemp * 10) / 10,
        description: getWeatherDescription(weatherCode),
        icon: getWeatherIcon(weatherCode),
        humidity: Math.round(daily.relative_humidity_2m_mean?.[index] || 50),
        windSpeed: Math.round((daily.wind_speed_10m_max?.[index] || 0) * 10) / 10,
      };
    });

    return forecasts;
  } catch (error) {
    dbLogger.error('Failed to fetch weather forecast', error as Error);
    throw error;
  }
}

/**
 * Analyze temperature change
 */
export function analyzeTemperatureChange(
  currentTemp: number,
  previousTemp: number
): TemperatureChange {
  const change = currentTemp - previousTemp;
  const absChange = Math.abs(change);
  const isSignificant = absChange > 5;

  let trend: 'warming' | 'cooling' | 'stable';
  if (absChange <= 2) {
    trend = 'stable';
  } else if (change > 0) {
    trend = 'warming';
  } else {
    trend = 'cooling';
  }

  return {
    previousTemp,
    currentTemp,
    change: Math.round(change * 10) / 10,
    isSignificant,
    trend,
  };
}

/**
 * Format temperature for display
 */
export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`;
}

/**
 * Get temperature description in Chinese
 */
export function getTemperatureDescription(temp: number): string {
  if (temp <= 0) return '严寒';
  if (temp <= 10) return '寒冷';
  if (temp <= 20) return '凉爽';
  if (temp <= 25) return '舒适';
  if (temp <= 30) return '温暖';
  if (temp <= 35) return '炎热';
  return '酷热';
}
