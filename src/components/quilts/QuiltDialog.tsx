'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// Dynamically import ImageUpload to avoid SSR issues
const ImageUpload = dynamic(() => import('./ImageUpload').then(mod => ({ default: mod.ImageUpload })), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500">加载图片上传组件...</div>,
});

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
    season: 'WINTER',
    lengthCm: '200',
    widthCm: '180',
    weightGrams: '1000',
    fillMaterial: '棉',
    materialDetails: '',
    color: '白',
    brand: '无品牌',
    location: '未存储',
    currentStatus: 'STORAGE',
    notes: '',
  });
  const [images, setImages] = useState<string[]>([]);

  // Generate preview name based on form data
  const generatePreviewName = () => {
    const brand = formData.brand || '无';
    const color = formData.color || '白';
    const weight = formData.weightGrams || '2000';

    const seasonMap: Record<string, string> = {
      WINTER: '冬',
      SPRING_AUTUMN: '春秋',
      SUMMER: '夏',
    };
    const season = seasonMap[formData.season] || '通用';

    return `${brand}${color}${weight}克${season}被`;
  };

  // Reset form when dialog opens/closes or quilt changes
  useEffect(() => {
    if (open) {
      if (quilt) {
        // Edit mode - populate with existing data
        setFormData({
          season: quilt.season || 'WINTER',
          lengthCm: quilt.lengthCm?.toString() || '',
          widthCm: quilt.widthCm?.toString() || '',
          weightGrams: quilt.weightGrams?.toString() || '',
          fillMaterial: quilt.fillMaterial || '',
          materialDetails: quilt.materialDetails || '',
          color: quilt.color || '',
          brand: quilt.brand || '',
          location: quilt.location || '',
          currentStatus: quilt.currentStatus || 'MAINTENANCE',
          notes: quilt.notes || '',
        });
        // Load existing images
        const existingImages: string[] = [];
        if (quilt.mainImage) {
          // Check if mainImage starts with data: prefix
          const imageData = quilt.mainImage.startsWith('data:') 
            ? quilt.mainImage 
            : `data:image/jpeg;base64,${quilt.mainImage}`;
          existingImages.push(imageData);
        }
        if (quilt.attachmentImages && Array.isArray(quilt.attachmentImages)) {
          // Ensure all attachment images have data: prefix
          const attachments = quilt.attachmentImages.map((img: string) => 
            img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`
          );
          existingImages.push(...attachments);
        }
        setImages(existingImages);
      } else {
        // Add mode - reset to defaults with STORAGE status
        setFormData({
          season: 'WINTER',
          lengthCm: '200',
          widthCm: '180',
          weightGrams: '1000',
          fillMaterial: '棉',
          materialDetails: '',
          color: '白',
          brand: '无品牌',
          location: '未存储',
          currentStatus: 'STORAGE',
          notes: '',
        });
        setImages([]);
      }
    }
  }, [open, quilt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = {
        ...formData,
        lengthCm: parseFloat(formData.lengthCm) || 0,
        widthCm: parseFloat(formData.widthCm) || 0,
        weightGrams: parseFloat(formData.weightGrams) || 0,
      };

      // Always include image fields to handle deletion
      if (images.length > 0) {
        data.mainImage = images[0];
        data.attachmentImages = images.length > 1 ? images.slice(1) : [];
      } else {
        // Explicitly set to null to clear images from database
        data.mainImage = null;
        data.attachmentImages = [];
      }

      if (quilt) {
        // Edit mode - include ID (name and itemNumber are read-only in edit mode)
        await onSave({
          ...data,
          id: quilt.id,
          name: quilt.name,
          itemNumber: quilt.itemNumber,
        });
      } else {
        // Add mode - backend will generate name and itemNumber
        await onSave(data);
      }

      onOpenChange(false);
    } catch (error) {
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
            {quilt ? t('quilts.dialogs.editTitle') : t('quilts.dialogs.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {quilt ? t('quilts.dialogs.editDesc') : t('quilts.dialogs.addDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Show auto-generated name preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4">
              {quilt && (
                <div>
                  <Label className="text-xs text-blue-600">{t('quilts.table.itemNumber')}</Label>
                  <p className="text-sm font-medium text-gray-900">#{quilt.itemNumber}</p>
                </div>
              )}
              <div className={quilt ? '' : 'col-span-2'}>
                <Label className="text-xs text-blue-600">
                  {quilt ? t('quilts.form.name') : '预览名称（自动生成）'}
                </Label>
                <p className="text-sm font-medium text-gray-900">
                  {quilt ? quilt.name : generatePreviewName()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Season and Location in one row */}
            <div className="space-y-1.5">
              <Label htmlFor="season">{t('quilts.table.season')}</Label>
              <Select
                value={formData.season}
                onValueChange={value => handleInputChange('season', value)}
              >
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

            <div className="space-y-1.5">
              <Label htmlFor="location">存放位置</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                placeholder={t('quilts.form.locationPlaceholder')}
              />
            </div>

            {/* Dimensions */}
            <div className="space-y-1.5">
              <Label htmlFor="lengthCm">长度 (cm)</Label>
              <Input
                id="lengthCm"
                type="number"
                step="1"
                value={formData.lengthCm}
                onChange={e => handleInputChange('lengthCm', e.target.value)}
                placeholder="200"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="widthCm">宽度 (cm)</Label>
              <Input
                id="widthCm"
                type="number"
                step="1"
                value={formData.widthCm}
                onChange={e => handleInputChange('widthCm', e.target.value)}
                placeholder="150"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weightGrams">重量 (g)</Label>
              <Input
                id="weightGrams"
                type="number"
                step="1"
                value={formData.weightGrams}
                onChange={e => handleInputChange('weightGrams', e.target.value)}
                placeholder="2000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="color">{t('quilts.form.color')}</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={e => handleInputChange('color', e.target.value)}
                placeholder={t('quilts.form.colorPlaceholder')}
              />
            </div>

            {/* Material Information */}
            <div className="space-y-1.5">
              <Label htmlFor="fillMaterial">填充材料</Label>
              <Input
                id="fillMaterial"
                value={formData.fillMaterial}
                onChange={e => handleInputChange('fillMaterial', e.target.value)}
                placeholder={t('quilts.form.materialPlaceholder')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand">{t('quilts.form.brand')}</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={e => handleInputChange('brand', e.target.value)}
                placeholder={t('quilts.form.brandPlaceholder')}
              />
            </div>
          </div>

          {/* Additional Details - Material Details and Notes in one row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="materialDetails">{t('quilts.form.materialDetails')}</Label>
              <Textarea
                id="materialDetails"
                value={formData.materialDetails}
                onChange={e => handleInputChange('materialDetails', e.target.value)}
                placeholder={t('quilts.form.materialDetailsPlaceholder')}
                rows={1}
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">{t('common.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                placeholder={t('quilts.form.notesPlaceholder')}
                rows={1}
                className="min-h-[60px]"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="border-t pt-3 mt-3">
            <div className="mb-3">
              <Label className="text-base font-semibold">被子图片</Label>
              <p className="text-xs text-gray-500 mt-0.5">
                上传被子的照片，第一张将作为主图显示。拖动图片可以调整顺序。
              </p>
            </div>
            <ImageUpload 
              images={images} 
              onImagesChange={setImages} 
              maxImages={5} 
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
