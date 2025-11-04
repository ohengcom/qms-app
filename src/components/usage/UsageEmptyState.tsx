'use client';

import { Calendar, History, Package } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { useLanguage } from '@/lib/language-provider';

interface UsageEmptyStateProps {
  type: 'no-active-usage' | 'no-history' | 'no-quilt-selected';
  onStartUsing?: () => void;
  onSelectQuilt?: () => void;
}

export function UsageEmptyState({ type, onStartUsing, onSelectQuilt }: UsageEmptyStateProps) {
  const { t } = useLanguage();

  if (type === 'no-active-usage') {
    return (
      <EmptyState
        icon={Calendar}
        title={t('usage.noActiveUsage')}
        description={
          t('language') === 'zh'
            ? '当前没有正在使用的被子。开始使用一床被子来追踪使用情况。'
            : 'No quilts are currently in use. Start using a quilt to track its usage.'
        }
        action={
          onStartUsing
            ? {
                label: t('usage.actions.startUsing'),
                onClick: onStartUsing,
              }
            : undefined
        }
      />
    );
  }

  if (type === 'no-history') {
    return (
      <EmptyState
        icon={History}
        title={t('usage.noUsageHistory')}
        description={t('usage.noUsageHistoryDescription')}
        size="sm"
      />
    );
  }

  if (type === 'no-quilt-selected') {
    return (
      <EmptyState
        icon={Package}
        title={t('usage.selection.title')}
        description={t('usage.selection.prompt')}
        action={
          onSelectQuilt
            ? {
                label: t('common.viewDetails'),
                onClick: onSelectQuilt,
                variant: 'outline',
              }
            : undefined
        }
      />
    );
  }

  return null;
}
