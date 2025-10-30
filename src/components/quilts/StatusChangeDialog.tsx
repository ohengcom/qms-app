'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quilt?: any;
  onStatusChange: (quiltId: string, newStatus: string) => Promise<void>;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  quilt,
  onStatusChange,
}: StatusChangeDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(quilt?.currentStatus || 'STORAGE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quilt) return;

    setLoading(true);
    try {
      await onStatusChange(quilt.id, newStatus);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating status:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_USE':
        return 'text-green-600';
      case 'STORAGE':
        return 'text-orange-600';
      case 'MAINTENANCE':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('quilts.dialogs.changeStatus')}</DialogTitle>
          <DialogDescription>
            {t('language') === 'zh'
              ? `更改被子 "${quilt?.name}" 的状态`
              : `Change status for quilt "${quilt?.name}"`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('quilts.dialogs.currentStatus')}</Label>
            <div className={`text-sm font-medium ${getStatusColor(quilt?.currentStatus)}`}>
              {t(`status.${quilt?.currentStatus}`)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newStatus">{t('quilts.dialogs.newStatus')}</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_USE">
                  <span className="text-green-600">{t('status.IN_USE')}</span>
                </SelectItem>
                <SelectItem value="STORAGE">
                  <span className="text-orange-600">{t('status.STORAGE')}</span>
                </SelectItem>
                <SelectItem value="MAINTENANCE">
                  <span className="text-yellow-600">{t('status.MAINTENANCE')}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading || newStatus === quilt?.currentStatus}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
