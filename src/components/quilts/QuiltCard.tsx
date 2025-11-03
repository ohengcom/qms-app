'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Season, QuiltStatus } from '@/lib/validations/quilt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStartUsage, useEndUsage, useDeleteQuilt } from '@/hooks/useQuilts';
import { useToastContext } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { QuiltThumbnail, QuiltImage } from '@/components/ui/next-image';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Play,
  Square,
  Calendar,
  MapPin,
  Ruler,
  Weight,
  Package2,
  Clock,
  Snowflake,
  Sun,
  Leaf,
} from 'lucide-react';

interface QuiltCardProps {
  quilt: {
    id: string;
    itemNumber: number;
    name: string;
    season: Season;
    color: string;
    location: string;
    currentStatus: QuiltStatus;
    lengthCm: number;
    widthCm: number;
    weightGrams: number;
    fillMaterial: string;
    brand?: string | null;
    imageUrl?: string | null;
    thumbnailUrl?: string | null;
    currentUsage?: {
      id: string;
      startedAt: Date;
    } | null;
    usagePeriods?: {
      startDate: Date;
      endDate?: Date | null;
    }[];
  };
  variant?: 'card' | 'compact' | 'detailed';
  onEdit?: (quilt: any) => void;
  onView?: (quilt: any) => void;
}

const SEASON_ICONS = {
  [Season.WINTER]: Snowflake,
  [Season.SPRING_AUTUMN]: Leaf,
  [Season.SUMMER]: Sun,
};

const SEASON_COLORS = {
  [Season.WINTER]: 'text-blue-600 bg-blue-100',
  [Season.SPRING_AUTUMN]: 'text-green-600 bg-green-100',
  [Season.SUMMER]: 'text-orange-600 bg-orange-100',
};

const STATUS_COLORS = {
  [QuiltStatus.AVAILABLE]: 'text-green-700 bg-green-100',
  [QuiltStatus.IN_USE]: 'text-blue-700 bg-blue-100',
  [QuiltStatus.STORAGE]: 'text-gray-700 bg-gray-100',
  [QuiltStatus.MAINTENANCE]: 'text-red-700 bg-red-100',
};

const STATUS_LABELS = {
  [QuiltStatus.AVAILABLE]: 'Available',
  [QuiltStatus.IN_USE]: 'In Use',
  [QuiltStatus.STORAGE]: 'Storage',
  [QuiltStatus.MAINTENANCE]: 'Maintenance',
};

export function QuiltCard({ quilt, variant = 'card', onEdit, onView }: QuiltCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toast = useToastContext();

  const startUsage = useStartUsage();
  const endUsage = useEndUsage();
  const deleteQuilt = useDeleteQuilt();

  const SeasonIcon = SEASON_ICONS[quilt.season];
  const isInUse = quilt.currentStatus === QuiltStatus.IN_USE;
  const isAvailable = quilt.currentStatus === QuiltStatus.AVAILABLE;

  const handleStartUsage = async () => {
    try {
      await startUsage.mutateAsync({
        quiltId: quilt.id,
        startDate: new Date(),
        usageType: 'REGULAR',
      });
      toast.success('Usage started', `Started using ${quilt.name}`);
    } catch (error) {
      toast.error(
        'Failed to start usage',
        error instanceof Error ? error.message : 'Please try again'
      );
    }
  };

  const handleEndUsage = async () => {
    if (!quilt.currentUsage) return;

    try {
      await endUsage.mutateAsync({
        quiltId: quilt.id,
        endDate: new Date(),
      });
      toast.success('Usage ended', `Stopped using ${quilt.name}`);
    } catch (error) {
      toast.error(
        'Failed to end usage',
        error instanceof Error ? error.message : 'Please try again'
      );
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(`Are you sure you want to delete "${quilt.name}"? This action cannot be undone.`)
    ) {
      return;
    }

    try {
      await deleteQuilt.mutateAsync({ id: quilt.id });
      toast.success('Quilt deleted', `${quilt.name} has been removed from your collection`);
    } catch (error) {
      toast.error(
        'Failed to delete quilt',
        error instanceof Error ? error.message : 'Please try again'
      );
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysSinceLastUse = () => {
    if (!quilt.usagePeriods || quilt.usagePeriods.length === 0) return null;

    const lastUsage = quilt.usagePeriods[0];
    const lastDate = lastUsage.endDate || lastUsage.startDate;
    const days = Math.ceil((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));

    return days;
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {quilt.thumbnailUrl ? (
                <QuiltThumbnail
                  src={quilt.thumbnailUrl}
                  alt={quilt.name}
                  className="w-full h-full"
                />
              ) : (
                <Package2 className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                #{quilt.itemNumber} {quilt.name}
              </h3>
              <Badge className={cn('text-xs', STATUS_COLORS[quilt.currentStatus])}>
                {STATUS_LABELS[quilt.currentStatus]}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center">
                <SeasonIcon className="w-3 h-3 mr-1" />
                {quilt.season.replace('_', '/')}
              </span>
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {quilt.location}
              </span>
              <span className="flex items-center">
                <Weight className="w-3 h-3 mr-1" />
                {quilt.weightGrams}g
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isAvailable && (
            <Button size="sm" variant="outline" onClick={handleStartUsage}>
              <Play className="w-4 h-4" />
            </Button>
          )}
          {isInUse && (
            <Button size="sm" variant="outline" onClick={handleEndUsage}>
              <Square className="w-4 h-4" />
            </Button>
          )}

          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(quilt)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(quilt)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">
                #{quilt.itemNumber} {quilt.name}
              </CardTitle>
              <Badge className={cn('text-xs', SEASON_COLORS[quilt.season])}>
                <SeasonIcon className="w-3 h-3 mr-1" />
                {quilt.season.replace('_', '/')}
              </Badge>
            </div>
            <CardDescription className="flex items-center space-x-4">
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {quilt.location}
              </span>
              {quilt.brand && <span>• {quilt.brand}</span>}
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={cn('text-xs', STATUS_COLORS[quilt.currentStatus])}>
              {STATUS_LABELS[quilt.currentStatus]}
            </Badge>

            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(quilt)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(quilt)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAvailable && (
                  <DropdownMenuItem onClick={handleStartUsage}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Using
                  </DropdownMenuItem>
                )}
                {isInUse && (
                  <DropdownMenuItem onClick={handleEndUsage}>
                    <Square className="w-4 h-4 mr-2" />
                    Stop Using
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Image */}
        {quilt.imageUrl && (
          <div className="mb-4">
            <QuiltImage src={quilt.imageUrl} alt={quilt.name} className="w-full h-48" />
          </div>
        )}

        {/* Specifications */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Ruler className="w-4 h-4" />
            <span>
              {quilt.lengthCm} × {quilt.widthCm} cm
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Weight className="w-4 h-4" />
            <span>{quilt.weightGrams}g</span>
          </div>
          <div className="col-span-2 flex items-center space-x-2 text-gray-600">
            <Package2 className="w-4 h-4" />
            <span>{quilt.fillMaterial}</span>
          </div>
        </div>

        {/* Usage Info */}
        {isInUse && quilt.currentUsage && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                In use since {formatDate(quilt.currentUsage.startedAt)}
              </span>
            </div>
          </div>
        )}

        {/* Last Usage */}
        {!isInUse &&
          (() => {
            const daysSince = getDaysSinceLastUse();
            if (daysSince !== null) {
              return (
                <div className="mb-4 flex items-center space-x-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Last used {daysSince === 0 ? 'today' : `${daysSince} days ago`}</span>
                </div>
              );
            }
            return (
              <div className="mb-4 flex items-center space-x-2 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>Never used</span>
              </div>
            );
          })()}

        {/* Color */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: quilt.color.toLowerCase() }}
              title={quilt.color}
            />
            <span className="text-sm text-gray-600">{quilt.color}</span>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            {isAvailable && (
              <Button size="sm" variant="outline" onClick={handleStartUsage}>
                <Play className="w-4 h-4 mr-1" />
                Use
              </Button>
            )}
            {isInUse && (
              <Button size="sm" variant="outline" onClick={handleEndUsage}>
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
