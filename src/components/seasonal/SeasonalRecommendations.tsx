'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Season } from '@prisma/client';
import { cn } from '@/lib/utils';
import {
  Snowflake,
  Sun,
  Leaf,
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  Calendar,
  TrendingUp,
  Star,
  MapPin,
  Clock,
  Target,
  Lightbulb,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface Quilt {
  id: string;
  name: string;
  itemNumber: number;
  season: Season;
  weightGrams: number;
  fillMaterial: string;
  color: string;
  location: string;
  currentStatus: string;
  usagePeriods?: {
    startDate: Date;
    endDate?: Date | null;
    seasonUsed?: string | null;
    satisfactionRating?: number | null;
    temperature?: number | null;
  }[];
}

interface WeatherData {
  temperature: number;
  humidity: number;
  season: string;
  description: string;
  windSpeed?: number;
  pressure?: number;
}

interface SeasonalRecommendationsProps {
  quilts: Quilt[];
  currentWeather?: WeatherData;
  userPreferences?: {
    preferredTemperature?: number;
    sleepStyle?: 'hot' | 'cold' | 'neutral';
    materialPreferences?: string[];
  };
}

const SEASON_ICONS = {
  WINTER: Snowflake,
  SPRING_AUTUMN: Leaf,
  SUMMER: Sun,
};

const SEASON_COLORS = {
  WINTER: 'text-blue-600 bg-blue-100',
  SPRING_AUTUMN: 'text-green-600 bg-green-100',
  SUMMER: 'text-orange-600 bg-orange-100',
};

const SEASON_NAMES = {
  WINTER: 'Winter',
  SPRING_AUTUMN: 'Spring/Autumn',
  SUMMER: 'Summer',
};

// Mock weather data for demonstration
const getMockWeatherData = (): WeatherData => {
  const currentMonth = new Date().getMonth();
  
  if (currentMonth >= 11 || currentMonth <= 2) {
    return {
      temperature: 5,
      humidity: 65,
      season: 'WINTER',
      description: 'Cold and dry',
      windSpeed: 15,
      pressure: 1013,
    };
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    return {
      temperature: 28,
      humidity: 70,
      season: 'SUMMER',
      description: 'Hot and humid',
      windSpeed: 8,
      pressure: 1015,
    };
  } else {
    return {
      temperature: 18,
      humidity: 55,
      season: 'SPRING_AUTUMN',
      description: 'Mild and comfortable',
      windSpeed: 12,
      pressure: 1012,
    };
  }
};

export function SeasonalRecommendations({ 
  quilts, 
  currentWeather = getMockWeatherData(),
  userPreferences = {}
}: SeasonalRecommendationsProps) {
  const [selectedRecommendation, setSelectedRecommendation] = useState<Quilt | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const recommendations = useMemo(() => {
    const currentSeason = currentWeather.season as Season;
    const temp = currentWeather.temperature;
    
    // Score quilts based on multiple factors
    const scoredQuilts = quilts
      .filter(quilt => quilt.currentStatus === 'AVAILABLE')
      .map(quilt => {
        let score = 0;
        let reasons: string[] = [];
        
        // Season match (40% weight)
        if (quilt.season === currentSeason) {
          score += 40;
          reasons.push(`Perfect for ${SEASON_NAMES[currentSeason].toLowerCase()}`);
        } else if (
          (currentSeason === 'SPRING_AUTUMN' && quilt.season === 'WINTER' && temp < 15) ||
          (currentSeason === 'SPRING_AUTUMN' && quilt.season === 'SUMMER' && temp > 20)
        ) {
          score += 25;
          reasons.push('Good transitional choice');
        }
        
        // Temperature appropriateness (30% weight)
        if (temp < 10 && quilt.weightGrams > 1500) {
          score += 30;
          reasons.push('Heavy weight for cold weather');
        } else if (temp > 25 && quilt.weightGrams < 1000) {
          score += 30;
          reasons.push('Light weight for warm weather');
        } else if (temp >= 10 && temp <= 25 && quilt.weightGrams >= 1000 && quilt.weightGrams <= 1500) {
          score += 25;
          reasons.push('Medium weight for moderate temperature');
        }
        
        // Historical usage success (20% weight)
        const historicalUsage = quilt.usagePeriods?.filter(period => 
          period.seasonUsed === currentSeason && period.satisfactionRating
        ) || [];
        
        if (historicalUsage.length > 0) {
          const avgSatisfaction = historicalUsage.reduce((sum, period) => 
            sum + (period.satisfactionRating || 0), 0) / historicalUsage.length;
          score += (avgSatisfaction / 5) * 20;
          reasons.push(`${avgSatisfaction.toFixed(1)}/5 satisfaction in similar conditions`);
        }
        
        // Material preferences (10% weight)
        if (userPreferences.materialPreferences?.includes(quilt.fillMaterial)) {
          score += 10;
          reasons.push('Matches your material preference');
        }
        
        // Humidity considerations
        if (currentWeather.humidity > 70 && quilt.fillMaterial.toLowerCase().includes('down')) {
          score -= 5;
          reasons.push('Down may retain moisture in high humidity');
        } else if (currentWeather.humidity < 40 && quilt.fillMaterial.toLowerCase().includes('cotton')) {
          score += 5;
          reasons.push('Cotton breathes well in dry conditions');
        }
        
        return {
          quilt,
          score: Math.max(0, Math.min(100, score)),
          reasons,
          confidence: score > 60 ? 'high' : score > 40 ? 'medium' : 'low',
        };
      })
      .sort((a, b) => b.score - a.score);
    
    return {
      top: scoredQuilts.slice(0, 3),
      all: scoredQuilts,
    };
  }, [quilts, currentWeather, userPreferences]);
  
  const seasonalInsights = useMemo(() => {
    const currentSeason = currentWeather.season as Season;
    const seasonQuilts = quilts.filter(q => q.season === currentSeason);
    const availableSeasonQuilts = seasonQuilts.filter(q => q.currentStatus === 'AVAILABLE');
    
    // Usage patterns for current season
    const seasonUsage = quilts.flatMap(q => 
      q.usagePeriods?.filter(p => p.seasonUsed === currentSeason) || []
    );
    
    const avgSatisfaction = seasonUsage.length > 0
      ? seasonUsage.reduce((sum, p) => sum + (p.satisfactionRating || 0), 0) / seasonUsage.length
      : 0;
    
    // Most used materials in this season
    const materialUsage = seasonUsage.reduce((acc, period) => {
      const quilt = quilts.find(q => q.usagePeriods?.includes(period));
      if (quilt) {
        acc[quilt.fillMaterial] = (acc[quilt.fillMaterial] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const topMaterial = Object.entries(materialUsage)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      totalSeasonQuilts: seasonQuilts.length,
      availableSeasonQuilts: availableSeasonQuilts.length,
      seasonUsageCount: seasonUsage.length,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      topMaterial: topMaterial ? topMaterial[0] : null,
      utilizationRate: seasonQuilts.length > 0 
        ? Math.round((seasonQuilts.length - availableSeasonQuilts.length) / seasonQuilts.length * 100)
        : 0,
    };
  }, [quilts, currentWeather.season]);
  
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const WeatherIcon = currentWeather.season === 'WINTER' ? Snowflake :
                     currentWeather.season === 'SUMMER' ? Sun : 
                     currentWeather.season === 'SPRING_AUTUMN' ? Leaf : Cloud;
  
  return (
    <div className="space-y-6">
      {/* Current Weather & Season */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <WeatherIcon className="w-5 h-5" />
            <span>Current Conditions</span>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            Weather-based quilt recommendations for optimal comfort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-red-500" />
              <div>
                <div className="font-medium">{currentWeather.temperature}°C</div>
                <div className="text-xs text-gray-500">Temperature</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-medium">{currentWeather.humidity}%</div>
                <div className="text-xs text-gray-500">Humidity</div>
              </div>
            </div>
            {currentWeather.windSpeed && (
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">{currentWeather.windSpeed} km/h</div>
                  <div className="text-xs text-gray-500">Wind Speed</div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <div>
                <div className="font-medium">{SEASON_NAMES[currentWeather.season as Season]}</div>
                <div className="text-xs text-gray-500">Season</div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{currentWeather.description}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Seasonal Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Seasonal Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{seasonalInsights.totalSeasonQuilts}</div>
              <div className="text-xs text-blue-600">Season Quilts</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{seasonalInsights.availableSeasonQuilts}</div>
              <div className="text-xs text-green-600">Available</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{seasonalInsights.avgSatisfaction}</div>
              <div className="text-xs text-purple-600">Avg Rating</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{seasonalInsights.utilizationRate}%</div>
              <div className="text-xs text-orange-600">In Use</div>
            </div>
          </div>
          
          {seasonalInsights.topMaterial && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">
                  Most popular material this season: {seasonalInsights.topMaterial}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recommendations */}
      <Tabs defaultValue="top" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="top" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Top Picks</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>All Recommendations</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="top">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.top.map((rec, index) => {
              const SeasonIcon = SEASON_ICONS[rec.quilt.season];
              return (
                <Card key={rec.quilt.id} className="relative overflow-hidden">
                  {index === 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-gold text-gold-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Best Match
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        #{rec.quilt.itemNumber} {rec.quilt.name}
                      </CardTitle>
                      <Badge className={cn('text-xs', getConfidenceColor(rec.confidence))}>
                        {rec.confidence} confidence
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={cn('text-xs', SEASON_COLORS[rec.quilt.season])}>
                        <SeasonIcon className="w-3 h-3 mr-1" />
                        {SEASON_NAMES[rec.quilt.season]}
                      </Badge>
                      <span className="text-sm text-gray-500">{rec.quilt.weightGrams}g</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Match Score</span>
                        <span className="text-sm font-bold">{Math.round(rec.score)}%</span>
                      </div>
                      <Progress value={rec.score} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-700">Why this quilt?</h4>
                      {rec.reasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <Lightbulb className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{reason}</span>
                        </div>
                      ))}
                      {rec.reasons.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs p-0 h-auto"
                          onClick={() => {
                            setSelectedRecommendation(rec.quilt);
                            setShowDetails(true);
                          }}
                        >
                          +{rec.reasons.length - 2} more reasons
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{rec.quilt.location}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Use This Quilt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Available Quilts</CardTitle>
              <CardDescription>
                Complete ranking based on current conditions and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.all.map((rec, index) => {
                  const SeasonIcon = SEASON_ICONS[rec.quilt.season];
                  return (
                    <div key={rec.quilt.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                        <div className="flex items-center space-x-2">
                          <SeasonIcon className="w-4 h-4" />
                          <div>
                            <div className="font-medium text-sm">
                              #{rec.quilt.itemNumber} {rec.quilt.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {rec.quilt.fillMaterial} • {rec.quilt.weightGrams}g
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{Math.round(rec.score)}%</div>
                          <Badge className={cn('text-xs', getConfidenceColor(rec.confidence))}>
                            {rec.confidence}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Recommendation Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recommendation Details</DialogTitle>
            <DialogDescription>
              Detailed analysis for {selectedRecommendation?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecommendation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Quilt Details</h4>
                  <div className="space-y-1 text-sm">
                    <div>Season: {SEASON_NAMES[selectedRecommendation.season]}</div>
                    <div>Weight: {selectedRecommendation.weightGrams}g</div>
                    <div>Material: {selectedRecommendation.fillMaterial}</div>
                    <div>Location: {selectedRecommendation.location}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Current Conditions</h4>
                  <div className="space-y-1 text-sm">
                    <div>Temperature: {currentWeather.temperature}°C</div>
                    <div>Humidity: {currentWeather.humidity}%</div>
                    <div>Season: {SEASON_NAMES[currentWeather.season as Season]}</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Recommendation Factors</h4>
                <div className="space-y-2">
                  {recommendations.all
                    .find(r => r.quilt.id === selectedRecommendation.id)
                    ?.reasons.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}