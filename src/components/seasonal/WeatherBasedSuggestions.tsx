'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Season } from '@prisma/client';
import { cn } from '@/lib/utils';
import {
  Cloud,
  CloudRain,
  Sun,
  Snowflake,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  MapPin,
  Lightbulb
} from 'lucide-react';

interface WeatherCondition {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  forecast: {
    tomorrow: { temp: number; condition: string };
    nextWeek: { avgTemp: number; trend: 'warming' | 'cooling' | 'stable' };
  };
}

interface Quilt {
  id: string;
  name: string;
  itemNumber: number;
  season: Season;
  weightGrams: number;
  fillMaterial: string;
  color: string;
  currentStatus: string;
  usagePeriods?: {
    temperature?: number | null;
    humidity?: number | null;
    satisfactionRating?: number | null;
    seasonUsed?: string | null;
  }[];
}

interface WeatherBasedSuggestionsProps {
  quilts: Quilt[];
  currentWeather?: WeatherCondition;
  location?: string;
}

// Mock weather data generator
const generateMockWeather = (): WeatherCondition => {
  const conditions: WeatherCondition['condition'][] = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  let baseTemp = 20;
  if (randomCondition === 'snowy') baseTemp = -2;
  else if (randomCondition === 'rainy') baseTemp = 12;
  else if (randomCondition === 'sunny') baseTemp = 25;
  
  return {
    temperature: baseTemp + (Math.random() - 0.5) * 10,
    humidity: 40 + Math.random() * 40,
    windSpeed: 5 + Math.random() * 20,
    pressure: 1000 + Math.random() * 30,
    condition: randomCondition,
    forecast: {
      tomorrow: {
        temp: baseTemp + (Math.random() - 0.5) * 5,
        condition: Math.random() > 0.7 ? conditions[Math.floor(Math.random() * conditions.length)] : randomCondition,
      },
      nextWeek: {
        avgTemp: baseTemp + (Math.random() - 0.5) * 8,
        trend: Math.random() > 0.6 ? 'warming' : Math.random() > 0.3 ? 'cooling' : 'stable',
      },
    },
  };
};

const CONDITION_ICONS = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: Snowflake,
  windy: Wind,
};

const CONDITION_COLORS = {
  sunny: 'text-yellow-600 bg-yellow-100',
  cloudy: 'text-gray-600 bg-gray-100',
  rainy: 'text-blue-600 bg-blue-100',
  snowy: 'text-blue-800 bg-blue-200',
  windy: 'text-green-600 bg-green-100',
};

export function WeatherBasedSuggestions({ 
  quilts, 
  currentWeather = generateMockWeather(),
  location = "Your Location"
}: WeatherBasedSuggestionsProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Refresh weather data every 30 seconds for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Generate suggestions based on weather
  const generateSuggestions = () => {
    const suggestions: {
      type: 'immediate' | 'planning' | 'maintenance';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      quilts?: Quilt[];
      action?: string;
    }[] = [];
    
    const { temperature, humidity, condition, forecast } = currentWeather;
    const availableQuilts = quilts.filter(q => q.currentStatus === 'AVAILABLE');
    
    // Temperature-based suggestions
    if (temperature < 5) {
      const heavyQuilts = availableQuilts.filter(q => q.weightGrams > 1800);
      suggestions.push({
        type: 'immediate',
        priority: 'high',
        title: 'Very Cold Weather Alert',
        description: `Temperature is ${Math.round(temperature)}°C. Consider using your heaviest quilts for maximum warmth.`,
        quilts: heavyQuilts.slice(0, 2),
        action: 'Switch to heavy quilt',
      });
    } else if (temperature > 28) {
      const lightQuilts = availableQuilts.filter(q => q.weightGrams < 800);
      suggestions.push({
        type: 'immediate',
        priority: 'high',
        title: 'Hot Weather Advisory',
        description: `Temperature is ${Math.round(temperature)}°C. Light quilts or just a sheet might be more comfortable.`,
        quilts: lightQuilts.slice(0, 2),
        action: 'Switch to light quilt',
      });
    }
    
    // Humidity-based suggestions
    if (humidity > 75) {
      const breathableQuilts = availableQuilts.filter(q => 
        q.fillMaterial.toLowerCase().includes('cotton') || 
        q.fillMaterial.toLowerCase().includes('bamboo')
      );
      suggestions.push({
        type: 'immediate',
        priority: 'medium',
        title: 'High Humidity Detected',
        description: `Humidity is ${Math.round(humidity)}%. Breathable materials like cotton or bamboo are recommended.`,
        quilts: breathableQuilts.slice(0, 2),
        action: 'Use breathable quilt',
      });
    }
    
    // Condition-specific suggestions
    if (condition === 'rainy') {
      suggestions.push({
        type: 'maintenance',
        priority: 'medium',
        title: 'Rainy Weather Precautions',
        description: 'High moisture in the air. Ensure quilts are properly stored and consider using moisture-resistant materials.',
        action: 'Check storage conditions',
      });
    }
    
    if (condition === 'snowy') {
      const winterQuilts = availableQuilts.filter(q => q.season === 'WINTER');
      suggestions.push({
        type: 'immediate',
        priority: 'high',
        title: 'Snow Weather - Winter Quilts Recommended',
        description: 'Snowy conditions call for your warmest winter quilts. Down-filled options provide excellent insulation.',
        quilts: winterQuilts.slice(0, 3),
        action: 'Use winter quilt',
      });
    }
    
    // Forecast-based planning
    const tempDiff = forecast.tomorrow.temp - temperature;
    if (Math.abs(tempDiff) > 5) {
      suggestions.push({
        type: 'planning',
        priority: 'low',
        title: 'Temperature Change Tomorrow',
        description: `Tomorrow will be ${tempDiff > 0 ? 'warmer' : 'cooler'} by ${Math.abs(Math.round(tempDiff))}°C. Consider preparing a different quilt.`,
        action: 'Plan ahead',
      });
    }
    
    if (forecast.nextWeek.trend !== 'stable') {
      const trendQuilts = forecast.nextWeek.trend === 'warming' 
        ? availableQuilts.filter(q => q.weightGrams < 1200)
        : availableQuilts.filter(q => q.weightGrams > 1200);
      
      suggestions.push({
        type: 'planning',
        priority: 'low',
        title: `${forecast.nextWeek.trend === 'warming' ? 'Warming' : 'Cooling'} Trend Next Week`,
        description: `Weather is trending ${forecast.nextWeek.trend}. You might want to prepare ${forecast.nextWeek.trend === 'warming' ? 'lighter' : 'heavier'} quilts.`,
        quilts: trendQuilts.slice(0, 2),
        action: 'Prepare for trend',
      });
    }
    
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };
  
  const suggestions = generateSuggestions();
  const ConditionIcon = CONDITION_ICONS[currentWeather.condition];
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'immediate': return AlertTriangle;
      case 'planning': return Calendar;
      case 'maintenance': return Eye;
      default: return Lightbulb;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Current Weather Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ConditionIcon className="w-5 h-5" />
              <span>Weather Conditions</span>
            </div>
            <Badge className={cn('text-xs', CONDITION_COLORS[currentWeather.condition])}>
              {currentWeather.condition}
            </Badge>
          </CardTitle>
          <CardDescription>
            Current conditions in {location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-red-500" />
              <div>
                <div className="font-medium">{Math.round(currentWeather.temperature)}°C</div>
                <div className="text-xs text-gray-500">Temperature</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-medium">{Math.round(currentWeather.humidity)}%</div>
                <div className="text-xs text-gray-500">Humidity</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">{Math.round(currentWeather.windSpeed)} km/h</div>
                <div className="text-xs text-gray-500">Wind Speed</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-purple-500" />
              <div>
                <div className="font-medium">{Math.round(currentWeather.pressure)} hPa</div>
                <div className="text-xs text-gray-500">Pressure</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Forecast</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Tomorrow</span>
                <Badge variant="outline" className="text-xs">
                  {currentWeather.forecast.tomorrow.condition}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span className="text-lg font-bold">
                  {Math.round(currentWeather.forecast.tomorrow.temp)}°C
                </span>
                {currentWeather.forecast.tomorrow.temp > currentWeather.temperature ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Next Week</span>
                <Badge variant="outline" className="text-xs">
                  {currentWeather.forecast.nextWeek.trend}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span className="text-lg font-bold">
                  {Math.round(currentWeather.forecast.nextWeek.avgTemp)}°C
                </span>
                {currentWeather.forecast.nextWeek.trend === 'warming' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : currentWeather.forecast.nextWeek.trend === 'cooling' ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : (
                  <div className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Weather-Based Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>Smart Suggestions</span>
          </CardTitle>
          <CardDescription>
            Personalized quilt recommendations based on current and forecasted weather
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No specific suggestions for current conditions</p>
              <p className="text-sm">Weather conditions are optimal for any quilt choice</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => {
                const TypeIcon = getTypeIcon(suggestion.type);
                return (
                  <Alert key={index} className="relative">
                    <div className="flex items-start space-x-3">
                      <TypeIcon className="w-4 h-4 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge className={cn('text-xs', getPriorityColor(suggestion.priority))}>
                              {suggestion.priority} priority
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.type}
                            </Badge>
                          </div>
                        </div>
                        <AlertDescription className="text-sm">
                          {suggestion.description}
                        </AlertDescription>
                        
                        {suggestion.quilts && suggestion.quilts.length > 0 && (
                          <div className="space-y-2">
                            <Separator />
                            <div>
                              <h5 className="text-xs font-medium text-gray-700 mb-2">Recommended Quilts:</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {suggestion.quilts.map(quilt => (
                                  <div key={quilt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                                    <div>
                                      <div className="font-medium">#{quilt.itemNumber} {quilt.name}</div>
                                      <div className="text-gray-500">{quilt.fillMaterial} • {quilt.weightGrams}g</div>
                                    </div>
                                    <Button size="sm" variant="outline" className="text-xs h-6">
                                      Use
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {suggestion.action && (
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline">
                              {suggestion.action}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="flex items-center space-x-2"
        >
          <Cloud className="w-4 h-4" />
          <span>Refresh Weather Data</span>
        </Button>
      </div>
    </div>
  );
}