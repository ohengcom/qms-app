'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Calendar,
  Award,
  Activity
} from 'lucide-react';

interface UsagePeriod {
  id: string;
  startDate: Date;
  endDate?: Date | null;
  usageType: string;
  seasonUsed?: string | null;
  temperature?: number | null;
  satisfactionRating?: number | null;
  durationDays?: number | null;
}

interface Quilt {
  id: string;
  name: string;
  itemNumber: number;
  season: string;
  weightGrams: number;
  fillMaterial: string;
  usagePeriods?: UsagePeriod[];
}

interface UsagePatternAnalysisProps {
  quilts: Quilt[];
}

export function UsagePatternAnalysis({ quilts }: UsagePatternAnalysisProps) {
  const analysis = useMemo(() => {
    const allUsagePeriods = quilts.flatMap(q => 
      (q.usagePeriods || []).map(period => ({
        ...period,
        quilt: q,
      }))
    );
    
    const completedPeriods = allUsagePeriods.filter(p => p.endDate);
    
    // Seasonal usage patterns
    const seasonalUsage = completedPeriods.reduce((acc, period) => {
      const season = period.seasonUsed || 'Unknown';
      if (!acc[season]) {
        acc[season] = {
          count: 0,
          totalDays: 0,
          avgSatisfaction: 0,
          quilts: new Set(),
        };
      }
      
      acc[season].count++;
      acc[season].totalDays += period.durationDays || 0;
      acc[season].quilts.add(period.quilt.id);
      
      if (period.satisfactionRating) {
        acc[season].avgSatisfaction = 
          (acc[season].avgSatisfaction * (acc[season].count - 1) + period.satisfactionRating) / acc[season].count;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    // Quilt performance analysis
    const quiltPerformance = quilts.map(quilt => {
      const periods = quilt.usagePeriods || [];
      const completed = periods.filter(p => p.endDate);
      
      const totalDays = completed.reduce((sum, p) => sum + (p.durationDays || 0), 0);
      const avgSatisfaction = completed.length > 0
        ? completed.reduce((sum, p) => sum + (p.satisfactionRating || 0), 0) / completed.length
        : 0;
      
      return {
        quilt,
        usageCount: completed.length,
        totalDays,
        avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
        avgDuration: completed.length > 0 ? Math.round(totalDays / completed.length * 10) / 10 : 0,
      };
    }).sort((a, b) => b.usageCount - a.usageCount);
    
    return {
      seasonalUsage,
      quiltPerformance,
      totalPeriods: completedPeriods.length,
      totalDays: completedPeriods.reduce((sum, p) => sum + (p.durationDays || 0), 0),
      avgSatisfaction: completedPeriods.length > 0
        ? completedPeriods.reduce((sum, p) => sum + (p.satisfactionRating || 0), 0) / completedPeriods.length
        : 0,
    };
  }, [quilts]);
  
  if (analysis.totalPeriods === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Usage Pattern Analysis</span>
          </CardTitle>
          <CardDescription>
            Analyze usage patterns and trends across your quilt collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No usage data available for analysis</p>
            <p className="text-sm">Start tracking quilt usage to see patterns and insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Usage Overview</span>
          </CardTitle>
          <CardDescription>
            Key metrics from your quilt usage history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{analysis.totalPeriods}</div>
              <div className="text-sm text-blue-600">Total Uses</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{analysis.totalDays}</div>
              <div className="text-sm text-green-600">Total Days</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(analysis.avgSatisfaction * 10) / 10}
              </div>
              <div className="text-sm text-purple-600">Avg Satisfaction</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {Math.round(analysis.totalDays / analysis.totalPeriods * 10) / 10}
              </div>
              <div className="text-sm text-orange-600">Avg Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed Analysis */}
      <Tabs defaultValue="seasonal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="seasonal" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Seasonal</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Seasonal Analysis */}
        <TabsContent value="seasonal">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Usage Patterns</CardTitle>
              <CardDescription>
                How your quilts are used across different seasons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(analysis.seasonalUsage).map(([season, data]: [string, any]) => (
                  <div key={season} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{season}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{data.count} uses</Badge>
                        <Badge variant="outline">{data.quilts.size} quilts</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{data.totalDays}</div>
                        <div className="text-xs text-blue-600">Total Days</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(data.avgSatisfaction * 10) / 10}
                        </div>
                        <div className="text-xs text-green-600">Avg Satisfaction</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(data.totalDays / data.count * 10) / 10}
                        </div>
                        <div className="text-xs text-purple-600">Avg Duration</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Performance Analysis */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Quilt Performance Ranking</CardTitle>
              <CardDescription>
                Individual quilt performance based on usage frequency and satisfaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.quiltPerformance.slice(0, 10).map((performance, index) => (
                  <div key={performance.quilt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                      <div>
                        <div className="font-medium text-sm">
                          #{performance.quilt.itemNumber} {performance.quilt.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {performance.quilt.fillMaterial} • {performance.quilt.weightGrams}g
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{performance.usageCount} uses</div>
                        <div className="text-xs text-gray-500">{performance.totalDays} days</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{performance.avgSatisfaction}/5</div>
                        <div className="text-xs text-gray-500">satisfaction</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}