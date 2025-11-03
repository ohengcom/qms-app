'use client';

import { useState } from 'react';
import { Season, QuiltStatus } from '@/lib/validations/quilt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useStartUsage, useEndUsage, useDeleteQuilt } from '@/hooks/useQuilts';
import { useToastContext } from '@/hooks/useToast';
import { Loading } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { QuiltDetailImage } from '@/components/ui/next-image';
import {
  ArrowLeft,
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
  Building,
  Palette,
  FileText,
  Image as ImageIcon,
  BarChart3,
  History,
  Settings,
} from 'lucide-react';

interface QuiltDetailProps {
  quilt: {
    id: string;
    itemNumber: number;
    groupId?: number | null;
    name: string;
    season: Season;
    color: string;
    location: string;
    currentStatus: QuiltStatus;
    lengthCm: number;
    widthCm: number;
    weightGrams: number;
    fillMaterial: string;
    materialDetails?: string | null;
    brand?: string | null;
    purchaseDate?: Date | null;
    packagingInfo?: string | null;
    notes?: string | null;
    imageUrl?: string | null;
    thumbnailUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
    currentUsage?: {
      id: string;
      startedAt: Date;
      usageType: string;
    } | null;
    usagePeriods?: {
      id: string;
      startDate: Date;
      endDate?: Date | null;
      usageType: string;
      notes?: string | null;
    }[];
    maintenanceRecords?: {
      id: string;
      date: Date;
      type: string;
      description: string;
      cost?: number | null;
    }[];
    usageAnalytics?: {
      totalUsageDays: number;
      averageUsageDuration: number;
      lastUsedDate?: Date | null;
      usageFrequency: number;
    };
  };
  onBack?: () => void;
  onEdit?: (quilt: any) => void;
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

export function QuiltDetail({ quilt, onBack, onEdit }: QuiltDetailProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
    try {
      await deleteQuilt.mutateAsync({ id: quilt.id });
      toast.success('Quilt deleted', `${quilt.name} has been removed from your collection`);
      onBack?.();
    } catch (error) {
      toast.error(
        'Failed to delete quilt',
        error instanceof Error ? error.message : 'Please try again'
      );
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysSince = (date: Date) => {
    return Math.ceil((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                #{quilt.itemNumber} {quilt.name}
              </h1>
              <Badge className={cn('text-sm', SEASON_COLORS[quilt.season])}>
                <SeasonIcon className="w-4 h-4 mr-1" />
                {quilt.season.replace('_', '/')}
              </Badge>
              <Badge className={cn('text-sm', STATUS_COLORS[quilt.currentStatus])}>
                {STATUS_LABELS[quilt.currentStatus]}
              </Badge>
            </div>
            {quilt.groupId && <p className="text-gray-500 mt-1">Group #{quilt.groupId}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isAvailable && (
            <Button onClick={handleStartUsage} disabled={startUsage.isPending}>
              {startUsage.isPending ? (
                <Loading size="sm" className="mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Start Using
            </Button>
          )}
          {isInUse && (
            <Button variant="outline" onClick={handleEndUsage} disabled={endUsage.isPending}>
              {endUsage.isPending ? (
                <Loading size="sm" className="mr-2" />
              ) : (
                <Square className="w-4 h-4 mr-2" />
              )}
              Stop Using
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(quilt)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Quilt</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{quilt.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteQuilt.isPending}
                >
                  {deleteQuilt.isPending ? (
                    <Loading size="sm" className="mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Usage Alert */}
      {isInUse && quilt.currentUsage && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-blue-700">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                Currently in use since {formatDateTime(quilt.currentUsage.startedAt)}
              </span>
              <span className="text-blue-600">
                ({getDaysSince(quilt.currentUsage.startedAt)} days)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Package2 className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Usage History</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Maintenance</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5" />
                    <span>Images</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {quilt.imageUrl ? (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden">
                      <QuiltDetailImage src={quilt.imageUrl} alt={quilt.name} />
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p>No image available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Ruler className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Dimensions:</span>
                      <span className="font-medium">
                        {quilt.lengthCm} × {quilt.widthCm} cm
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Weight className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Weight:</span>
                      <span className="font-medium">{quilt.weightGrams}g</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Color:</span>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: quilt.color.toLowerCase() }}
                        />
                        <span className="font-medium">{quilt.color}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="font-medium">{quilt.location}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Package2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Fill Material:</span>
                      <span className="font-medium">{quilt.fillMaterial}</span>
                    </div>
                    {quilt.materialDetails && (
                      <div className="ml-6">
                        <p className="text-sm text-gray-600">{quilt.materialDetails}</p>
                      </div>
                    )}
                  </div>

                  {quilt.brand && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Brand:</span>
                      <span className="font-medium">{quilt.brand}</span>
                    </div>
                  )}

                  {quilt.purchaseDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Purchase Date:</span>
                      <span className="font-medium">{formatDate(quilt.purchaseDate)}</span>
                    </div>
                  )}

                  {quilt.packagingInfo && (
                    <div className="flex items-start space-x-2">
                      <Package2 className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-sm text-gray-600">Packaging:</span>
                      <span className="font-medium">{quilt.packagingInfo}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {quilt.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Notes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{quilt.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Usage History Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage History</CardTitle>
              <CardDescription>Track when and how this quilt has been used</CardDescription>
            </CardHeader>
            <CardContent>
              {quilt.usagePeriods && quilt.usagePeriods.length > 0 ? (
                <div className="space-y-4">
                  {quilt.usagePeriods.map(period => (
                    <div
                      key={period.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            {formatDate(period.startDate)}
                            {period.endDate && ` - ${formatDate(period.endDate)}`}
                          </span>
                          <Badge variant="outline">{period.usageType}</Badge>
                        </div>
                        {period.notes && (
                          <p className="text-sm text-gray-600 ml-6">{period.notes}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {period.endDate ? `${getDaysSince(period.endDate)} days ago` : 'In use'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2" />
                  <p>No usage history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {quilt.usageAnalytics?.totalUsageDays || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Usage Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {quilt.usageAnalytics?.averageUsageDuration || 0}
                    </p>
                    <p className="text-sm text-gray-600">Avg. Duration (days)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {quilt.usageAnalytics?.usageFrequency || 0}
                    </p>
                    <p className="text-sm text-gray-600">Usage Frequency</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-lg font-bold">
                      {quilt.usageAnalytics?.lastUsedDate
                        ? `${getDaysSince(quilt.usageAnalytics.lastUsedDate)}d`
                        : 'Never'}
                    </p>
                    <p className="text-sm text-gray-600">Days Since Last Use</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Records</CardTitle>
              <CardDescription>
                Keep track of cleaning, repairs, and other maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quilt.maintenanceRecords && quilt.maintenanceRecords.length > 0 ? (
                <div className="space-y-4">
                  {quilt.maintenanceRecords.map(record => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{record.type}</span>
                          <span className="text-sm text-gray-500">{formatDate(record.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">{record.description}</p>
                      </div>
                      {record.cost && (
                        <div className="text-sm font-medium">${record.cost.toFixed(2)}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-2" />
                  <p>No maintenance records yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Created: {formatDateTime(quilt.createdAt)}</span>
            <span>Last updated: {formatDateTime(quilt.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
