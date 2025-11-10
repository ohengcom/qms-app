/**
 * Quilt Recommendation Algorithm
 */

import { dbLogger } from './logger';
import type { CurrentWeather } from './weather-service';

export interface QuiltRecommendation {
  quiltId: string;
  quiltName: string;
  quiltType: string;
  season: string;
  warmthLevel: number;
  confidence: number;
  reason: string;
  weatherContext: {
    currentTemp: number;
    feelsLike: number;
    humidity: number;
    description: string;
  };
}

/**
 * Temperature ranges for different quilt types
 */
const QUILT_WARMTH_CONFIG = {
  summer: { min: 25, max: 40, optimal: 30 },
  spring: { min: 15, max: 28, optimal: 22 },
  winter: { min: -10, max: 18, optimal: 10 },
  down: { min: -20, max: 15, optimal: 5 },
};

const WARMTH_LEVELS = {
  summer: 1,
  spring: 3,
  winter: 4,
  down: 5,
};

/**
 * Calculate quilt suitability score
 */
function calculateSuitabilityScore(
  temperature: number,
  feelsLike: number,
  humidity: number,
  quiltType: keyof typeof QUILT_WARMTH_CONFIG
): number {
  const config = QUILT_WARMTH_CONFIG[quiltType];
  const effectiveTemp = (temperature + feelsLike) / 2;

  let score = 0;

  if (effectiveTemp >= config.min && effectiveTemp <= config.max) {
    const distanceFromOptimal = Math.abs(effectiveTemp - config.optimal);
    const maxDistance = Math.max(config.optimal - config.min, config.max - config.optimal);
    score = 1 - distanceFromOptimal / maxDistance;
  } else if (effectiveTemp < config.min) {
    const distance = config.min - effectiveTemp;
    score = Math.max(0, 0.3 - distance / 10);
  } else {
    const distance = effectiveTemp - config.max;
    score = Math.max(0, 0.3 - distance / 10);
  }

  // Adjust for humidity
  if (humidity > 70) {
    const humidityFactor = (humidity - 70) / 30;
    if (quiltType === 'summer' || quiltType === 'spring') {
      score += humidityFactor * 0.2;
    } else {
      score -= humidityFactor * 0.2;
    }
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Generate recommendation reason
 */
function generateRecommendationReason(
  quiltType: string,
  temperature: number,
  feelsLike: number,
  score: number
): string {
  const tempDesc =
    temperature <= 10 ? '寒冷' : temperature <= 20 ? '凉爽' : temperature <= 25 ? '舒适' : '温暖';
  let reason = `当前${tempDesc}（${temperature.toFixed(1)}°C）`;

  if (score > 0.8) {
    reason += `，${quiltType}非常适合当前天气`;
  } else if (score > 0.6) {
    reason += `，${quiltType}比较适合当前天气`;
  } else {
    reason += `，${quiltType}勉强适合当前天气`;
  }

  return reason;
}

/**
 * Recommend quilts based on weather
 */
export async function recommendQuilts(
  weather: CurrentWeather,
  availableQuilts: Array<{
    id: string;
    name: string;
    type: string;
    season: string;
    status: string;
  }>
): Promise<QuiltRecommendation[]> {
  try {
    const recommendations: QuiltRecommendation[] = [];

    const availableForRecommendation = availableQuilts.filter(
      quilt => quilt.status === 'AVAILABLE' || quilt.status === 'STORAGE'
    );

    for (const quilt of availableForRecommendation) {
      let quiltWarmthType: keyof typeof QUILT_WARMTH_CONFIG = 'spring';

      // Determine quilt type from season
      switch (quilt.season.toLowerCase()) {
        case 'summer':
        case '夏季':
          quiltWarmthType = 'summer';
          break;
        case 'winter':
        case '冬季':
          quiltWarmthType = 'winter';
          break;
        default:
          quiltWarmthType = 'spring';
      }

      const confidence = calculateSuitabilityScore(
        weather.temperature,
        weather.feelsLike,
        weather.humidity,
        quiltWarmthType
      );

      if (confidence > 0.2) {
        recommendations.push({
          quiltId: quilt.id,
          quiltName: quilt.name,
          quiltType: quilt.type,
          season: quilt.season,
          warmthLevel: WARMTH_LEVELS[quiltWarmthType],
          confidence,
          reason: generateRecommendationReason(
            quilt.name,
            weather.temperature,
            weather.feelsLike,
            confidence
          ),
          weatherContext: {
            currentTemp: weather.temperature,
            feelsLike: weather.feelsLike,
            humidity: weather.humidity,
            description: weather.description,
          },
        });
      }
    }

    recommendations.sort((a, b) => b.confidence - a.confidence);
    return recommendations.slice(0, 3);
  } catch (error) {
    dbLogger.error('Failed to generate recommendations', error as Error);
    throw error;
  }
}

/**
 * Check if weather change is significant
 */
export function shouldNotifyWeatherChange(
  currentTemp: number,
  previousTemp: number,
  threshold: number = 5
): boolean {
  return Math.abs(currentTemp - previousTemp) >= threshold;
}
