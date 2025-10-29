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
export type Season = (typeof Season)[keyof typeof Season];
export type QuiltStatus = (typeof QuiltStatus)[keyof typeof QuiltStatus];
export type UsageType = (typeof UsageType)[keyof typeof UsageType];

// Season-specific weight ranges (in grams)
const SEASON_WEIGHT_RANGES = {
  WINTER: { min: 1500, max: 5000 }, // Heavy quilts for cold weather
  SPRING_AUTUMN: { min: 800, max: 2000 }, // Medium weight for transitional seasons
  SUMMER: { min: 200, max: 1200 }, // Light quilts for warm weather
} as const;

// Base Quilt Schema object (without refinements)
const baseQuiltSchemaObject = z.object({
  itemNumber: z
    .number()
    .int('Item number must be an integer')
    .positive('Item number must be positive')
    .max(99999, 'Item number must be less than 100000'),
  groupId: z.number().int().positive().optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long (max 100 characters)').trim(),
  season: z.enum(['WINTER', 'SPRING_AUTUMN', 'SUMMER'], {
    errorMap: () => ({ message: 'Invalid season. Must be WINTER, SPRING_AUTUMN, or SUMMER' }),
  }),
  lengthCm: z
    .number()
    .int('Length must be an integer')
    .positive('Length must be positive')
    .min(100, 'Length must be at least 100cm')
    .max(300, 'Length must be at most 300cm'),
  widthCm: z
    .number()
    .int('Width must be an integer')
    .positive('Width must be positive')
    .min(100, 'Width must be at least 100cm')
    .max(300, 'Width must be at most 300cm'),
  weightGrams: z
    .number()
    .int('Weight must be an integer')
    .positive('Weight must be positive')
    .min(100, 'Weight must be at least 100g')
    .max(10000, 'Weight must be at most 10kg'),
  fillMaterial: z
    .string()
    .min(1, 'Fill material is required')
    .max(50, 'Fill material too long (max 50 characters)')
    .trim(),
  materialDetails: z.string().max(500, 'Material details too long (max 500 characters)').optional(),
  color: z
    .string()
    .min(1, 'Color is required')
    .max(30, 'Color too long (max 30 characters)')
    .trim(),
  brand: z.string().max(50, 'Brand too long (max 50 characters)').optional(),
  purchaseDate: z.date().max(new Date(), 'Purchase date cannot be in the future').optional(),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(100, 'Location too long (max 100 characters)')
    .trim(),
  packagingInfo: z.string().max(200, 'Packaging info too long (max 200 characters)').optional(),
  currentStatus: z
    .enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'STORAGE'], {
      errorMap: () => ({ message: 'Invalid status' }),
    })
    .optional()
    .default('AVAILABLE'),
  notes: z.string().max(1000, 'Notes too long (max 1000 characters)').optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional().or(z.literal('')),
});

// Create Quilt Schema with refinements
export const createQuiltSchema = baseQuiltSchemaObject
  .refine(
    data => {
      // Validate weight is appropriate for the season
      const range = SEASON_WEIGHT_RANGES[data.season];
      return data.weightGrams >= range.min && data.weightGrams <= range.max;
    },
    data => {
      const range = SEASON_WEIGHT_RANGES[data.season];
      return {
        message: `Weight should be between ${range.min}g and ${range.max}g for ${data.season} season`,
        path: ['weightGrams'],
      };
    }
  )
  .refine(
    data => {
      // Validate dimensions are reasonable (length should typically be >= width)
      return data.lengthCm >= data.widthCm * 0.8; // Allow some flexibility
    },
    {
      message: 'Length should typically be greater than or equal to width',
      path: ['lengthCm'],
    }
  );

// Update Quilt Schema (uses base object for partial support)
export const updateQuiltSchema = baseQuiltSchemaObject.partial().extend({
  id: z.string().min(1, 'Quilt ID is required'),
});

// Usage Schemas with enhanced validation
export const createUsagePeriodSchema = z
  .object({
    quiltId: z.string().min(1, 'Quilt ID is required'),
    startDate: z.date().max(new Date(), 'Start date cannot be in the future'),
    endDate: z.date().optional(),
    seasonUsed: z.string().max(50).optional(),
    usageType: z
      .enum(['REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION'], {
        errorMap: () => ({ message: 'Invalid usage type' }),
      })
      .optional()
      .default('REGULAR'),
    notes: z.string().max(500, 'Notes too long (max 500 characters)').optional(),
  })
  .refine(
    data => {
      // If endDate is provided, it must be after startDate
      if (data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )
  .refine(
    data => {
      // If endDate is provided, it cannot be in the future
      if (data.endDate) {
        return data.endDate <= new Date();
      }
      return true;
    },
    {
      message: 'End date cannot be in the future',
      path: ['endDate'],
    }
  )
  .refine(
    data => {
      // Usage period should not be longer than 1 year
      if (data.endDate) {
        const oneYear = 365 * 24 * 60 * 60 * 1000; // milliseconds in a year
        return data.endDate.getTime() - data.startDate.getTime() <= oneYear;
      }
      return true;
    },
    {
      message: 'Usage period cannot exceed 1 year',
      path: ['endDate'],
    }
  );

export const createCurrentUsageSchema = z
  .object({
    quiltId: z.string().min(1, 'Quilt ID is required'),
    startedAt: z.date().max(new Date(), 'Start date cannot be in the future'),
    expectedEndDate: z.date().optional(),
    usageType: z
      .enum(['REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION'], {
        errorMap: () => ({ message: 'Invalid usage type' }),
      })
      .optional()
      .default('REGULAR'),
    notes: z.string().max(500, 'Notes too long (max 500 characters)').optional(),
  })
  .refine(
    data => {
      // If expectedEndDate is provided, it must be after startedAt
      if (data.expectedEndDate) {
        return data.expectedEndDate > data.startedAt;
      }
      return true;
    },
    {
      message: 'Expected end date must be after start date',
      path: ['expectedEndDate'],
    }
  );

export const endCurrentUsageSchema = z.object({
  id: z.string().min(1, 'Usage ID is required'),
  endDate: z.date().max(new Date(), 'End date cannot be in the future').optional(),
  notes: z.string().max(500, 'Notes too long (max 500 characters)').optional(),
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
  sortBy: z
    .enum(['itemNumber', 'name', 'season', 'weightGrams', 'createdAt', 'updatedAt'])
    .optional()
    .default('itemNumber'),
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

export const updateSeasonalRecommendationSchema = createSeasonalRecommendationSchema
  .partial()
  .extend({
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
