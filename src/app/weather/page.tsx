/**
 * Weather Page
 *
 * Displays weather information and quilt recommendations
 */

'use client';

import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { PageTransition } from '@/components/motion/PageTransition';
import { Cloud } from 'lucide-react';

export default function WeatherPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">天气与被子推荐</h1>
          </div>
          <p className="text-gray-600">根据当前天气情况，为您推荐最适合的被子</p>
        </div>

        {/* Weather Widget */}
        <div className="max-w-2xl">
          <WeatherWidget showRecommendations={true} />
        </div>

        {/* Information Card */}
        <div className="max-w-2xl bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 温馨提示</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 天气数据每10分钟自动更新一次</li>
            <li>• 被子推荐基于当前温度、体感温度和湿度</li>
            <li>• 温度变化超过5°C时会收到通知提醒</li>
            <li>• 点击刷新按钮可手动更新天气数据</li>
          </ul>
        </div>
      </div>
    </PageTransition>
  );
}
