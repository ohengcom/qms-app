'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Calendar, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Mock data for export history - in a real app this would come from the database
const mockExportHistory = [
  {
    id: '1',
    type: 'quilts',
    filename: 'quilts-export-2024-12-22.xlsx',
    createdAt: new Date('2024-12-22T10:30:00'),
    status: 'completed',
    totalRecords: 16,
    fileSize: '45 KB',
    filters: { season: 'WINTER', includeUsageHistory: true },
  },
  {
    id: '2',
    type: 'usage',
    filename: 'usage-report-2024-01-01-to-2024-12-22.xlsx',
    createdAt: new Date('2024-12-21T15:45:00'),
    status: 'completed',
    totalRecords: 89,
    fileSize: '78 KB',
    filters: { dateRange: { start: '2024-01-01', end: '2024-12-22' } },
  },
  {
    id: '3',
    type: 'maintenance',
    filename: 'maintenance-report-2024-12-20.xlsx',
    createdAt: new Date('2024-12-20T09:15:00'),
    status: 'completed',
    totalRecords: 12,
    fileSize: '23 KB',
    filters: {},
  },
  {
    id: '4',
    type: 'quilts',
    filename: 'quilts-export-2024-12-19.xlsx',
    createdAt: new Date('2024-12-19T14:20:00'),
    status: 'expired',
    totalRecords: 16,
    fileSize: '42 KB',
    filters: { includeUsageHistory: true, includeMaintenanceRecords: true },
  },
];

export function ExportHistory() {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quilts':
        return <FileSpreadsheet className="h-4 w-4 text-blue-600" />;
      case 'usage':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'maintenance':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      default:
        return <FileSpreadsheet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'quilts':
        return 'Quilt Collection';
      case 'usage':
        return 'Usage Report';
      case 'maintenance':
        return 'Maintenance Report';
      default:
        return 'Export';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Available
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Expired
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Processing
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  const formatFilters = (filters: any) => {
    const filterStrings = [];

    if (filters.season) filterStrings.push(`Season: ${filters.season}`);
    if (filters.status) filterStrings.push(`Status: ${filters.status}`);
    if (filters.location) filterStrings.push(`Location: ${filters.location}`);
    if (filters.includeUsageHistory) filterStrings.push('Usage History');
    if (filters.includeMaintenanceRecords) filterStrings.push('Maintenance Records');
    if (filters.dateRange) {
      filterStrings.push(`${filters.dateRange.start} to ${filters.dateRange.end}`);
    }

    return filterStrings.length > 0 ? filterStrings.join(', ') : 'No filters';
  };

  const handleDownload = (exportItem: any) => {
    if (exportItem.status === 'expired') {
      // In a real app, you might show a message or regenerate the export
      alert('This export has expired. Please create a new export.');
      return;
    }

    // In a real app, this would trigger the actual download
    alert(`Downloading ${exportItem.filename}...`);
  };

  const handleRegenerate = (exportItem: any) => {
    // In a real app, this would trigger a new export with the same filters
    alert(`Regenerating export with the same filters...`);
  };

  return (
    <div className="space-y-6">
      {/* Export History Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Export History
          </CardTitle>
          <CardDescription>View and download your previous exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <p>• Export files are available for download for 7 days</p>
            <p>• After 7 days, you can regenerate exports with the same filters</p>
            <p>• All exports are in Excel format (.xlsx)</p>
          </div>
        </CardContent>
      </Card>

      {/* Export History List */}
      <div className="space-y-4">
        {mockExportHistory.map(exportItem => (
          <Card key={exportItem.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">{getTypeIcon(exportItem.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {getTypeName(exportItem.type)}
                      </h3>
                      {getStatusBadge(exportItem.status)}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{exportItem.filename}</p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatDate(exportItem.createdAt)}</span>
                      <span>•</span>
                      <span>{exportItem.totalRecords} records</span>
                      <span>•</span>
                      <span>{exportItem.fileSize}</span>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Filters: {formatFilters(exportItem.filters)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {exportItem.status === 'completed' ? (
                    <Button variant="outline" size="sm" onClick={() => handleDownload(exportItem)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  ) : exportItem.status === 'expired' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerate(exportItem)}
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Regenerate
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Processing...
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockExportHistory.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileSpreadsheet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exports yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your export history will appear here after you create your first export
            </p>
            <Button variant="outline">Create Your First Export</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
