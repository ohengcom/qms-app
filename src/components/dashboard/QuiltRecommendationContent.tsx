/**
 * Quilt Recommendation Content Component
 *
 * Displays weather-based quilt recommendations (content only, no card wrapper)
 */

'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Cloud, RefreshCw, Thermometer } from 'lucide-react';
import type { QuiltRecommendation } from '@/lib/quilt-recommendation';

export function QuiltRecommendationContent() {
  const [recommendations, setRecommendations] = useState<QuiltRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/weather?recommendations=true');
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError('获取推荐数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

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
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchRecommendations} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Cloud className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">暂无可推荐的被子</p>
        <p className="text-sm">请先添加被子到您的收藏中</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">基于当前天气的被子推荐</h3>
        <Button onClick={fetchRecommendations} variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

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
                    key={`warmth-${rec.quiltId}-${i}`}
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
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
    </div>
  );
}
