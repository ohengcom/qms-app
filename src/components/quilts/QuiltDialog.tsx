'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-provider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface QuiltDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quilt?: any;
  onSave: (data: any) => Promise<void>;
}

export function QuiltDialog({ open, onOpenChange, quilt, onSave }: QuiltDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    itemNumber: '',
    season: 'WINTER',
    lengthCm: '',
    widthCm: '',
    weightGrams: '',
    fillMaterial: '',
    materialDetails: '',
    color: '',
    brand: '',
    location: '',
    currentStatus: 'AVAILABLE',
    notes: '',
  });

  // Reset form when dialog opens/closes or quilt changes
  useEffect(() => {
    if (open) {
      if (quilt) {
        // Edit mode - populate with existing data
        setFormData({
          name: quilt.name || '',
          itemNumber: quilt.itemNumber?.toString() || '',
          season: quilt.season || 'WINTER',
          lengthCm: quilt.lengthCm?.toString() || '',
          widthCm: quilt.widthCm?.toString() || '',
          weightGrams: quilt.weightGrams?.toString() || '',
          fillMaterial: quilt.fillMaterial || '',
          materialDetails: quilt.materialDetails || '',
          color: quilt.color || '',
          brand: quilt.brand || '',
          location: quilt.location || '',
          currentStatus: quilt.currentStatus || 'AVAILABLE',
          notes: quilt.notes || '',
        });
      } else {
        // Add mode - reset to defaults
        setFormData({
          name: '',
          itemNumber: '',
          season: 'WINTER',
          lengthCm: '',
          widthCm: '',
          weightGrams: '',
          fillMaterial: '',
          materialDetails: '',
          color: '',
          brand: '',
          location: '',
          currentStatus: 'AVAILABLE',
          notes: '',
        });
      }
    }
  }, [open, quilt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        itemNumber: parseInt(formData.itemNumber) || 0,
        lengthCm: parseFloat(formData.lengthCm) || 0,
        widthCm: parseFloat(formData.widthCm) || 0,
        weightGrams: parseFloat(formData.weightGrams) || 0,
      };

      if (quilt) {
        // Edit mode - include ID
        await onSave({ ...data, id: quilt.id });
      } else {
        // Add mode
        await onSave(data);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving quilt:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {quilt ? t('common.edit') : t('quilts.actions.add')} {t('quilts.title')}
          </DialogTitle>
          <DialogDescription>
            {quilt 
              ? '修改被子信息 / Edit quilt information'
              : '添加新的被子到您的收藏 / Add a new quilt to your collection'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="name">被子名称 / Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="例如：冬季羽绒被 / e.g., Winter Down Comforter"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemNumber">编号 / Item Number *</Label>
              <Input
                id="itemNumber"
                type="number"
                value={formData.itemNumber}
                onChange={(e) => handleInputChange('itemNumber', e.target.value)}
                placeholder="001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">季节 / Season</Label>
              <Select value={formData.season} onValueChange={(value) => handleInputChange('season', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WINTER">{t('season.WINTER')}</SelectItem>
                  <SelectItem value="SPRING_AUTUMN">{t('season.SPRING_AUTUMN')}</SelectItem>
                  <SelectItem value="SUMMER">{t('season.SUMMER')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentStatus">状态 / Status</Label>
              <Select value={formData.currentStatus} onValueChange={(value) => handleInputChange('currentStatus', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">{t('status.AVAILABLE')}</SelectItem>
                  <SelectItem value="IN_USE">{t('status.IN_USE')}</SelectItem>
                  <SelectItem value="STORAGE">{t('status.STORAGE')}</SelectItem>
                  <SelectItem value="MAINTENANCE">{t('status.MAINTENANCE')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dimensions */}
            <div className="space-y-2">
              <Label htmlFor="lengthCm">长度 / Length (cm)</Label>
              <Input
                id="lengthCm"
                type="number"
                step="0.1"
                value={formData.lengthCm}
                onChange={(e) => handleInputChange('lengthCm', e.target.value)}
                placeholder="200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="widthCm">宽度 / Width (cm)</Label>
              <Input
                id="widthCm"
                type="number"
                step="0.1"
                value={formData.widthCm}
                onChange={(e) => handleInputChange('widthCm', e.target.value)}
                placeholder="150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightGrams">重量 / Weight (g)</Label>
              <Input
                id="weightGrams"
                type="number"
                step="1"
                value={formData.weightGrams}
                onChange={(e) => handleInputChange('weightGrams', e.target.value)}
                placeholder="2000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">颜色 / Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="白色 / White"
              />
            </div>

            {/* Material Information */}
            <div className="space-y-2">
              <Label htmlFor="fillMaterial">填充材料 / Fill Material</Label>
              <Input
                id="fillMaterial"
                value={formData.fillMaterial}
                onChange={(e) => handleInputChange('fillMaterial', e.target.value)}
                placeholder="羽绒 / Down"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">品牌 / Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="品牌名称 / Brand Name"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">存放位置 / Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="卧室衣柜 / Bedroom Closet"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="materialDetails">材料详情 / Material Details</Label>
            <Textarea
              id="materialDetails"
              value={formData.materialDetails}
              onChange={(e) => handleInputChange('materialDetails', e.target.value)}
              placeholder="详细的材料信息... / Detailed material information..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注 / Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="其他备注信息... / Additional notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {quilt ? t('common.save') : t('quilts.actions.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}