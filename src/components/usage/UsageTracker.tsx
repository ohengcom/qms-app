'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStartUsage, useEndUsage } from '@/hooks/useQuilts';
import { useToastContext } from '@/hooks/useToast';
import { Loading } from '@/components/ui/loading';
import { 
  Play, 
  Square, 
  Clock, 
  Calendar,
  MapPin,
  Thermometer,
  User,
  FileText
} from 'lucide-react';

const startUsageSchema = z.object({
  usageType: z.enum(['REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION']),
  location: z.string().optional(),
  expectedDuration: z.number().optional(),
  notes: z.string().optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
});

const endUsageSchema = z.object({
  endDate: z.date(),
  notes: z.string().optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_CLEANING', 'NEEDS_REPAIR']).optional(),
  satisfactionRating: z.number().min(1).max(5).optional(),
});

type StartUsageInput = z.infer<typeof startUsageSchema>;
type EndUsageInput = z.infer<typeof endUsageSchema>;

interface UsageTrackerProps {
  quilt: {
    id: string;
    name: string;
    itemNumber: number;
    currentStatus: string;
    currentUsage?: {
      id: string;
      startedAt: Date;
      usageType: string;
      location?: string | null;
      notes?: string | null;
    } | null;
  };
  onUsageChange?: () => void;
}

const USAGE_TYPES = [
  { value: 'REGULAR', label: 'Regular Use', description: 'Normal daily/nightly use' },
  { value: 'GUEST', label: 'Guest Use', description: 'Used by guests or visitors' },
  { value: 'SPECIAL_OCCASION', label: 'Special Occasion', description: 'Special events or occasions' },
  { value: 'SEASONAL_ROTATION', label: 'Seasonal Rotation', description: 'Seasonal rotation or storage' },
];

const CONDITION_OPTIONS = [
  { value: 'EXCELLENT', label: 'Excellent', description: 'Perfect condition, no issues' },
  { value: 'GOOD', label: 'Good', description: 'Minor wear, still in great shape' },
  { value: 'FAIR', label: 'Fair', description: 'Some wear but still usable' },
  { value: 'NEEDS_CLEANING', label: 'Needs Cleaning', description: 'Requires washing or cleaning' },
  { value: 'NEEDS_REPAIR', label: 'Needs Repair', description: 'Requires maintenance or repair' },
];

export function UsageTracker({ quilt, onUsageChange }: UsageTrackerProps) {
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const toast = useToastContext();
  
  const startUsage = useStartUsage();
  const endUsage = useEndUsage();
  
  const isInUse = quilt.currentStatus === 'IN_USE' && quilt.currentUsage;
  
  const startForm = useForm<StartUsageInput>({
    resolver: zodResolver(startUsageSchema),
    defaultValues: {
      usageType: 'REGULAR',
      location: '',
      notes: '',
    },
  });
  
  const endForm = useForm<EndUsageInput>({
    resolver: zodResolver(endUsageSchema),
    defaultValues: {
      endDate: new Date(),
      condition: 'GOOD',
      satisfactionRating: 4,
    },
  });
  
  const handleStartUsage = async (data: StartUsageInput) => {
    try {
      await startUsage.mutateAsync({
        quiltId: quilt.id,
        startedAt: new Date(),
        ...data,
      });
      
      toast.success('Usage Started', `Started tracking usage for ${quilt.name}`);
      setShowStartDialog(false);
      startForm.reset();
      onUsageChange?.();
    } catch (error) {
      toast.error('Failed to start usage', error instanceof Error ? error.message : 'Please try again');
    }
  };
  
  const handleEndUsage = async (data: EndUsageInput) => {
    if (!quilt.currentUsage) return;
    
    try {
      await endUsage.mutateAsync({
        id: quilt.currentUsage.id,
        ...data,
      });
      
      toast.success('Usage Ended', `Stopped tracking usage for ${quilt.name}`);
      setShowEndDialog(false);
      endForm.reset();
      onUsageChange?.();
    } catch (error) {
      toast.error('Failed to end usage', error instanceof Error ? error.message : 'Please try again');
    }
  };
  
  const getUsageDuration = () => {
    if (!quilt.currentUsage) return null;
    
    const start = new Date(quilt.currentUsage.startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Usage Tracking</span>
          </div>
          <Badge variant={isInUse ? 'default' : 'secondary'}>
            {isInUse ? 'In Use' : 'Available'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Track when and how this quilt is being used
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isInUse && quilt.currentUsage ? (
          // Currently in use - show usage details and end button
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">Currently In Use</h4>
                <Badge className="bg-blue-100 text-blue-800">
                  {quilt.currentUsage.usageType.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Calendar className="w-4 h-4" />
                  <span>Started: {new Date(quilt.currentUsage.startedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span>Duration: {getUsageDuration()}</span>
                </div>
                {quilt.currentUsage.location && (
                  <div className="flex items-center space-x-2 text-blue-700">
                    <MapPin className="w-4 h-4" />
                    <span>Location: {quilt.currentUsage.location}</span>
                  </div>
                )}
                {quilt.currentUsage.notes && (
                  <div className="md:col-span-2 flex items-start space-x-2 text-blue-700">
                    <FileText className="w-4 h-4 mt-0.5" />
                    <span>Notes: {quilt.currentUsage.notes}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Square className="w-4 h-4 mr-2" />
                  End Usage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>End Usage Tracking</DialogTitle>
                  <DialogDescription>
                    Record the end of usage for {quilt.name} and provide feedback about the experience.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...endForm}>
                  <form onSubmit={endForm.handleSubmit(handleEndUsage)} className="space-y-4">
                    <FormField
                      control={endForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date & Time</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                            />
                          </FormControl>
                          <FormDescription>
                            When did you stop using this quilt?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={endForm.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quilt Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONDITION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div>
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-xs text-gray-500">{option.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            What condition is the quilt in after use?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={endForm.control}
                      name="satisfactionRating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Satisfaction Rating (1-5)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormDescription>
                            How satisfied were you with this quilt? (1 = Poor, 5 = Excellent)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={endForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usage Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any observations about comfort, warmth, or issues..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional notes about your experience with this quilt
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowEndDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={endUsage.isPending}>
                        {endUsage.isPending && <Loading size="sm" className="mr-2" />}
                        End Usage
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          // Not in use - show start usage button
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">This quilt is not currently being tracked for usage.</p>
            
            <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  Start Usage Tracking
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Usage Tracking</DialogTitle>
                  <DialogDescription>
                    Begin tracking usage for {quilt.name} and record relevant details.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...startForm}>
                  <form onSubmit={startForm.handleSubmit(handleStartUsage)} className="space-y-4">
                    <FormField
                      control={startForm.control}
                      name="usageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usage Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select usage type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {USAGE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div>
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-xs text-gray-500">{type.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            What type of usage is this?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={startForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usage Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Master Bedroom, Guest Room" {...field} />
                          </FormControl>
                          <FormDescription>
                            Where will this quilt be used? (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={startForm.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperature (°C)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 20"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              Room temperature (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={startForm.control}
                        name="humidity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Humidity (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 45"
                                min="0"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              Room humidity (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={startForm.control}
                      name="expectedDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Duration (days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 7"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            How long do you expect to use this quilt? (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={startForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any initial observations or reasons for using this quilt..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional notes about starting to use this quilt
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowStartDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={startUsage.isPending}>
                        {startUsage.isPending && <Loading size="sm" className="mr-2" />}
                        Start Tracking
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}