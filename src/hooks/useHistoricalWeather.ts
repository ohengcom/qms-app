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

      return response.json();
    },
    enabled: !!date,
    staleTime: 86400000, // 24 hours (historical data doesn't change)
    retry: 1,
  });
}
