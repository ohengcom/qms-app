'use client';

import { useQuery } from '@tanstack/react-query';

interface HistoricalWeatherData {
  date: string;
  temperature: {
    max: number;
    min: number;
  };
  weatherCode: number;
  location: {
    city: string;
    cityEn: string;
  };
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

export function useHistoricalWeather(date: string | null | undefined) {
  return useQuery<HistoricalWeatherData>({
    queryKey: ['weather', 'historical', date],
    queryFn: async () => {
      if (!date) {
        throw new Error('Date is required');
      }

      const response = await fetch(`/api/weather/historical?date=${date}`);

      if (!response.ok) {
        throw new Error('Failed to fetch historical weather data');
      }

      const result: ApiResponse<{ historicalWeather: HistoricalWeatherData }> =
        await response.json();

      // Handle new unified API response format
      if (result.success && result.data) {
        return result.data.historicalWeather || (result.data as unknown as HistoricalWeatherData);
      }

      // Fallback for old format
      return result as unknown as HistoricalWeatherData;
    },
    enabled: !!date,
    staleTime: 86400000, // 24 hours (historical data doesn't change)
    retry: 1,
  });
}
