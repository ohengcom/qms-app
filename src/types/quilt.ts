/**
 * Quilt Type Definitions
 *
 * Centralized type definitions for quilt-related data structures
 */

export type Season = 'WINTER' | 'SPRING_AUTUMN' | 'SUMMER';
export type QuiltStatus = 'AVAILABLE' | 'IN_USE' | 'STORAGE' | 'MAINTENANCE';
export type ViewMode = 'list' | 'grid';
export type SortDirection = 'asc' | 'desc';

export type SortField =
  | 'itemNumber'
  | 'name'
  | 'season'
  | 'size'
  | 'weight'
  | 'fillMaterial'
  | 'color'
  | 'location'
  | 'currentStatus';

export interface Quilt {
  id: string;
  itemNumber: number;
  name: string;
  season: Season;
  size: string;
  weightGrams: number;
  fillMaterial: string;
  color: string;
  location: string;
  currentStatus: QuiltStatus;
  brand?: string;
  purchaseDate?: string;
  mainImage?: string | null;
  attachmentImages?: string[] | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterCriteria {
  seasons: Season[];
  statuses: QuiltStatus[];
  colors: string[];
  materials: string[];
  locations?: string[];
  brands?: string[];
  minWeight?: number;
  maxWeight?: number;
}

export interface QuiltFormData {
  name?: string;
  season: Season;
  size: string;
  weightGrams: number;
  fillMaterial: string;
  color: string;
  location: string;
  currentStatus: QuiltStatus;
  brand?: string;
  purchaseDate?: string;
  mainImage?: string | null;
  attachmentImages?: string[] | null;
  notes?: string;
}

export interface QuiltDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quilt?: Quilt | null;
  onSave: (data: QuiltFormData) => Promise<void>;
}

export interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quilt?: Quilt | null;
  onStatusChange: (status: QuiltStatus, date?: Date, notes?: string) => Promise<void>;
}

// Helper type for quilt list operations
export type QuiltListItem = Quilt;

// Helper type for quilt card operations
export type QuiltCardItem = Quilt;
