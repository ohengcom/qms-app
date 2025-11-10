/**
 * Weather Widget Component
 *
 * Displays current weather and quilt recommendations
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { formatTemperature, getTemperatureDescription } from '@/lib/weather-service';
import type { CurrentWeather, QuiltRecommendation } from '@/types/weather';

interface WeatherWidgetProps {
  className?: string;
  showRecommendations?: boolean;
}

export function WeatherWidget({ className, showRecommendations = true }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [recommendations, setRecommendations] = useState<QuiltRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data
  const fetchWeatherData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/weather');
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeather(data.current);

      if (showRecommendations && data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      setError('获取天气数据失败');
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [showRecommendations]);

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.includes('01')) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (iconCode.includes('02') || iconCode.includes('03'))
      return <Cloud className="w-8 h-8 text-gray-500" />;
    if (iconCode.includes('09') || iconCode.includes('10'))
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (iconCode.includes('13')) return <Snowflake className="w-8 h-8 text-blue-200" />;
    return <Cloud className="w-8 h-8 text-gray-500" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            天气信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            天气信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchWeatherData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span>北京天气</span>
          </div>
          <Button onClick={fetchWeatherData} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {weather.icon ? (
              getWeatherIcon(weather.icon)
            ) : (
              <Cloud className="w-8 h-8 text-gray-400" />
            )}
            <div>
              <div className="text-2xl font-bold">{formatTemperature(weather.temperature)}</div>
              <div className="text-sm text-gray-600">
                体感 {formatTemperature(weather.feelsLike)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{weather.description || '未知'}</div>
            <div className="text-xs text-gray-500">
              {getTemperatureDescription(weather.temperature)}
            </div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-xs text-gray-500">湿度</div>
              <div className="font-medium">{weather.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500">风速</div>
              <div className="font-medium">{weather.windSpeed} m/s</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-red-500" />
            <div>
              <div className="text-xs text-gray-500">气压</div>
              <div className="font-medium">{weather.pressure} hPa</div>
            </div>
          </div>
        </div>

        {/* Quilt Recommendations */}
        {showRecommendations && recommendations.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>🛏️</span>
              被子推荐
            </h4>
            <div className="space-y-2">
              {recommendations.map(rec => (
                <div
                  key={rec.quiltId}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{rec.quiltName}</span>
                      <Badge
                        variant="secondary"
                        className={`${getConfidenceColor(rec.confidence)} text-white text-xs`}
                      >
                        {Math.round(rec.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{rec.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-400 text-center">数据来源：Open-Meteo</div>
      </CardContent>
    </Card>
  );
}
