'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createQuiltSchema, updateQuiltSchema } from '@/lib/validations/quilt';
import type { CreateQuiltInput, UpdateQuiltInput } from '@/lib/validations/quilt';
import { useCreateQuilt, useUpdateQuilt } from '@/hooks/useQuilts';
import { useToastContext } from '@/hooks/useToast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Ruler, 
  Palette, 
  FileText,
  Upload,
  X,
  Save,
  Check,
  Trash2
} from 'lucide-react';

export interface QuiltFormProps {
  initialData?: any; // Quilt data for editing
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormStep = 'basic' | 'specifications' | 'details' | 'images';

const FORM_STEPS = [
  {
    id: 'basic' as FormStep,
    title: 'Basic Information',
    description: 'Essential quilt details',
    icon: Package,
  },
  {
    id: 'specifications' as FormStep,
    title: 'Specifications',
    description: 'Size, weight, and materials',
    icon: Ruler,
  },
  {
    id: 'details' as FormStep,
    title: 'Details & Location',
    description: 'Colors, brand, and storage',
    icon: Palette,
  },
  {
    id: 'images' as FormStep,
    title: 'Images & Notes',
    description: 'Photos and additional info',
    icon: FileText,
  },
];

const SEASON_OPTIONS = [
  { value: 'WINTER', label: 'Winter', description: 'Heavy quilts for cold weather' },
  { value: 'SPRING_AUTUMN', label: 'Spring/Autumn', description: 'Medium weight for transitional seasons' },
  { value: 'SUMMER', label: 'Summer', description: 'Light quilts for warm weather' },
];

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available', description: 'Ready for use' },
  { value: 'IN_USE', label: 'In Use', description: 'Currently being used' },
  { value: 'STORAGE', label: 'Storage', description: 'Stored away' },
  { value: 'MAINTENANCE', label: 'Maintenance', description: 'Needs care or repair' },
];

const COMMON_MATERIALS = [
  'Down', 'Goose Down', 'Duck Down', 'Synthetic Down',
  'Cotton', 'Organic Cotton', 'Bamboo Fiber', 'Wool',
  'Polyester', 'Microfiber', 'Silk', 'Linen'
];

const COMMON_BRANDS = [
  'IKEA', 'Muji', 'Uniqlo', 'Nordic Dreams', 'Comfy Home',
  'Sleep Well', 'Cozy Nights', 'Premium Bedding', 'Home Collection'
];

const COMMON_COLORS = [
  'White', 'Cream', 'Light Blue', 'Navy Blue', 'Gray', 'Light Gray',
  'Beige', 'Pink', 'Light Pink', 'Green', 'Light Green', 'Yellow'
];

const COMMON_LOCATIONS = [
  'Master Bedroom Closet', 'Guest Room Closet', 'Linen Closet',
  'Storage Room', 'Under Bed Storage', 'Wardrobe', 'Attic Storage'
];

export function QuiltForm({ initialData, onSuccess, onCancel }: QuiltFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set());
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  
  const { success, error } = useToastContext();
  const createMutation = useCreateQuilt();
  const updateMutation = useUpdateQuilt();
  
  const mode = initialData ? 'edit' : 'create';
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    resolver: zodResolver(createQuiltSchema),
    defaultValues: initialData || {
      itemNumber: 0,
      name: '',
      season: 'WINTER' as const,
      lengthCm: 200,
      widthCm: 150,
      weightGrams: 1500,
      fillMaterial: '',
      color: '',
      location: '',
      currentStatus: 'AVAILABLE' as const,
    },
    mode: 'onChange', // Enable real-time validation
  });

  const currentStepIndex = FORM_STEPS.findIndex(step => step.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === FORM_STEPS.length - 1;

  // Helper function to get fields for each step
  const getStepFields = useCallback((step: FormStep): string[] => {
    switch (step) {
      case 'basic':
        return ['itemNumber', 'groupId', 'name', 'season', 'color', 'location'];
      case 'specifications':
        return ['lengthCm', 'widthCm', 'weightGrams', 'fillMaterial', 'materialDetails'];
      case 'details':
        return ['brand', 'currentStatus', 'packagingInfo', 'purchaseDate'];
      case 'images':
        return ['notes', 'imageUrl', 'thumbnailUrl'];
      default:
        return [];
    }
  }, []);

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const stepFields = getStepFields(currentStep);
    const isValid = await form.trigger(stepFields);
    
    if (isValid) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    
    return isValid;
  }, [currentStep, form, getStepFields]);

  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && !isLastStep) {
      setCurrentStep(FORM_STEPS[currentStepIndex + 1].id);
    }
  }, [validateCurrentStep, isLastStep, currentStepIndex]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(FORM_STEPS[currentStepIndex - 1].id);
    }
  }, [isFirstStep, currentStepIndex]);

  const handleStepClick = useCallback(async (stepId: FormStep) => {
    const targetIndex = FORM_STEPS.findIndex(step => step.id === stepId);
    if (targetIndex < currentStepIndex || completedSteps.has(stepId)) {
      setCurrentStep(stepId);
    } else if (targetIndex === currentStepIndex + 1) {
      const isValid = await validateCurrentStep();
      if (isValid) {
        setCurrentStep(stepId);
      }
    }
  }, [currentStepIndex, completedSteps, validateCurrentStep]);

  const onSubmit = useCallback(async (data: any) => {
    try {
      const isValid = await validateCurrentStep();
      if (!isValid) return;

      if (mode === 'edit') {
        await updateMutation.mutateAsync({ ...data, id: initialData.id } as UpdateQuiltInput);
        success('Success', 'Quilt updated successfully!');
      } else {
        await createMutation.mutateAsync(data);
        success('Success', 'Quilt created successfully!');
      }
      
      onSuccess?.();
    } catch (err) {
      error('Error', mode === 'edit' ? 'Failed to update quilt' : 'Failed to create quilt');
    }
  }, [validateCurrentStep, mode, updateMutation, createMutation, success, error, onSuccess, initialData]);

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      if (!validTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only PNG, JPG, and WebP are allowed.`);
        return;
      }
      
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large. Maximum size is 5MB.`);
        return;
      }

      if (uploadedImages.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} images allowed.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...validFiles].slice(0, maxFiles));
      if (validFiles.length === 1) {
        success('Success', 'Image uploaded successfully');
      } else {
        success('Success', `${validFiles.length} images uploaded successfully`);
      }
    }

    if (errors.length > 0) {
      error('Upload Error', errors[0]);
    }
  }, [uploadedImages.length, success, error]);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {mode === 'create' ? 'Add New Quilt' : 'Edit Quilt'}
          </CardTitle>
          <CardDescription>
            {mode === 'create' 
              ? 'Add a new quilt to your collection with detailed information'
              : 'Update quilt information and specifications'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {FORM_STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = completedSteps.has(step.id);
              const isAccessible = index <= currentStepIndex || isCompleted;
              const hasErrors = form.formState.errors && getStepFields(step.id).some(field => 
                form.formState.errors[field]
              );
              
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.id)}
                    disabled={!isAccessible}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors min-w-0 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                        : isCompleted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : hasErrors
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : isAccessible
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <step.icon className="h-4 w-4 flex-shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="font-medium text-sm truncate">{step.title}</div>
                      <div className="text-xs opacity-75 truncate">{step.description}</div>
                    </div>
                    {isCompleted && (
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">
                        <Check className="h-3 w-3" />
                      </Badge>
                    )}
                    {hasErrors && !isCompleted && (
                      <Badge variant="destructive" className="ml-2 flex-shrink-0">
                        !
                      </Badge>
                    )}
                  </button>
                  {index < FORM_STEPS.length - 1 && (
                    <ChevronRight className="h-4 w-4 mx-2 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 'basic' && (
            <BasicInformationStep form={form} />
          )}
          
          {currentStep === 'specifications' && (
            <SpecificationsStep form={form} />
          )}
          
          {currentStep === 'details' && (
            <AdditionalDetailsStep form={form} />
          )}

          {currentStep === 'images' && (
            <ImagesAndNotesStep 
              form={form} 
              uploadedImages={uploadedImages}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeImage}
            />
          )}

          {/* Navigation Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                
                <div className="flex gap-2">
                  {!isFirstStep && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  )}
                  
                  {!isLastStep ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Saving...' : mode === 'create' ? 'Create Quilt' : 'Update Quilt'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

// Step Components
function BasicInformationStep({ form }: { form: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Basic Information
        </CardTitle>
        <CardDescription>
          Essential details to identify and categorize your quilt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="itemNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Number *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Unique identifier for this quilt
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 1"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Optional grouping identifier
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quilt Name *</FormLabel>
              <FormControl>
                <AutoCompleteInput
                  placeholder="e.g., Premium Down Winter Quilt"
                  suggestions={[
                    'Premium Down Winter Quilt',
                    'Light Summer Comforter',
                    'Spring Autumn Blanket',
                    'Heavy Winter Duvet',
                    'Cotton Summer Quilt',
                    'Wool Winter Blanket'
                  ]}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A descriptive name for your quilt
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="season"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Season *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SEASON_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Primary season for this quilt
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color *</FormLabel>
                <FormControl>
                  <AutoCompleteInput
                    placeholder="e.g., White, Light Blue"
                    suggestions={COMMON_COLORS}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Primary color or pattern
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Location *</FormLabel>
              <FormControl>
                <AutoCompleteInput
                  placeholder="e.g., Master Bedroom Closet"
                  suggestions={COMMON_LOCATIONS}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Where this quilt is currently stored
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

function SpecificationsStep({ form }: { form: any }) {
  const lengthCm = form.watch('lengthCm');
  const widthCm = form.watch('widthCm');
  const weightGrams = form.watch('weightGrams');

  // Calculate area and weight per square meter for reference
  const areaSqM = lengthCm && widthCm ? (lengthCm * widthCm) / 10000 : 0;
  const weightPerSqM = areaSqM && weightGrams ? Math.round(weightGrams / areaSqM) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Specifications
        </CardTitle>
        <CardDescription>
          Physical properties and material composition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="lengthCm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Length (cm) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="200"
                    min="50"
                    max="300"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Typical: 200-220cm
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="widthCm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width (cm) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="150"
                    min="50"
                    max="250"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Typical: 150-180cm
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weightGrams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (g) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1500"
                    min="200"
                    max="5000"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Light: 800-1200g, Medium: 1200-2000g, Heavy: 2000g+
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Calculated Information */}
        {areaSqM > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Calculated Properties</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Area:</span>
                <span className="ml-2 font-medium">{areaSqM.toFixed(2)} m²</span>
              </div>
              {weightPerSqM > 0 && (
                <div>
                  <span className="text-blue-700">Weight per m²:</span>
                  <span className="ml-2 font-medium">{weightPerSqM} g/m²</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="fillMaterial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fill Material *</FormLabel>
                <FormControl>
                  <AutoCompleteInput
                    placeholder="e.g., Goose Down, Cotton, Wool"
                    suggestions={COMMON_MATERIALS}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Primary filling material
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="materialDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., 90% Goose Down, 10% Feathers, 233 thread count cotton shell"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Detailed material composition, thread count, fabric type
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AdditionalDetailsStep({ form }: { form: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Additional Details
        </CardTitle>
        <CardDescription>
          Brand information, purchase details, and status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <AutoCompleteInput
                    placeholder="e.g., Nordic Dreams"
                    suggestions={COMMON_BRANDS}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Manufacturer or brand name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                When you purchased this quilt (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="packagingInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Packaging Information</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Vacuum sealed bag, Cotton storage bag, Original box"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                How the quilt is packaged or stored
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

function ImagesAndNotesStep({ 
  form,
  uploadedImages,
  onImageUpload,
  onRemoveImage
}: { 
  form: any;
  uploadedImages: File[];
  onImageUpload: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onImageUpload(e.target.files);
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    onImageUpload(e.dataTransfer.files);
  }, [onImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Images & Notes
        </CardTitle>
        <CardDescription>
          Add photos and additional information about your quilt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Quilt Images</label>
            <span className="text-xs text-gray-500">
              {uploadedImages.length}/5 images
            </span>
          </div>
          
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : uploadedImages.length >= 5
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={() => uploadedImages.length < 5 && fileInputRef.current?.click()}
          >
            <Upload className={`h-8 w-8 mx-auto mb-2 ${
              uploadedImages.length >= 5 ? 'text-gray-300' : 'text-gray-400'
            }`} />
            <p className={`text-sm mb-1 ${
              uploadedImages.length >= 5 ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {uploadedImages.length >= 5 
                ? 'Maximum 5 images reached'
                : 'Click to upload or drag and drop images'
              }
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG up to 5MB each
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploadedImages.length >= 5}
          />

          {/* Image Preview */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedImages.map((file, index) => (
                <div key={`${file.name}-${index}`} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Quilt image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => {
                        // Clean up object URL to prevent memory leaks
                        URL.revokeObjectURL(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <p className="text-xs text-gray-500 mt-1 truncate px-1">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Notes Section */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information about this quilt..."
                  className="min-h-24 resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional notes about care instructions, history, or special features
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image URL Fields (for manual entry) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional direct image URL
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thumbnailUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/thumbnail.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional thumbnail image URL
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// AutoComplete Input Component
interface AutoCompleteInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  suggestions: string[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function AutoCompleteInput({ suggestions, value, onChange, ...props }: AutoCompleteInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange?.(e);

    if (inputValue.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions, onChange]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    const syntheticEvent = {
      target: { value: suggestion }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(syntheticEvent);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value || ''}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onFocus={() => {
          if (value && value.length > 0) {
            const filtered = suggestions.filter(suggestion =>
              suggestion.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
          }
        }}
        {...props}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-md last:rounded-b-md"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}