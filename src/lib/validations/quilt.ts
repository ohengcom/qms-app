import { z } from 'zod';

// Define enums locally for type safety
export const Season = {
  WINTER: 'WINTER',
  SPRING_AUTUMN: 'SPRING_AUTUMN',
  SUMMER: 'SUMMER',
} as const;

export const QuiltStatus = {
  AVAILABLE: 'AVAILABLE',
  IN_USE: 'IN_USE',
  MAINTENANCE: 'MAINTENANCE',
  STORAGE: 'STORAGE',
} as const;

export const UsageType = {
  REGULAR: 'REGULAR',
  GUEST: 'GUEST',
  SPECIAL_OCCASION: 'SPECIAL_OCCASION',
  SEASONAL_ROTATION: 'SEASONAL_ROTATION',
} as const;

// Export types for the enums
export type Season = typeof Season[keyof typeof Season];
export type QuiltStatus = typeof QuiltStatus[keyof typeof QuiltStatus];
export type UsageType = typeof UsageType[keyof typeof UsageType];

// Base Quilt Schema
export const createQuiltSchema = z.object({
  itemNumber: z.number().int().positive('Item number must be positive'),
  groupId: z.number().int().positive().optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  season: z.enum(['WINTER', 'SPRING_AUTUMN', 'SUMMER']),
  lengthCm: z.number().int().positive('Length must be positive'),
  widthCm: z.number().int().positive('Width must be positive'),
  weightGrams: z.number().int().positive('Weight must be positive'),
  fillMaterial: z.string().min(1, 'Fill material is required'),
  materialDetails: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  brand: z.string().optional(),
  purchaseDate: z.date().optional(),
  location: z.string().min(1, 'Location is required'),
  packagingInfo: z.string().optional(),
  currentStatus: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'STORAGE']).optional().default('AVAILABLE'),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

export const updateQuiltSchema = createQuiltSchema.extend({
  id: z.string(),
});

// Usage Schemas
export const createUsagePeriodSchema = z.object({
  quiltId: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  seasonUsed: z.string().optional(),
  usageType: z.enum(['REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION']).optional().default('REGULAR'),
  notes: z.string().optional(),
});

export const createCurrentUsageSchema = z.object({
  quiltId: z.string(),
  startedAt: z.date(),
  expectedEndDate: z.date().optional(),
  usageType: z.enum(['REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION']).optional().default('REGULAR'),
  notes: z.string().optional(),
});

export const endCurrentUsageSchema = z.object({
  id: z.string(),
  endDate: z.date().optional(),
  notes: z.string().optional(),
});

// Search and Filter Schemas
export const quiltFiltersSchema = z.object({
  season: z.enum(['WINTER', 'SPRING_AUTUMN', 'SUMMER']).optional(),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'STORAGE']).optional(),
  location: z.string().optional(),
  brand: z.string().optional(),
  minWeight: z.number().int().positive().optional(),
  maxWeight: z.number().int().positive().optional(),
  search: z.string().optional(),
});

export const quiltSearchSchema = z.object({
  filters: quiltFiltersSchema.optional().default({}),
  sortBy: z.enum(['itemNumber', 'name', 'season', 'weightGrams', 'createdAt', 'updatedAt']).optional().default('itemNumber'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  skip: z.number().int().min(0).optional().default(0),
  take: z.number().int().min(1).max(100).optional().default(20),
});

// Maintenance Schemas
export const createMaintenanceRecordSchema = z.object({
  quiltId: z.string(),
  type: z.string().min(1, 'Maintenance type is required'),
  description: z.string().min(1, 'Description is required'),
  performedAt: z.date(),
  cost: z.number().positive().optional(),
  nextDueDate: z.date().optional(),
});

// Seasonal Recommendation Schemas
export const createSeasonalRecommendationSchema = z.object({
  season: z.enum(['WINTER', 'SPRING_AUTUMN', 'SUMMER']),
  minWeight: z.number().int().positive(),
  maxWeight: z.number().int().positive(),
  materials: z.array(z.string()),
  description: z.string().min(1, 'Description is required'),
  priority: z.number().int().min(0).optional().default(0),
});

export const updateSeasonalRecommendationSchema = createSeasonalRecommendationSchema.partial().extend({
  id: z.string(),
});

// Analytics Schemas
export const analyticsDateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

export const dashboardStatsSchema = z.object({
  includeAnalytics: z.boolean().optional().default(true),
  includeTrends: z.boolean().optional().default(false),
});

// Export types
export type CreateQuiltInput = z.infer<typeof createQuiltSchema>;
export type UpdateQuiltInput = z.infer<typeof updateQuiltSchema>;
export type CreateUsagePeriodInput = z.infer<typeof createUsagePeriodSchema>;
export type CreateCurrentUsageInput = z.infer<typeof createCurrentUsageSchema>;
export type EndCurrentUsageInput = z.infer<typeof endCurrentUsageSchema>;
export type QuiltFiltersInput = z.infer<typeof quiltFiltersSchema>;
export type QuiltSearchInput = z.infer<typeof quiltSearchSchema>;
export type CreateMaintenanceRecordInput = z.infer<typeof createMaintenanceRecordSchema>;
export type CreateSeasonalRecommendationInput = z.infer<typeof createSeasonalRecommendationSchema>;
export type UpdateSeasonalRecommendationInput = z.infer<typeof updateSeasonalRecommendationSchema>;
export type AnalyticsDateRangeInput = z.infer<typeof analyticsDateRangeSchema>;
export type DashboardStatsInput = z.infer<typeof dashboardStatsSchema>;