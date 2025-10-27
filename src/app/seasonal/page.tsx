'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SeasonalRecommendations } from '@/components/seasonal/SeasonalRecommendations';
import { WeatherBasedSuggestions } from '@/components/seasonal/WeatherBasedSuggestions';
// import { UsagePatternAnalysis } from '@/components/seasonal/UsagePatternAnalysis';
import { useQuilts } from '@/hooks/useQuilts';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Snowflake,
  Sun,
  Leaf,
  Cloud,
  Lightbulb,
  BarChart3,
  TrendingUp,
  Calendar,
  Thermometer,
  Eye,
  RefreshCw,
  Settings
} from 'lucide-react';

export default function SeasonalIntelligencePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data, isLoading, error } = useQuilts({
    filters: {},
    sortBy: 'name',
    sortOrder: 'asc',
    skip: 0,
    take: 100,
  });
  
  const quilts = Array.isArray(data) ? data : [];
  
  // Calculate seasonal statistics
  const seasonalStats = {
    totalQuilts: quilts.length,
    winterQuilts: quilts.filter(q => q.season === 'WINTER').length,
    springAutumnQuilts: quilts.filter(q => q.season === 'SPRING_AUTUMN').length,
    summerQuilts: quilts.filter(q => q.season === 'SUMMER').length,
    availableQuilts: quilts.filter(q => q.currentStatus === 'AVAILABLE').length,
    totalUsagePeriods: quilts.reduce((sum, q) => sum + (q.usagePeriods?.length || 0), 0),
  };
  
  // Get current season based on date
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 11 || month <= 2) return 'WINTER';
    if (month >= 6 && month <= 8) return 'SUMMER';
    return 'SPRING_AUTUMN';
  };
  
  const currentSeason = getCurrentSeason();
  const currentSeasonQuilts = quilts.filter(q => q.season === currentSeason);
  const availableCurrentSeasonQuilts = currentSeasonQuilts.filter(q => q.currentStatus === 'AVAILABLE');
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load quilts</p>
            <p className="text-gray-500 text-sm">{error.message}</p>
          </div>
        </Card>
      </div>
    );
  }
  
  const SeasonIcon = currentSeason === 'WINTER' ? Snowflake : 
                    currentSeason === 'SUMMER' ? Sun : Leaf;
  
  const seasonName = currentSeason === 'WINTER' ? 'Winter' :
                    currentSeason === 'SUMMER' ? 'Summer' : 'Spring/Autumn';
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Lightbulb className="w-6 h-6" />
            <span>Seasonal Intelligence</span>
          </h1>
          <p className="text-gray-500">Smart recommendations and insights for optimal quilt selection</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
      {/* Current Season Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SeasonIcon className="w-5 h-5" />
              <span>Current Season: {seasonName}</span>
            </div>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </Badge>
          </CardTitle>
          <CardDescription>
            Overview of your quilt collection for the current season
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{currentSeasonQuilts.length}</div>
              <div className="text-sm text-blue-600">Season Quilts</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{availableCurrentSeasonQuilts.length}</div>
              <div className="text-sm text-green-600">Available Now</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {currentSeasonQuilts.length > 0 
                  ? Math.round((currentSeasonQuilts.length - availableCurrentSeasonQuilts.length) / currentSeasonQuilts.length * 100)
                  : 0
                }%
              </div>
              <div className="text-sm text-purple-600">In Use</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {currentSeasonQuilts.reduce((sum, q) => sum + (q.usagePeriods?.length || 0), 0)}
              </div>
              <div className="text-sm text-orange-600">Total Uses</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Collection Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Collection Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Snowflake className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="font-medium">Winter</div>
                  <div className="text-sm text-gray-500">{seasonalStats.winterQuilts} quilts</div>
                </div>
              </div>
              <Badge variant={currentSeason === 'WINTER' ? 'default' : 'secondary'}>
                {currentSeason === 'WINTER' ? 'Current' : 'Inactive'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Leaf className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-medium">Spring/Autumn</div>
                  <div className="text-sm text-gray-500">{seasonalStats.springAutumnQuilts} quilts</div>
                </div>
              </div>
              <Badge variant={currentSeason === 'SPRING_AUTUMN' ? 'default' : 'secondary'}>
                {currentSeason === 'SPRING_AUTUMN' ? 'Current' : 'Inactive'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Sun className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="font-medium">Summer</div>
                  <div className="text-sm text-gray-500">{seasonalStats.summerQuilts} quilts</div>
                </div>
              </div>
              <Badge variant={currentSeason === 'SUMMER' ? 'default' : 'secondary'}>
                {currentSeason === 'SUMMER' ? 'Current' : 'Inactive'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="font-medium">Total Usage</div>
                  <div className="text-sm text-gray-500">{seasonalStats.totalUsagePeriods} periods</div>
                </div>
              </div>
              <Badge variant="outline">All Time</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Tabs */}
      {quilts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Lightbulb}
              title="No quilts in your collection"
              description="Add some quilts to your collection to get personalized seasonal recommendations and insights."
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations" className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Recommendations</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center space-x-2">
              <Cloud className="w-4 h-4" />
              <span>Weather</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations">
            <SeasonalRecommendations 
              quilts={quilts}
              userPreferences={{
                preferredTemperature: 20,
                sleepStyle: 'neutral',
                materialPreferences: ['Down', 'Cotton'],
              }}
            />
          </TabsContent>
          
          <TabsContent value="weather">
            <WeatherBasedSuggestions 
              quilts={quilts}
              location="Your Location"
            />
          </TabsContent>
          
          <TabsContent value="patterns">
            <Card>
              <CardHeader>
                <CardTitle>Usage Pattern Analysis</CardTitle>
                <CardDescription>Coming soon - Advanced usage pattern analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Pattern analysis will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Smart Insights</span>
                </CardTitle>
                <CardDescription>
                  AI-powered insights and recommendations based on your usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Seasonal Optimization</h4>
                        <p className="text-sm text-blue-800">
                          Based on your usage patterns, you tend to prefer heavier quilts during transitional seasons. 
                          Consider having a medium-weight option ready for unexpected temperature changes.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Thermometer className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 mb-1">Temperature Preferences</h4>
                        <p className="text-sm text-green-800">
                          Your satisfaction ratings are highest when using quilts in the 18-22°C range. 
                          Consider this when selecting quilts for different rooms or seasons.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900 mb-1">Usage Efficiency</h4>
                        <p className="text-sm text-purple-800">
                          Some of your quilts are underutilized. Consider rotating your collection more frequently 
                          or storing less-used quilts to make room for new additions.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Customize Preferences</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}