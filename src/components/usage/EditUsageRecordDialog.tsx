'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-provider';
import { Edit, Trash2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/lib/toast';

interface UsageRecord {
  id: string;
  quilt_id?: string;
  quiltId?: string;
  start_date?: string;
  startedAt?: string;
  end_date?: string | null;
  endedAt?: string | null;
  usage_type?: string;
  usageType?: string;
  notes?: string | null;
  quilt_name?: string;
  quiltName?: string;
  item_number?: string | number;
  itemNumber?: string | number;
  color?: string;
  isActive?: boolean;
}

interface EditUsageRecordDialogProps {
  record: UsageRecord;
  onUpdate?: () => void;
  onDelete?: () => void;
  trigger?: React.ReactNode;
}

const USAGE_TYPE_OPTIONS = [
  { value: 'REGULAR', key: 'regularuse' },
  { value: 'GUEST', key: 'guestuse' },
  { value: 'SPECIAL_OCCASION', key: 'specialoccasion' },
  { value: 'SEASONAL_ROTATION', key: 'seasonalrotation' },
];

export function EditUsageRecordDialog({
  record,
  onUpdate,
  onDelete,
  trigger,
}: EditUsageRecordDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { language, t } = useLanguage();

  // Normalize record data
  const startDate = record.start_date || record.startedAt || '';
  const endDate = record.end_date || record.endedAt || null;
  const usageType = record.usage_type || record.usageType || 'REGULAR';
  const notes = record.notes || '';
  const quiltName = record.quilt_name || record.quiltName || '';
  const itemNumber = record.item_number || record.itemNumber || '';
  const isActive = record.isActive ?? !endDate;

  const [formData, setFormData] = useState({
    startDate: startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '',
    endDate: endDate ? format(new Date(endDate), 'yyyy-MM-dd') : '',
    usageType: usageType,
    notes: notes || '',
  });

  // Update form data when record changes
  useEffect(() => {
    setFormData({
      startDate: startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '',
      endDate: endDate ? format(new Date(endDate), 'yyyy-MM-dd') : '',
      usageType: usageType,
      notes: notes || '',
    });
  }, [record, startDate, endDate, usageType, notes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate dates
      if (formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
        toast.error(t('usage.edit.dateError'));
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/usage-records/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          usageType: formData.usageType,
          notes: formData.notes || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t('usage.edit.updated'));
        setOpen(false);
        onUpdate?.();
      } else {
        toast.error(result.error || t('usage.edit.updateFailed'));
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(t('usage.edit.updateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/usage-records/${record.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t('usage.edit.deleted'));
        setOpen(false);
        onDelete?.();
      } else {
        toast.error(result.error || t('usage.edit.deleteFailed'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('usage.edit.deleteFailed'));
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('usage.edit.title')}</DialogTitle>
          <DialogDescription>
            {quiltName && (
              <span className="font-medium">
                {quiltName}
                {itemNumber && ` (#${itemNumber})`}
              </span>
            )}
            {isActive && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {t('usage.labels.active')}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">{t('usage.edit.startDate')} *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? (
                    format(new Date(formData.startDate), 'PPP')
                  ) : (
                    <span>{t('usage.edit.pickDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.startDate ? new Date(formData.startDate) : undefined}
                  onSelect={(date) => {
                    setFormData({
                      ...formData,
                      startDate: date ? format(date, 'yyyy-MM-dd') : '',
                    });
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">
              {t('usage.edit.endDate')}
              <span className="ml-2 text-xs text-gray-500">
                ({t('usage.edit.leaveEmptyIfActive')})
              </span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? (
                    format(new Date(formData.endDate), 'PPP')
                  ) : (
                    <span>{t('usage.edit.pickDateOptional')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.endDate ? new Date(formData.endDate) : undefined}
                  onSelect={(date) => {
                    setFormData({
                      ...formData,
                      endDate: date ? format(date, 'yyyy-MM-dd') : '',
                    });
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formData.endDate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData({ ...formData, endDate: '' })}
                className="text-xs"
              >
                {t('common.clear')}
              </Button>
            )}
          </div>

          {/* Usage Type */}
          <div className="space-y-2">
            <Label htmlFor="usageType">{t('usage.edit.usageType')}</Label>
            <Select
              value={formData.usageType}
              onValueChange={(value) => setFormData({ ...formData, usageType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('usage.edit.selectUsageType')} />
              </SelectTrigger>
              <SelectContent>
                {USAGE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`usage.edit.${option.key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('usage.edit.notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('usage.edit.addNotes')}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <div>
              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete')}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {t('usage.edit.confirmDelete')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('usage.edit.saving') : t('usage.edit.saveChanges')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
