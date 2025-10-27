'use client';

import { MobileLayout, MobileCardLayout, MobileSection } from '@/components/layout/MobileLayout';
import { TouchButton, PullToRefresh } from '@/components/ui/touch-friendly';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
  Package,
  Clock,
  Target,
  Calendar,
  Star,
  Award,
  Plus,
  Search,
  BarChart3,
  Upload,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface MobileDashboardProps {
  stats: any;
  error: any;
  refetch: () => void;
  alerts: any[];
}

export function MobileDashboard({ stats, error, refetch, alerts }: MobileDashboardProps) {
  const router = useRouter();

  const handleRefresh = async () => {
    await refetch();
  };

  const handleAddQuilt = () => {
    router.push('/quilts?action=add' as any);
  };

  // Transform stats data for mobile display
  const dashboardStats = {
    totalQuilts: (stats as any)?.overview?.totalQuilts || 0,
    quiltsInUse: (stats as any)?.overview?.inUseCount || 0,
    availableQuilts: (stats as any)?.overview?.availableCount || 0,
    mostUsedQuilt: (stats as any)?.topUsedQuilts?.[0] ? {
      name: (stats as any).topUsedQuilts[0].quilt.name,
      usageCount: (stats as any).topUsedQuilts[0].stats.usageCount,
    } : undefined,
    seasonalDistribution: {
      WINTER: (stats as any)?.distribution?.seasonal?.WINTER || 0,
      SPRING_AUTUMN: (stats as any)?.distribution?.seasonal?.SPRING_AUTUMN || 0,
      SUMMER: (stats as any)?.distribution?.seasonal?.SUMMER || 0,
    },
  };

  if (error) {
    return (
      <MobileLayout title="Dashboard" subtitle="Quilt Management System">
        <MobileCardLayout>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p className="text-red-800 font-medium">Failed to load dashboard</p>
                <p className="text-red-600 text-sm mt-2">{error.message}</p>
                <TouchButton 
                  onClick={handleRefresh}
                  className="mt-4"
                  size="sm"
                >
                  Try Again
                </TouchButton>
              </div>
            </CardContent>
          </Card>
        </MobileCardLayout>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      title="Dashboard" 
      subtitle="Quilt Management System"
      showFAB={true}
      fabAction={handleAddQuilt}
      fabIcon={<Plus className="h-6 w-6" />}
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <MobileCardLayout>
          {/* Alerts */}
          {alerts.length > 0 && (
            <MobileSection title="Alerts">
              <div className="space-y-2 px-4">
                {alerts.slice(0, 2).map((alert, index) => (
                  <Card key={index} className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-800">
                            {alert.message}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {alert.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </MobileSection>
          )}

          {/* Key Statistics */}
          <MobileSection title="Overview">
            <div className="grid grid-cols-2 gap-4 px-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">
                    {dashboardStats.totalQuilts}
                  </p>
                  <p className="text-sm text-blue-700">Total Quilts</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">
                    {dashboardStats.quiltsInUse}
                  </p>
                  <p className="text-sm text-green-700">In Use</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">
                    {dashboardStats.availableQuilts}
                  </p>
                  <p className="text-sm text-purple-700">Available</p>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-900">4.5</p>
                  <p className="text-sm text-orange-700">Avg Rating</p>
                </CardContent>
              </Card>
            </div>
          </MobileSection>

          {/* Most Used Quilt */}
          {dashboardStats.mostUsedQuilt && (
            <MobileSection title="Most Used">
              <div className="px-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Award className="h-8 w-8 text-yellow-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {dashboardStats.mostUsedQuilt.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {dashboardStats.mostUsedQuilt.usageCount} uses
                        </p>
                      </div>
                      <Badge variant="secondary">Champion</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </MobileSection>
          )}

          {/* Seasonal Distribution */}
          <MobileSection title="Seasonal Distribution">
            <div className="px-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Winter</span>
                      </div>
                      <span className="font-medium">
                        {dashboardStats.seasonalDistribution.WINTER}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Spring/Autumn</span>
                      </div>
                      <span className="font-medium">
                        {dashboardStats.seasonalDistribution.SPRING_AUTUMN}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Summer</span>
                      </div>
                      <span className="font-medium">
                        {dashboardStats.seasonalDistribution.SUMMER}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </MobileSection>

          {/* Quick Actions */}
          <MobileSection title="Quick Actions">
            <div className="grid grid-cols-2 gap-3 px-4">
              <TouchButton
                variant="outline"
                onClick={() => router.push('/quilts')}
                className="h-16 flex-col space-y-1"
              >
                <Search className="h-5 w-5" />
                <span className="text-xs">Search</span>
              </TouchButton>

              <TouchButton
                variant="outline"
                onClick={() => router.push('/usage')}
                className="h-16 flex-col space-y-1"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Usage</span>
              </TouchButton>

              <TouchButton
                variant="outline"
                onClick={() => router.push('/seasonal')}
                className="h-16 flex-col space-y-1"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">Analytics</span>
              </TouchButton>

              <TouchButton
                variant="outline"
                onClick={() => router.push('/import' as any)}
                className="h-16 flex-col space-y-1"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">Import</span>
              </TouchButton>
            </div>
          </MobileSection>

          {/* System Status */}
          <MobileSection>
            <div className="px-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">All Systems Operational</p>
                      <p className="text-sm text-green-700">Last updated: Just now</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </MobileSection>
        </MobileCardLayout>
      </PullToRefresh>
    </MobileLayout>
  );
}