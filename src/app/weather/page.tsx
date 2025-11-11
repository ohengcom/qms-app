/**
 * Weather Page
 *
 * Displays weather information and quilt recommendations
 */

'use client';

import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { PageTransition } from '@/components/motion/PageTransition';

export default function WeatherPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Weather Widget */}
        <div className="max-w-2xl">
          <WeatherWidget showRecommendations={true} />
        </div>

        {/* Information Card */}
        <div className="max-w-2xl bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h3 className="font-medium mb-2">💡 温馨提示</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
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
