'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Clock,
  Calendar,
  Play,
  Square,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-provider';

interface RecentUsageItem {
  id: string;
  quilt: {
    id: string;
    name: string;
    itemNumber: number;
    season: string;
    color?: string;
  };
  type: string;
  date: Date | string;
  duration?: number | null;
  isCurrentlyInUse?: boolean;
}

interface RecentUsageListProps {
  quilts: RecentUsageItem[];
  isLoading?: boolean;
  onStartUsage?: (quiltId: number) => void;
  onEndUsage?: (quiltId: number) => void;
  onViewDetails?: (quiltId: number) => void;
}

export function RecentUsageList({
  quilts,
  isLoading = false,
  onStartUsage,
  onEndUsage,
  onViewDetails,
}: RecentUsageListProps) {
  const { language } = useLanguage();
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'WINTER':
        return 'bg-blue-100 text-blue-700';
      case 'SPRING_AUTUMN':
        return 'bg-green-100 text-green-700';
      case 'SUMMER':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityIcon = (type: string, isCurrentlyInUse?: boolean) => {
    if (isCurrentlyInUse) {
      return <Play className="h-3 w-3 text-green-600" />;
    }
    return type === 'usage_started' ? (
      <Play className="h-3 w-3 text-blue-600" />
    ) : (
      <Square className="h-3 w-3 text-gray-600" />
    );
  };

  const formatDate = (dateInput: Date | string) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return language === 'zh' ? '刚刚' : 'Just now';
    if (diffInHours < 24) return language === 'zh' ? `${diffInHours}小时前` : `${diffInHours}h ago`;
    if (diffInHours < 48) return language === 'zh' ? '昨天' : 'Yesterday';
    return date.toLocaleDateString(locale);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Usage Activity
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>Latest quilt usage changes and activity</CardDescription>
      </CardHeader>
      <CardContent>
        {quilts && quilts.length > 0 ? (
          <div className="space-y-4">
            {quilts.slice(0, 8).map(item => (
              <div
                key={`${item.quilt.id}-${item.date}`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-border hover:bg-muted transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  {/* Quilt Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={cn('text-xs font-medium', getSeasonColor(item.quilt.season))}
                    >
                      {getInitials(item.quilt.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.quilt.name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        #{item.quilt.itemNumber}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      {getActivityIcon(item.type, item.isCurrentlyInUse)}
                      <span className="text-xs text-muted-foreground">
                        {item.type === 'usage_started' ? 'Started using' : 'Finished using'}
                        {item.duration && ` • ${item.duration} days`}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={item.isCurrentlyInUse ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {item.isCurrentlyInUse ? 'In Use' : 'Storage'}
                  </Badge>

                  <div className="flex space-x-1">
                    {item.isCurrentlyInUse ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => onEndUsage?.(parseInt(item.quilt.id))}
                      >
                        <Square className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => onStartUsage?.(parseInt(item.quilt.id))}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => onViewDetails?.(parseInt(item.quilt.id))}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {quilts.length > 8 && (
              <div className="text-center pt-4 border-t border-border">
                <Button variant="ghost" size="sm">
                  View All Activity
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">No recent activity</p>
            <p className="text-xs text-muted-foreground mb-4">
              Start using a quilt to see activity here
            </p>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Browse Quilts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
