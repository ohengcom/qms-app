'use client';

import { useQuery } from '@tanstack/react-query';

interface WeatherData {
  location: {
    city: string;
    cityEn: string;
    country: string;
    countryEn: string;
  };
  current: {
    temperature: number | null;
    humidity: number | null;
    weatherCode?: number;
    weather: {
      zh: string;
      en: string;
      icon: string;
    };
    time?: string;
  };
  timezone?: string;
}

// API response type for unified format
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export function useWeather() {
  return useQuery<WeatherData>({
    queryKey: ['weather', 'shanghai'],
    queryFn: async () => {
      const response = await fetch('/api/weather');
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const result: ApiResponse<{ weather: WeatherData }> = await response.json();

      // Handle new unified API response format
      if (result.success && result.data) {
        return result.data.weather || (result.data as unknown as WeatherData);
      }

      // Fallback for old format
      return result as unknown as WeatherData;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
}
