'use client';

import { useHistoricalWeather } from '@/hooks/useHistoricalWeather';
import { useLanguage } from '@/lib/language-provider';
import { Thermometer, Loader2 } from 'lucide-react';

interface TemperatureDisplayProps {
  date: Date | string | null | undefined;
  compact?: boolean;
}

export function TemperatureDisplay({ date, compact = false }: TemperatureDisplayProps) {
  const { language } = useLanguage();

  // Convert date to YYYY-MM-DD format
  const dateString = date ? new Date(date).toISOString().split('T')[0] : null;

  const { data, isLoading, error } = useHistoricalWeather(dateString);

  if (!dateString) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1 text-xs text-gray-400">
        <Loader2 className="w-3 h-3 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-600">
        <Thermometer className="w-3 h-3 text-orange-500" />
        {data.temperature.max}°/{data.temperature.min}°
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 bg-orange-50 border border-orange-200 rounded text-xs">
      <Thermometer className="w-3.5 h-3.5 text-orange-500" />
      <div className="flex flex-col">
        <span className="text-gray-700">
          {language === 'zh' ? '最高' : 'High'}:{' '}
          <span className="font-medium text-orange-600">{data.temperature.max}°C</span>
        </span>
        <span className="text-gray-700">
          {language === 'zh' ? '最低' : 'Low'}:{' '}
          <span className="font-medium text-blue-600">{data.temperature.min}°C</span>
        </span>
      </div>
    </div>
  );
}
