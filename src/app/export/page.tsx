'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExportOptions } from '@/components/export/ExportOptions';
import { ExportHistory } from '@/components/export/ExportHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileSpreadsheet, Calendar, Settings } from 'lucide-react';

export default function ExportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('quilts');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Export Data"
        description="Export your quilt collection and reports to Excel files"
      >
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      {/* Export Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSpreadsheet className="mr-2 h-5 w-5 text-blue-600" />
              Quilt Collection
            </CardTitle>
            <CardDescription>Export your complete quilt inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Export all quilts with details, usage history, and maintenance records
            </p>
            <Button variant="outline" className="w-full" onClick={() => setActiveTab('quilts')}>
              <Download className="mr-2 h-4 w-4" />
              Export Quilts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
              Usage Reports
            </CardTitle>
            <CardDescription>Export usage analytics and patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Generate reports for specific date ranges and usage patterns
            </p>
            <Button variant="outline" className="w-full" onClick={() => setActiveTab('usage')}>
              <Download className="mr-2 h-4 w-4" />
              Export Usage
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5 text-purple-600" />
              Maintenance Reports
            </CardTitle>
            <CardDescription>Export maintenance history and schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Track maintenance activities and upcoming service needs
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setActiveTab('maintenance')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Maintenance
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Export Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quilts">Quilts</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="quilts" className="space-y-6">
          <ExportOptions type="quilts" />
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <ExportOptions type="usage" />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <ExportOptions type="maintenance" />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ExportHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
