/**
 * Weather Data Types
 */

// Re-export weather service types
export type { CurrentWeather, WeatherForecast, TemperatureChange } from '@/lib/weather-service';

// Import for use in interfaces
import type { WeatherForecast as WF } from '@/lib/weather-service';

// Legacy types for backward compatibility
export interface WeatherData {
  success: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  currentTemp: number;
  forecast: WF[];
  timezone: string;
  updatedAt: string;
}

export interface WeatherError {
  success: false;
  error: string;
}

export type WeatherResponse = WeatherData | WeatherError;
