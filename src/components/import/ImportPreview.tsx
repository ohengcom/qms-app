'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/trpc';
import { FileSpreadsheet, AlertTriangle, CheckCircle, Eye, Upload, Loader2 } from 'lucide-react';

interface ImportPreviewProps {
  fileName: string;
  fileData: string;
  onPreviewComplete: (preview: any) => void;
  onImportComplete: (results: any) => void;
}

export function ImportPreview({
  fileName,
  fileData,
  onPreviewComplete,
  onImportComplete,
}: ImportPreviewProps) {
  const [preview, setPreview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const { success, error } = useToast();

  // Get preview data
  const previewMutation = api.importExport.previewImport.useMutation({
    onSuccess: data => {
      setPreview(data.preview);
      onPreviewComplete(data.preview);
      setIsLoading(false);
    },
    onError: err => {
      error('Preview failed', err.message);
      setIsLoading(false);
    },
  });

  // Confirm import
  const confirmMutation = api.importExport.confirmImport.useMutation({
    onSuccess: data => {
      success('Import completed', `Successfully imported ${data.result.imported} quilts`);
      onImportComplete(data.result);
      setIsImporting(false);
    },
    onError: err => {
      error('Import failed', err.message);
      setIsImporting(false);
    },
  });

  useEffect(() => {
    previewMutation.mutate({ fileName, fileData });
  }, [fileName, fileData]);

  const handleConfirmImport = () => {
    setIsImporting(true);
    confirmMutation.mutate({ fileName, fileData, confirmed: true });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-lg font-medium">Analyzing Excel file...</p>
            <p className="text-sm text-gray-600">
              Please wait while we process your file and generate a preview
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preview) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-8 w-8 mx-auto text-red-600" />
            <p className="text-lg font-medium">Failed to preview file</p>
            <p className="text-sm text-gray-600">
              There was an error processing your Excel file. Please check the file format and try
              again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Import Preview
          </CardTitle>
          <CardDescription>Review the data that will be imported from {fileName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{preview.summary?.totalRows || 0}</p>
              <p className="text-sm text-gray-600">Total Rows</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {(preview.summary?.totalRows || 0) - (preview.errors?.length || 0)}
              </p>
              <p className="text-sm text-gray-600">Valid Rows</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{preview.errors?.length || 0}</p>
              <p className="text-sm text-gray-600">Errors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {preview.summary?.duplicates || 0}
              </p>
              <p className="text-sm text-gray-600">Duplicates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {preview.errors && preview.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Import Errors ({preview.errors.length})
            </CardTitle>
            <CardDescription>
              The following rows have errors and will be skipped during import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {preview.errors.slice(0, 10).map((error: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Row {error.row}: {error.message}
                    </p>
                    {error.field && (
                      <p className="text-xs text-red-600 mt-1">Field: {error.field}</p>
                    )}
                  </div>
                </div>
              ))}
              {preview.errors.length > 10 && (
                <p className="text-sm text-gray-600 text-center">
                  ... and {preview.errors.length - 10} more errors
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Data */}
      {preview.preview && preview.preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Data Preview
            </CardTitle>
            <CardDescription>
              First few rows that will be imported (showing up to 5 rows)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Item #</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Season</th>
                    <th className="text-left p-2">Color</th>
                    <th className="text-left p-2">Brand</th>
                    <th className="text-left p-2">Location</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.slice(0, 5).map((row: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{row.itemNumber}</td>
                      <td className="p-2">{row.name}</td>
                      <td className="p-2">
                        <Badge variant="outline">{row.season}</Badge>
                      </td>
                      <td className="p-2">{row.color || '-'}</td>
                      <td className="p-2">{row.brand || '-'}</td>
                      <td className="p-2">{row.location || '-'}</td>
                      <td className="p-2">
                        <Badge variant="secondary">Ready to Import</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Confirm Import
          </CardTitle>
          <CardDescription>
            {preview.errors && preview.errors.length > 0
              ? `${(preview.summary?.totalRows || 0) - preview.errors.length} valid rows will be imported. ${preview.errors.length} rows with errors will be skipped.`
              : `All ${preview.summary?.totalRows || 0} rows are ready to be imported.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              onClick={handleConfirmImport}
              disabled={
                isImporting ||
                (preview.summary?.totalRows || 0) - (preview.errors?.length || 0) === 0
              }
              className="flex-1"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Confirm Import
                </>
              )}
            </Button>

            <Button variant="outline" onClick={() => window.location.reload()}>
              Cancel
            </Button>
          </div>

          {preview.errors && preview.errors.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Some rows contain errors and will be skipped. You can fix these issues in your Excel
                file and import again later.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
