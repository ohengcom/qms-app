'use client';

import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { Upload, FileSpreadsheet, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportUploadProps {
  onFileUpload: (fileName: string, fileData: string) => void;
}

export function ImportUpload({ onFileUpload }: ImportUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { success, error } = useToast();

  const handleFileRead = useCallback(
    (file: File) => {
      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          onFileUpload(file.name, base64);
          success('File uploaded', `${file.name} has been uploaded successfully`);
        } catch (err) {
          error('Upload failed', 'Failed to process the uploaded file');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        error('Upload failed', 'Failed to read the uploaded file');
        setIsUploading(false);
      };

      reader.readAsArrayBuffer(file);
    },
    [onFileUpload, success, error]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
        error('Invalid file type', 'Please select an Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        error('File too large', 'Please select a file smaller than 10MB');
        return;
      }

      handleFileRead(file);
    },
    [handleFileRead, error]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect]
  );

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload Excel File
          </CardTitle>
          <CardDescription>
            Select or drag and drop your Excel file containing quilt data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
              isUploading && 'opacity-50 pointer-events-none'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileSpreadsheet className="h-8 w-8 text-gray-600" />
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isUploading ? 'Processing file...' : 'Drop your Excel file here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to browse and select a file</p>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Select File'}
                </Button>
              </div>

              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5" />
            File Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Supported formats</p>
                <p className="text-sm text-gray-600">Excel files (.xlsx, .xls)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Maximum file size</p>
                <p className="text-sm text-gray-600">10MB per file</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Expected columns</p>
                <p className="text-sm text-gray-600">
                  The system will automatically detect and map columns from your Excel file. Common
                  columns include: Item Number, Name, Season, Color, Brand, Location, etc.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-amber-600" />
            Import Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Make sure your Excel file has a header row with column names</p>
            <p>• Item numbers should be unique for each quilt</p>
            <p>
              • Season values should be one of: Winter, Summer, Spring/Autumn (or Chinese
              equivalents)
            </p>
            <p>• Dates should be in a standard format (YYYY/MM/DD or MM/DD/YYYY)</p>
            <p>• The system will show you a preview before importing any data</p>
            <p>• You can review and fix any errors before confirming the import</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
