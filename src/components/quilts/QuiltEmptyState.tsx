'use client';

import { Package, Search, Filter } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { useLanguage } from '@/lib/language-provider';

interface QuiltEmptyStateProps {
  type: 'no-quilts' | 'no-results' | 'no-filtered-results';
  onAddQuilt?: () => void;
  onClearFilters?: () => void;
}

export function QuiltEmptyState({ type, onAddQuilt, onClearFilters }: QuiltEmptyStateProps) {
  const { t } = useLanguage();

  if (type === 'no-quilts') {
    return (
      <EmptyState
        icon={Package}
        title={t('quilts.messages.noQuiltsFound')}
        description={t('quilts.messages.noQuiltsDescription') || t('emptyStates.addFirstQuilt')}
        action={
          onAddQuilt
            ? {
                label: t('quilts.actions.add'),
                onClick: onAddQuilt,
              }
            : undefined
        }
      />
    );
  }

  if (type === 'no-results') {
    return (
      <EmptyState
        icon={Search}
        title={t('quilts.messages.noQuiltsFound')}
        description={t('emptyStates.tryAdjustingFilters')}
      />
    );
  }

  if (type === 'no-filtered-results') {
    return (
      <EmptyState
        icon={Filter}
        title={t('quilts.messages.noQuiltsFound')}
        description={t('emptyStates.tryAdjustingFilters')}
        action={
          onClearFilters
            ? {
                label: t('common.clear'),
                onClick: onClearFilters,
                variant: 'outline',
              }
            : undefined
        }
        secondaryAction={
          onAddQuilt
            ? {
                label: t('quilts.actions.add'),
                onClick: onAddQuilt,
              }
            : undefined
        }
      />
    );
  }

  return null;
}
