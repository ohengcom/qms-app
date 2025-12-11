'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/trpc';
import { Download, FileSpreadsheet, Calendar, Filter, Loader2, CheckCircle } from 'lucide-react';

interface ExportOptionsProps {
  type: 'quilts' | 'usage' | 'maintenance';
}

export function ExportOptions({ type }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    season: '',
    status: '',
    location: '',
    includeUsageHistory: true,
    includeMaintenanceRecords: false,
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1), // Start of current year
      end: new Date(), // Today
    },
  });

  const { success, error } = useToast();

  // Export mutations
  const exportQuiltsMutation = api.importExport.exportQuiltsToExcel.useMutation({
    onSuccess: data => {
      downloadFile(data.fileData, data.filename);
      success('Export completed', `Successfully exported ${data.totalRecords} quilts`);
      setIsExporting(false);
    },
    onError: err => {
      error('Export failed', err.message);
      setIsExporting(false);
    },
  });

  const exportUsageMutation = api.importExport.exportUsageReportToExcel.useMutation({
    onSuccess: data => {
      downloadFile(data.fileData, data.filename);
      success('Export completed', `Successfully exported ${data.totalRecords} usage records`);
      setIsExporting(false);
    },
    onError: err => {
      error('Export failed', err.message);
      setIsExporting(false);
    },
  });

  const exportMaintenanceMutation = api.importExport.exportMaintenanceReportToExcel.useMutation({
    onSuccess: data => {
      downloadFile(data.fileData, data.filename);
      success('Export completed', `Successfully exported ${data.totalRecords} maintenance records`);
      setIsExporting(false);
    },
    onError: err => {
      error('Export failed', err.message);
      setIsExporting(false);
    },
  });

  const downloadFile = (base64Data: string, filename: string) => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      error('Download failed', 'Failed to download the exported file');
    }
  };

  const handleExport = () => {
    setIsExporting(true);

    switch (type) {
      case 'quilts':
        exportQuiltsMutation.mutate({
          format: 'xlsx',
          includeUsageHistory: filters.includeUsageHistory,
          includeMaintenanceRecords: filters.includeMaintenanceRecords,
          filters: {
            season: filters.season || undefined,
            status: filters.status || undefined,
            location: filters.location || undefined,
          },
        } as any);
        break;

      case 'usage':
        exportUsageMutation.mutate({
          dateRange: filters.dateRange,
        });
        break;

      case 'maintenance':
        exportMaintenanceMutation.mutate();
        break;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'quilts':
        return 'Export Quilt Collection';
      case 'usage':
        return 'Export Usage Report';
      case 'maintenance':
        return 'Export Maintenance Report';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'quilts':
        return 'Configure export options for your quilt collection data';
      case 'usage':
        return 'Generate usage reports for a specific date range';
      case 'maintenance':
        return 'Export maintenance history and schedules';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'quilts':
        return <FileSpreadsheet className="mr-2 h-5 w-5" />;
      case 'usage':
        return <Calendar className="mr-2 h-5 w-5" />;
      case 'maintenance':
        return <CheckCircle className="mr-2 h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {getIcon()}
            {getTitle()}
          </CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters for Quilts */}
          {type === 'quilts' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <Label className="text-sm font-medium">Filters</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="season">Season</Label>
                  <Select
                    value={filters.season}
                    onValueChange={value => setFilters(prev => ({ ...prev, season: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All seasons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All seasons</SelectItem>
                      <SelectItem value="WINTER">Winter</SelectItem>
                      <SelectItem value="SPRING_AUTUMN">Spring/Autumn</SelectItem>
                      <SelectItem value="SUMMER">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={value => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="IN_USE">In Use</SelectItem>
                      <SelectItem value="STORAGE">Storage</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Filter by location"
                    value={filters.location}
                    onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Include Additional Data</Label>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeUsageHistory"
                    checked={filters.includeUsageHistory}
                    onCheckedChange={checked =>
                      setFilters(prev => ({ ...prev, includeUsageHistory: !!checked }))
                    }
                  />
                  <Label htmlFor="includeUsageHistory" className="text-sm">
                    Include usage history and statistics
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMaintenanceRecords"
                    checked={filters.includeMaintenanceRecords}
                    onCheckedChange={checked =>
                      setFilters(prev => ({ ...prev, includeMaintenanceRecords: !!checked }))
                    }
                  />
                  <Label htmlFor="includeMaintenanceRecords" className="text-sm">
                    Include maintenance records
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Date Range for Usage Reports */}
          {type === 'usage' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <Label className="text-sm font-medium">Date Range</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <DatePicker
                    date={filters.dateRange.start}
                    onDateChange={date =>
                      setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: date || new Date() },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <DatePicker
                    date={filters.dateRange.end}
                    onDateChange={date =>
                      setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: date || new Date() },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end">
            <Button onClick={handleExport} disabled={isExporting} className="min-w-[150px]">
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            {type === 'quilts' && (
              <>
                <p>• The export will include all quilt details, dimensions, and current status</p>
                <p>• Usage history adds columns for total usage days and last used dates</p>
                <p>• Maintenance records include service history and upcoming due dates</p>
                <p>• Use filters to export specific subsets of your collection</p>
              </>
            )}
            {type === 'usage' && (
              <>
                <p>• Usage reports show all quilt usage within the selected date range</p>
                <p>• Includes start/end dates, duration, and usage patterns</p>
                <p>• Perfect for analyzing seasonal usage trends</p>
                <p>• Data can be used for planning and optimization</p>
              </>
            )}
            {type === 'maintenance' && (
              <>
                <p>• Maintenance reports include all service history</p>
                <p>• Shows completed maintenance and upcoming due dates</p>
                <p>• Includes costs and service provider information</p>
                <p>• Useful for budgeting and scheduling maintenance</p>
              </>
            )}
            <p>• All exports are in Excel format (.xlsx) for easy analysis</p>
            <p>• Files are downloaded directly to your device</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
