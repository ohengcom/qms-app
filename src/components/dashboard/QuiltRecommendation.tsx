/**
 * Quilt Recommendation Component
 *
 * Displays weather-based quilt recommendations with 7-day forecast
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
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  formatTemperature,
  type CurrentWeather,
  type WeatherForecast,
} from '@/lib/weather-service';
import type { QuiltRecommendation } from '@/lib/quilt-recommendation';

interface QuiltRecommendationProps {
  className?: string;
}

export function QuiltRecommendation({ className }: QuiltRecommendationProps) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [recommendations, setRecommendations] = useState<QuiltRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather and recommendations
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/weather?recommendations=true');
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeather(data.current);
      setForecast(data.forecast || []);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError('获取天气数据失败');
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getWeatherIcon = (iconCode: string, size: string = 'w-5 h-5') => {
    if (iconCode.includes('01')) return <Sun className={`${size} text-yellow-500`} />;
    if (iconCode.includes('02') || iconCode.includes('03'))
      return <Cloud className={`${size} text-gray-500`} />;
    if (iconCode.includes('09') || iconCode.includes('10'))
      return <CloudRain className={`${size} text-blue-500`} />;
    if (iconCode.includes('13')) return <Snowflake className={`${size} text-blue-200`} />;
    return <Cloud className={`${size} text-gray-500`} />;
  };

  const getTempTrend = (current: number, next: number) => {
    const diff = next - current;
    if (Math.abs(diff) < 2) return <Minus className="w-4 h-4 text-gray-400" />;
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <TrendingDown className="w-4 h-4 text-blue-500" />;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="bg-green-500 text-white">强烈推荐</Badge>;
    }
    if (confidence >= 0.6) {
      return <Badge className="bg-yellow-500 text-white">推荐</Badge>;
    }
    return <Badge className="bg-orange-500 text-white">可选</Badge>;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            智能换被建议
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
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
            智能换被建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline" size="sm">
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            智能换被建议
          </CardTitle>
          <Button onClick={fetchData} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Weather Summary */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weather.icon, 'w-10 h-10')}
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTemperature(weather.temperature)}
              </div>
              <div className="text-sm text-gray-600">
                体感 {formatTemperature(weather.feelsLike)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{weather.description}</div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                {weather.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3" />
                {weather.windSpeed} m/s
              </span>
            </div>
          </div>
        </div>

        {/* 7-Day Temperature Trend */}
        {forecast.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">未来7天温度趋势</h4>
            <div className="grid grid-cols-7 gap-2">
              {forecast.map((day, index) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' });
                const isToday = index === 0;

                return (
                  <div
                    key={day.date}
                    className={`text-center p-2 rounded-lg ${
                      isToday ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {isToday ? '今天' : dayName}
                    </div>
                    <div className="flex justify-center mb-1">
                      {getWeatherIcon(day.icon, 'w-6 h-6')}
                    </div>
                    <div className="text-xs font-semibold text-gray-900">
                      {Math.round(day.maxTemp)}°
                    </div>
                    <div className="text-xs text-gray-500">{Math.round(day.minTemp)}°</div>
                    {index < forecast.length - 1 && (
                      <div className="flex justify-center mt-1">
                        {getTempTrend(day.avgTemp, forecast[index + 1].avgTemp)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quilt Recommendations */}
        {recommendations.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">推荐被子</h4>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.quiltId}
                  className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{rec.quiltName}</div>
                        <div className="text-xs text-gray-500">
                          {rec.quiltType} · {rec.season}
                        </div>
                      </div>
                    </div>
                    {getConfidenceBadge(rec.confidence)}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Thermometer
                          key={i}
                          className={`w-3 h-3 ${
                            i < rec.warmthLevel ? 'text-red-500 fill-red-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">保暖等级</span>
                  </div>
                  <p className="text-sm text-gray-700">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Cloud className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">暂无可推荐的被子</p>
            <p className="text-xs mt-1">请先添加被子到您的收藏中</p>
          </div>
        )}

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">温馨提示</p>
              <ul className="space-y-0.5">
                <li>• 推荐基于当前温度、体感温度和湿度综合计算</li>
                <li>• 温度变化超过5°C时会收到通知提醒</li>
                <li>• 建议根据个人体质和睡眠习惯调整选择</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
