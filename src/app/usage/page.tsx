'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, BarChart3, MapPin } from 'lucide-react';

export default function UsageTrackingPage() {
  const [quilts, setQuilts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiltId, setSelectedQuiltId] = useState<string>('');
  const { t } = useLanguage();

  useEffect(() => {
    fetch('/api/quilts')
      .then(res => res.json())
      .then(data => {
        setQuilts(data.quilts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const selectedQuilt = quilts.find(q => q.id === selectedQuiltId);

  const stats = {
    totalQuilts: quilts.length,
    quiltsInUse: quilts.filter(q => q.currentStatus === 'IN_USE').length,
    available: quilts.filter(q => q.currentStatus === 'AVAILABLE').length,
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('usage.title')}</h1>
        <p className="text-gray-500">{t('usage.subtitle')}</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalQuilts}</p>
                <p className="text-sm text-gray-600">{t('dashboard.stats.totalQuilts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.quiltsInUse}</p>
                <p className="text-sm text-gray-600">{t('dashboard.stats.inUse')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.available}</p>
                <p className="text-sm text-gray-600">{t('dashboard.stats.available')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quilt Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t('usage.selection.title')}</CardTitle>
          <CardDescription>{t('usage.selection.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quilts.map(quilt => (
              <div
                key={quilt.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedQuiltId === quilt.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedQuiltId(quilt.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">
                    #{quilt.itemNumber} {quilt.name}
                  </h3>
                  <Badge
                    variant={quilt.currentStatus === 'IN_USE' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {t(`status.${quilt.currentStatus}`)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {quilt.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Quilt Details */}
      {selectedQuilt ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedQuilt.name} - {t('usage.details.title')}
            </CardTitle>
            <CardDescription>
              {t('quilts.table.itemNumber')} #{selectedQuilt.itemNumber}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">{t('quilts.table.status')}</p>
                <p className="font-medium">{t(`status.${selectedQuilt.currentStatus}`)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('quilts.table.location')}</p>
                <p className="font-medium">{selectedQuilt.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('quilts.table.season')}</p>
                <p className="font-medium">{t(`season.${selectedQuilt.season}`)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('quilts.table.material')}</p>
                <p className="font-medium">{selectedQuilt.fillMaterial}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">{t('usage.details.actions')}</h3>
              <div className="flex gap-2">
                {selectedQuilt.currentStatus === 'AVAILABLE' ? (
                  <Button>{t('usage.actions.startUsing')}</Button>
                ) : selectedQuilt.currentStatus === 'IN_USE' ? (
                  <Button variant="outline">{t('usage.actions.endUsage')}</Button>
                ) : (
                  <Button disabled>{t('usage.actions.notAvailable')}</Button>
                )}
              </div>
            </div>

            {selectedQuilt.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">{t('usage.labels.notes')}</p>
                <p className="text-sm">{selectedQuilt.notes}</p>
              </div>
            )}

            {/* Usage History */}
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-3">{t('usage.details.history')}</h3>
              {selectedQuilt.usagePeriods && selectedQuilt.usagePeriods.length > 0 ? (
                <div className="space-y-2">
                  {selectedQuilt.usagePeriods.map((period: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">
                            {t('usage.labels.usagePeriod')} #{selectedQuilt.usagePeriods.length - index}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {t('usage.labels.started')}: {new Date(period.startDate).toLocaleDateString()}
                          </p>
                          {period.endDate && (
                            <p className="text-xs text-gray-600">
                              {t('usage.labels.ended')}: {new Date(period.endDate).toLocaleDateString()}
                            </p>
                          )}
                          {period.notes && (
                            <p className="text-xs text-gray-700 mt-1">{period.notes}</p>
                          )}
                        </div>
                        {!period.endDate && (
                          <Badge variant="default" className="text-xs">
                            {t('usage.labels.active')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('usage.details.noHistory')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {t('usage.selection.prompt')}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
