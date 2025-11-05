import { NextResponse, NextRequest } from 'next/server';

// 上海坐标: 31.2304, 121.4737
const SHANGHAI_LAT = 31.2304;
const SHANGHAI_LON = 121.4737;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // 验证日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // 使用 Open-Meteo Historical Weather API
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${SHANGHAI_LAT}&longitude=${SHANGHAI_LON}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia/Shanghai`,
      { next: { revalidate: 86400 } } // 缓存24小时（历史数据不会改变）
    );

    if (!response.ok) {
      throw new Error('Failed to fetch historical weather data');
    }

    const data = await response.json();

    // 检查是否有数据
    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      return NextResponse.json({ error: 'No data available for this date' }, { status: 404 });
    }

    return NextResponse.json({
      date: data.daily.time[0],
      temperature: {
        max: Math.round(data.daily.temperature_2m_max[0]),
        min: Math.round(data.daily.temperature_2m_min[0]),
      },
      weatherCode: data.daily.weather_code[0],
      location: {
        city: '上海',
        cityEn: 'Shanghai',
      },
    });
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch historical weather data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
