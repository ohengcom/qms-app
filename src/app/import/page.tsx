'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ImportUpload } from '@/components/import/ImportUpload';
// Import components dynamically to avoid TypeScript issues
import dynamic from 'next/dynamic';

const ImportPreview = dynamic(() => import('@/components/import/ImportPreview').then(mod => ({ default: mod.ImportPreview })), {
  loading: () => <div>Loading preview...</div>
});

const ImportResults = dynamic(() => import('@/components/import/ImportResults').then(mod => ({ default: mod.ImportResults })), {
  loading: () => <div>Loading results...</div>
});
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';

type ImportStep = 'upload' | 'preview' | 'results';

interface ImportData {
  fileName: string;
  fileData: string; // Base64 encoded
  preview?: any;
  results?: any;
}

export default function ImportPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [importData, setImportData] = useState<ImportData | null>(null);

  const handleFileUpload = (fileName: string, fileData: string) => {
    setImportData({ fileName, fileData });
    setCurrentStep('preview');
  };

  const handlePreviewComplete = (preview: any) => {
    if (importData) {
      setImportData({ ...importData, preview });
    }
  };

  const handleImportComplete = (results: any) => {
    if (importData) {
      setImportData({ ...importData, results });
    }
    setCurrentStep('results');
  };

  const handleStartOver = () => {
    setImportData(null);
    setCurrentStep('upload');
  };

  const handleGoToDashboard = () => {
    router.push('/');
  };

  const getStepIcon = (step: ImportStep) => {
    switch (step) {
      case 'upload':
        return <Upload className="h-5 w-5" />;
      case 'preview':
        return <FileSpreadsheet className="h-5 w-5" />;
      case 'results':
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getStepStatus = (step: ImportStep) => {
    if (step === currentStep) return 'current';
    if (
      (step === 'upload' && ['preview', 'results'].includes(currentStep)) ||
      (step === 'preview' && currentStep === 'results')
    ) {
      return 'completed';
    }
    return 'upcoming';
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Import Quilts"
        description="Import quilt data from Excel files"
      >
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Import Process</CardTitle>
          <CardDescription>
            Follow these steps to import your quilt data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {(['upload', 'preview', 'results'] as ImportStep[]).map((step, index) => {
              const status = getStepStatus(step);
              return (
                <div key={step} className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        status === 'completed'
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : status === 'current'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-gray-100 border-gray-300 text-gray-500'
                      }`}
                    >
                      {getStepIcon(step)}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{step}</p>
                      <Badge
                        variant={
                          status === 'completed'
                            ? 'default'
                            : status === 'current'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs"
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-16 h-0.5 mx-4 ${
                        status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <ImportUpload onFileUpload={handleFileUpload} />
      )}

      {currentStep === 'preview' && importData && (
        <ImportPreview
          fileName={importData.fileName}
          fileData={importData.fileData}
          onPreviewComplete={handlePreviewComplete}
          onImportComplete={handleImportComplete}
        />
      )}

      {currentStep === 'results' && importData?.results && (
        <ImportResults
          results={importData.results}
          fileName={importData.fileName}
          onStartOver={handleStartOver}
          onGoToDashboard={handleGoToDashboard}
        />
      )}
    </div>
  );
}