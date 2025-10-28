'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Season, QuiltStatus } from '@/lib/validations/quilt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { createQuiltSchema } from '@/lib/validations/quilt';
import type { CreateQuiltInput } from '@/lib/validations/quilt';
import { useCreateQuilt, useUpdateQuilt } from '@/hooks/useQuilts';
import { useToastContext } from '@/hooks/useToast';
import { Loading } from '@/components/ui/loading';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Ruler,
  Palette,
  FileText,
  X,
  Save,
} from 'lucide-react';

interface QuiltFormProps {
  initialData?: any; // Quilt data for editing
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FORM_STEPS = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Essential quilt details',
    icon: Package,
  },
  {
    id: 'specifications',
    title: 'Specifications',
    description: 'Size, weight, and materials',
    icon: Ruler,
  },
  {
    id: 'details',
    title: 'Details & Location',
    description: 'Colors, brand, and storage',
    icon: Palette,
  },
  {
    id: 'metadata',
    title: 'Additional Info',
    description: 'Notes and images',
    icon: FileText,
  },
];

const SEASON_OPTIONS = [
  { value: Season.WINTER, label: 'Winter', description: 'Heavy quilts for cold weather' },
  {
    value: Season.SPRING_AUTUMN,
    label: 'Spring/Autumn',
    description: 'Medium weight for transitional seasons',
  },
  { value: Season.SUMMER, label: 'Summer', description: 'Light quilts for warm weather' },
];

const STATUS_OPTIONS = [
  { value: QuiltStatus.AVAILABLE, label: 'Available', description: 'Ready for use' },
  { value: QuiltStatus.IN_USE, label: 'In Use', description: 'Currently being used' },
  { value: QuiltStatus.STORAGE, label: 'Storage', description: 'Stored away' },
  { value: QuiltStatus.MAINTENANCE, label: 'Maintenance', description: 'Needs care or repair' },
];

const COMMON_MATERIALS = [
  'Down',
  'Goose Down',
  'Duck Down',
  'Synthetic Down',
  'Cotton',
  'Organic Cotton',
  'Bamboo Fiber',
  'Wool',
  'Polyester',
  'Microfiber',
  'Silk',
  'Linen',
];

const COMMON_BRANDS = [
  'IKEA',
  'Muji',
  'Uniqlo',
  'Nitori',
  'Francfranc',
  'West Elm',
  'Pottery Barn',
  'Patagonia',
  'REI Co-op',
];

const COMMON_LOCATIONS = [
  'Master Bedroom',
  'Guest Room',
  'Living Room',
  'Bedroom Closet',
  'Linen Closet',
  'Storage Room',
  'Under Bed Storage',
  'Wardrobe',
];

export function QuiltForm({ initialData, onSuccess, onCancel }: QuiltFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isEditing = !!initialData;
  const toast = useToastContext();

  const createQuilt = useCreateQuilt();
  const updateQuilt = useUpdateQuilt();

  const form = useForm<CreateQuiltInput>({
    resolver: zodResolver(createQuiltSchema) as any,
    defaultValues: initialData || {
      itemNumber: 0,
      name: '',
      season: Season.SPRING_AUTUMN,
      lengthCm: 200,
      widthCm: 180,
      weightGrams: 1000,
      fillMaterial: '',
      color: '',
      location: '',
      currentStatus: QuiltStatus.AVAILABLE,
    },
  });

  const onSubmit = async (data: CreateQuiltInput) => {
    try {
      if (isEditing) {
        await updateQuilt.mutateAsync({ ...data, id: initialData.id });
        toast.success('Quilt updated successfully', 'Your changes have been saved.');
      } else {
        await createQuilt.mutateAsync(data);
        toast.success(
          'Quilt created successfully',
          'Your new quilt has been added to the collection.'
        );
      }
      onSuccess?.();
    } catch (error) {
      toast.error(
        isEditing ? 'Failed to update quilt' : 'Failed to create quilt',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const nextStep = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = FORM_STEPS[currentStep];
  const isLoading = createQuilt.isPending || updateQuilt.isPending;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {FORM_STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center space-x-3 ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? 'border-blue-600 bg-blue-50'
                        : isCompleted
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < FORM_STEPS.length - 1 && (
                  <div
                    className={`w-12 h-px mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <currentStepData.icon className="w-5 h-5" />
                <span>{currentStepData.title}</span>
              </CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 0 && (
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
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Unique identifier for this quilt</FormDescription>
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
                            onChange={e =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormDescription>Optional grouping for related quilts</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quilt Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Premium Down Winter Quilt" {...field} />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for easy identification
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                                  <div className="text-xs text-gray-500">{option.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Primary season for this quilt</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
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
                                  <div className="text-xs text-gray-500">{option.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Current availability status</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Specifications */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="lengthCm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (cm) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 200"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Length in centimeters</FormDescription>
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
                            placeholder="e.g., 180"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Width in centimeters</FormDescription>
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
                            placeholder="e.g., 1500"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Weight in grams</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="fillMaterial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fill Material *</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input placeholder="e.g., Goose Down" {...field} />
                              <div className="flex flex-wrap gap-2">
                                {COMMON_MATERIALS.map(material => (
                                  <Badge
                                    key={material}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => field.onChange(material)}
                                  >
                                    {material}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Primary filling material (click suggestions above)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="materialDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material Details</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., 90% Goose Down, 10% Feathers"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Detailed material composition</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Details & Location */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., White, Cream, Light Blue" {...field} />
                        </FormControl>
                        <FormDescription>Primary color or pattern</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input placeholder="e.g., IKEA, Muji" {...field} />
                            <div className="flex flex-wrap gap-2">
                              {COMMON_BRANDS.map(brand => (
                                <Badge
                                  key={brand}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-gray-100"
                                  onClick={() => field.onChange(brand)}
                                >
                                  {brand}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>Manufacturer or brand name</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            value={
                              field.value ? new Date(field.value).toISOString().split('T')[0] : ''
                            }
                            onChange={e =>
                              field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormDescription>When you purchased this quilt</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Location *</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input placeholder="e.g., Master Bedroom Closet" {...field} />
                            <div className="flex flex-wrap gap-2">
                              {COMMON_LOCATIONS.map(location => (
                                <Badge
                                  key={location}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-gray-100"
                                  onClick={() => field.onChange(location)}
                                >
                                  {location}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>Where this quilt is stored</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="packagingInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Packaging Info</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Vacuum sealed bag, Cotton storage bag"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>How the quilt is packaged or stored</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Additional Info */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes about this quilt..."
                            className="resize-none h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Additional information, care instructions, or observations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              {currentStep < FORM_STEPS.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loading size="sm" className="mr-2" />}
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Quilt' : 'Create Quilt'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
