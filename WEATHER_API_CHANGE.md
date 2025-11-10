# 天气 API 更改说明

## 更改内容

已将天气数据源从 **OpenWeatherMap** 改为 **Open-Meteo**。

## 原因

1. **免费无限制**：Open-Meteo 完全免费，无需 API key
2. **已在使用**：项目中已经使用了 Open-Meteo API
3. **简化配置**：不需要注册和配置 API key
4. **数据质量**：Open-Meteo 提供高质量的气象数据

## 技术细节

### API 端点

- **当前天气**：`https://api.open-meteo.com/v1/forecast?current=...`
- **7天预报**：`https://api.open-meteo.com/v1/forecast?daily=...`

### 数据映射

Open-Meteo 使用 WMO 天气代码，已实现映射函数：

- `getWeatherDescription(code)` - 转换为中文描述
- `getWeatherIcon(code)` - 转换为图标代码

### WMO 天气代码对照表

| 代码范围 | 描述 | 图标 |
| -------- | ---- | ---- |
| 0        | 晴朗 | 01d  |
| 1-3      | 多云 | 02d  |
| 45-48    | 雾   | 50d  |
| 51-67    | 雨   | 10d  |
| 71-77    | 雪   | 13d  |
| 80-82    | 阵雨 | 09d  |
| 95-99    | 雷暴 | 11d  |

## 受影响的文件

- ✅ `src/lib/weather-service.ts` - 更新为使用 Open-Meteo API
- ✅ `src/components/weather/WeatherWidget.tsx` - 更新数据来源说明
- ✅ `.env.example` - 移除 OPENWEATHER_API_KEY 配置

## 功能保持不变

所有天气功能保持不变：

- ✅ 当前天气显示
- ✅ 7天天气预报
- ✅ 温度、湿度、风速等数据
- ✅ 被子推荐算法
- ✅ 天气变化通知

## 测试建议

1. 访问主页查看天气显示
2. 检查7天温度趋势
3. 验证被子推荐功能
4. 测试天气数据刷新

## 优势

- 🚀 无需配置，开箱即用
- 💰 完全免费，无使用限制
- 🌍 全球覆盖，数据准确
- ⚡ 响应快速，稳定可靠
