import { NextResponse } from 'next/server';

// 使用免费的天气 API - Open-Meteo (无需 API key)
// 上海坐标: 31.2304, 121.4737
const SHANGHAI_LAT = 31.2304;
const SHANGHAI_LON = 121.4737;

export async function GET() {
  try {
    // 使用 Open-Meteo API 获取上海天气
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${SHANGHAI_LAT}&longitude=${SHANGHAI_LON}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia/Shanghai`,
      { next: { revalidate: 1800 } } // 缓存30分钟
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    // 天气代码映射
    const weatherCodeMap: Record<number, { zh: string; en: string; icon: string }> = {
      0: { zh: '晴朗', en: 'Clear', icon: '☀️' },
      1: { zh: '大部晴朗', en: 'Mainly Clear', icon: '🌤️' },
      2: { zh: '部分多云', en: 'Partly Cloudy', icon: '⛅' },
      3: { zh: '阴天', en: 'Overcast', icon: '☁️' },
      45: { zh: '有雾', en: 'Foggy', icon: '🌫️' },
      48: { zh: '雾凇', en: 'Rime Fog', icon: '🌫️' },
      51: { zh: '小雨', en: 'Light Drizzle', icon: '🌦️' },
      53: { zh: '中雨', en: 'Moderate Drizzle', icon: '🌧️' },
      55: { zh: '大雨', en: 'Dense Drizzle', icon: '🌧️' },
      61: { zh: '小雨', en: 'Slight Rain', icon: '🌦️' },
      63: { zh: '中雨', en: 'Moderate Rain', icon: '🌧️' },
      65: { zh: '大雨', en: 'Heavy Rain', icon: '🌧️' },
      71: { zh: '小雪', en: 'Slight Snow', icon: '🌨️' },
      73: { zh: '中雪', en: 'Moderate Snow', icon: '❄️' },
      75: { zh: '大雪', en: 'Heavy Snow', icon: '❄️' },
      80: { zh: '阵雨', en: 'Slight Showers', icon: '🌦️' },
      81: { zh: '中阵雨', en: 'Moderate Showers', icon: '🌧️' },
      82: { zh: '大阵雨', en: 'Violent Showers', icon: '⛈️' },
      95: { zh: '雷暴', en: 'Thunderstorm', icon: '⛈️' },
      96: { zh: '雷暴伴冰雹', en: 'Thunderstorm with Hail', icon: '⛈️' },
      99: { zh: '强雷暴伴冰雹', en: 'Heavy Thunderstorm with Hail', icon: '⛈️' },
    };

    const weatherCode = data.current.weather_code;
    const weatherInfo = weatherCodeMap[weatherCode] || {
      zh: '未知',
      en: 'Unknown',
      icon: '🌡️',
    };

    return NextResponse.json({
      location: {
        city: '上海',
        cityEn: 'Shanghai',
        country: '中国',
        countryEn: 'China',
      },
      current: {
        temperature: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        weatherCode: weatherCode,
        weather: weatherInfo,
        time: data.current.time,
      },
      timezone: data.timezone,
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch weather data',
        location: {
          city: '上海',
          cityEn: 'Shanghai',
          country: '中国',
          countryEn: 'China',
        },
        current: {
          temperature: null,
          humidity: null,
          weather: { zh: '无法获取', en: 'Unavailable', icon: '🌡️' },
        },
      },
      { status: 500 }
    );
  }
}
