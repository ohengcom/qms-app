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

export function useWeather() {
  return useQuery<WeatherData>({
    queryKey: ['weather', 'shanghai'],
    queryFn: async () => {
      const response = await fetch('/api/weather');
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
}
