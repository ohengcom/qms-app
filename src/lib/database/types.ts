/**
 * Database Type Definitions
 *
 * This file defines types for database rows (snake_case) and transformer functions
 * to convert between database rows and application models.
 *
 * Application model types (Quilt, UsageRecord, MaintenanceRecord) are imported from
 * the Zod validation schemas which serve as the single source of truth.
 */

import {
  Season,
  QuiltStatus,
  UsageType,
  // Import model types from Zod schemas (single source of truth)
  type Quilt,
  type UsageRecord,
  type MaintenanceRecord,
} from '@/lib/validations/quilt';

// Re-export model types for convenience
export type { Quilt, UsageRecord, MaintenanceRecord };

// ============================================================================
// Database Row Types (snake_case - matches PostgreSQL schema)
// ============================================================================

export interface QuiltRow {
  id: string;
  item_number: number;
  group_id: number | null;
  name: string;
  season: string;
  length_cm: number | null;
  width_cm: number | null;
  weight_grams: number | null;
  fill_material: string;
  material_details: string | null;
  color: string;
  brand: string | null;
  purchase_date: string | null;
  location: string;
  packaging_info: string | null;
  current_status: string;
  notes: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  main_image: string | null;
  attachment_images: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface UsageRecordRow {
  id: string;
  quilt_id: string;
  start_date: string;
  end_date: string | null;
  usage_type: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecordRow {
  id: string;
  quilt_id: string;
  maintenance_type: string;
  description: string;
  performed_at: string;
  cost: number | null;
  next_due_date: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Transformer Functions
// ============================================================================

/**
 * Convert a database row to a Quilt application model
 */
export function rowToQuilt(row: QuiltRow): Quilt {
  return {
    id: row.id,
    itemNumber: row.item_number,
    groupId: row.group_id,
    name: row.name,
    season: row.season as Season,
    lengthCm: row.length_cm,
    widthCm: row.width_cm,
    weightGrams: row.weight_grams,
    fillMaterial: row.fill_material,
    materialDetails: row.material_details,
    color: row.color,
    brand: row.brand,
    purchaseDate: row.purchase_date ? new Date(row.purchase_date) : null,
    location: row.location,
    packagingInfo: row.packaging_info,
    currentStatus: row.current_status as QuiltStatus,
    notes: row.notes,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url,
    mainImage: row.main_image,
    attachmentImages: row.attachment_images,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Convert a Quilt application model to a database row (partial for updates)
 */
export function quiltToRow(quilt: Partial<Quilt>): Partial<QuiltRow> {
  const row: Partial<QuiltRow> = {};

  if (quilt.id !== undefined) row.id = quilt.id;
  if (quilt.itemNumber !== undefined) row.item_number = quilt.itemNumber;
  if (quilt.groupId !== undefined) row.group_id = quilt.groupId;
  if (quilt.name !== undefined) row.name = quilt.name;
  if (quilt.season !== undefined) row.season = quilt.season;
  if (quilt.lengthCm !== undefined) row.length_cm = quilt.lengthCm;
  if (quilt.widthCm !== undefined) row.width_cm = quilt.widthCm;
  if (quilt.weightGrams !== undefined) row.weight_grams = quilt.weightGrams;
  if (quilt.fillMaterial !== undefined) row.fill_material = quilt.fillMaterial;
  if (quilt.materialDetails !== undefined) row.material_details = quilt.materialDetails;
  if (quilt.color !== undefined) row.color = quilt.color;
  if (quilt.brand !== undefined) row.brand = quilt.brand;
  if (quilt.purchaseDate !== undefined) {
    row.purchase_date = quilt.purchaseDate ? quilt.purchaseDate.toISOString() : null;
  }
  if (quilt.location !== undefined) row.location = quilt.location;
  if (quilt.packagingInfo !== undefined) row.packaging_info = quilt.packagingInfo;
  if (quilt.currentStatus !== undefined) row.current_status = quilt.currentStatus;
  if (quilt.notes !== undefined) row.notes = quilt.notes;
  if (quilt.imageUrl !== undefined) row.image_url = quilt.imageUrl;
  if (quilt.thumbnailUrl !== undefined) row.thumbnail_url = quilt.thumbnailUrl;
  if (quilt.mainImage !== undefined) row.main_image = quilt.mainImage;
  if (quilt.attachmentImages !== undefined) row.attachment_images = quilt.attachmentImages;
  if (quilt.createdAt !== undefined) row.created_at = quilt.createdAt.toISOString();
  if (quilt.updatedAt !== undefined) row.updated_at = quilt.updatedAt.toISOString();

  return row;
}

/**
 * Convert a database row to a UsageRecord application model
 */
export function rowToUsageRecord(row: UsageRecordRow): UsageRecord {
  return {
    id: row.id,
    quiltId: row.quilt_id,
    startDate: new Date(row.start_date),
    endDate: row.end_date ? new Date(row.end_date) : null,
    usageType: row.usage_type as UsageType,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Convert a UsageRecord application model to a database row (partial for updates)
 */
export function usageRecordToRow(record: Partial<UsageRecord>): Partial<UsageRecordRow> {
  const row: Partial<UsageRecordRow> = {};

  if (record.id !== undefined) row.id = record.id;
  if (record.quiltId !== undefined) row.quilt_id = record.quiltId;
  if (record.startDate !== undefined) row.start_date = record.startDate.toISOString();
  if (record.endDate !== undefined) {
    row.end_date = record.endDate ? record.endDate.toISOString() : null;
  }
  if (record.usageType !== undefined) row.usage_type = record.usageType;
  if (record.notes !== undefined) row.notes = record.notes;
  if (record.createdAt !== undefined) row.created_at = record.createdAt.toISOString();
  if (record.updatedAt !== undefined) row.updated_at = record.updatedAt.toISOString();

  return row;
}

/**
 * Convert a database row to a MaintenanceRecord application model
 */
export function rowToMaintenanceRecord(row: MaintenanceRecordRow): MaintenanceRecord {
  return {
    id: row.id,
    quiltId: row.quilt_id,
    maintenanceType: row.maintenance_type,
    description: row.description,
    performedAt: new Date(row.performed_at),
    cost: row.cost,
    nextDueDate: row.next_due_date ? new Date(row.next_due_date) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Convert a MaintenanceRecord application model to a database row (partial for updates)
 */
export function maintenanceRecordToRow(
  record: Partial<MaintenanceRecord>
): Partial<MaintenanceRecordRow> {
  const row: Partial<MaintenanceRecordRow> = {};

  if (record.id !== undefined) row.id = record.id;
  if (record.quiltId !== undefined) row.quilt_id = record.quiltId;
  if (record.maintenanceType !== undefined) row.maintenance_type = record.maintenanceType;
  if (record.description !== undefined) row.description = record.description;
  if (record.performedAt !== undefined) row.performed_at = record.performedAt.toISOString();
  if (record.cost !== undefined) row.cost = record.cost;
  if (record.nextDueDate !== undefined) {
    row.next_due_date = record.nextDueDate ? record.nextDueDate.toISOString() : null;
  }
  if (record.createdAt !== undefined) row.created_at = record.createdAt.toISOString();
  if (record.updatedAt !== undefined) row.updated_at = record.updatedAt.toISOString();

  return row;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid Season
 */
export function isSeason(value: unknown): value is Season {
  return typeof value === 'string' && ['WINTER', 'SPRING_AUTUMN', 'SUMMER'].includes(value);
}

/**
 * Check if a value is a valid QuiltStatus
 * Note: AVAILABLE status removed per Requirements 7.2 - use STORAGE instead
 */
export function isQuiltStatus(value: unknown): value is QuiltStatus {
  return typeof value === 'string' && ['IN_USE', 'STORAGE', 'MAINTENANCE'].includes(value);
}

/**
 * Check if a value is a valid UsageType
 */
export function isUsageType(value: unknown): value is UsageType {
  return (
    typeof value === 'string' &&
    ['REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION'].includes(value)
  );
}
