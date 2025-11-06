/**
 * Quilt Repository
 * 
 * Handles all database operations for quilts with type safety and proper error handling.
 */

import { sql } from '@/lib/neon';
import { dbLogger } from '@/lib/logger';
import { BaseRepositoryImpl } from './base.repository';
import {
  Quilt,
  QuiltRow,
  rowToQuilt,
  quiltToRow,
} from '@/lib/database/types';
import { QuiltStatus, Season } from '@/lib/validations/quilt';

export interface QuiltFilters {
  season?: Season;
  status?: QuiltStatus;
  location?: string;
  brand?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateQuiltData {
  name?: string;
  season: Season;
  lengthCm: number;
  widthCm: number;
  weightGrams: number;
  fillMaterial: string;
  materialDetails?: string | null;
  color: string;
  brand?: string | null;
  purchaseDate?: Date | null;
  location: string;
  packagingInfo?: string | null;
  currentStatus?: QuiltStatus;
  notes?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  mainImage?: string | null;
  attachmentImages?: string[] | null;
}

export class QuiltRepository extends BaseRepositoryImpl<QuiltRow, Quilt> {
  protected tableName = 'quilts';

  protected rowToModel(row: QuiltRow): Quilt {
    return rowToQuilt(row);
  }

  protected modelToRow(model: Partial<Quilt>): Partial<QuiltRow> {
    return quiltToRow(model);
  }

  /**
   * Find a quilt by ID
   */
  async findById(id: string): Promise<Quilt | null> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          SELECT * FROM quilts
          WHERE id = ${id}
        ` as QuiltRow[];
        return rows[0] ? this.rowToModel(rows[0]) : null;
      },
      'findById',
      { id }
    );
  }

  /**
   * Find all quilts with optional filtering
   */
  async findAll(filters: QuiltFilters = {}): Promise<Quilt[]> {
    return this.executeQuery(
      async () => {
        const { season, status, location, brand, search, limit = 20, offset = 0 } = filters;

        // Get all quilts from database using simple query
        const rows = await sql`
          SELECT * FROM quilts
          ORDER BY created_at DESC
        ` as QuiltRow[];
        
        // Convert to models
        let quilts = rows.map(row => this.rowToModel(row));
        
        // Apply filters in application layer
        if (season) {
          quilts = quilts.filter(q => q.season === season);
        }
        
        if (status) {
          quilts = quilts.filter(q => q.currentStatus === status);
        }
        
        if (location) {
          const searchLower = location.toLowerCase();
          quilts = quilts.filter(q => q.location.toLowerCase().includes(searchLower));
        }
        
        if (brand) {
          const searchLower = brand.toLowerCase();
          quilts = quilts.filter(q => q.brand?.toLowerCase().includes(searchLower));
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          quilts = quilts.filter(q => 
            q.name.toLowerCase().includes(searchLower) ||
            q.color.toLowerCase().includes(searchLower) ||
            q.fillMaterial.toLowerCase().includes(searchLower) ||
            q.notes?.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply pagination
        const start = offset;
        const end = offset + limit;
        return quilts.slice(start, end);
      },
      'findAll',
      { filters }
    );
  }

  /**
   * Find quilts by status
   */
  async findByStatus(status: QuiltStatus): Promise<Quilt[]> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          SELECT * FROM quilts
          WHERE current_status = ${status}
          ORDER BY created_at DESC
        ` as QuiltRow[];
        return rows.map(row => this.rowToModel(row));
      },
      'findByStatus',
      { status }
    );
  }

  /**
   * Find quilts by season
   */
  async findBySeason(season: Season): Promise<Quilt[]> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          SELECT * FROM quilts
          WHERE season = ${season}
          ORDER BY created_at DESC
        ` as QuiltRow[];
        return rows.map(row => this.rowToModel(row));
      },
      'findBySeason',
      { season }
    );
  }

  /**
   * Get the next available item number
   */
  async getNextItemNumber(): Promise<number> {
    return this.executeQuery(
      async () => {
        const result = await sql`
          SELECT COALESCE(MAX(item_number), 0) + 1 as next_number
          FROM quilts
        ` as [{ next_number: number }];
        return result[0]?.next_number || 1;
      },
      'getNextItemNumber'
    );
  }

  /**
   * Generate a quilt name based on its properties
   */
  generateQuiltName(data: CreateQuiltData): string {
    const brand = data.brand || '未知品牌';
    const color = data.color || '未知颜色';
    const weight = data.weightGrams || 0;

    const seasonMap: Record<Season, string> = {
      WINTER: '冬',
      SPRING_AUTUMN: '春秋',
      SUMMER: '夏',
    };
    const season = seasonMap[data.season] || '通用';

    return `${brand}${color}${weight}克${season}被`;
  }

  /**
   * Create a new quilt
   */
  async create(data: CreateQuiltData): Promise<Quilt> {
    return this.executeQuery(
      async () => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const itemNumber = await this.getNextItemNumber();
        const name = data.name || this.generateQuiltName(data);

        dbLogger.info('Creating quilt', { itemNumber, name });

        const rows = await sql`
          INSERT INTO quilts (
            id, item_number, name, season, length_cm, width_cm,
            weight_grams, fill_material, material_details, color,
            brand, purchase_date, location, packaging_info,
            current_status, notes, image_url, thumbnail_url,
            main_image, attachment_images,
            created_at, updated_at
          ) VALUES (
            ${id},
            ${itemNumber},
            ${name},
            ${data.season},
            ${data.lengthCm},
            ${data.widthCm},
            ${data.weightGrams},
            ${data.fillMaterial},
            ${data.materialDetails || null},
            ${data.color},
            ${data.brand || null},
            ${data.purchaseDate ? data.purchaseDate.toISOString() : null},
            ${data.location},
            ${data.packagingInfo || null},
            ${data.currentStatus || 'STORAGE'},
            ${data.notes || null},
            ${data.imageUrl || null},
            ${data.thumbnailUrl || null},
            ${data.mainImage || null},
            ${data.attachmentImages || []},
            ${now},
            ${now}
          ) RETURNING *
        ` as QuiltRow[];

        dbLogger.info('Quilt created successfully', { id, itemNumber });
        return this.rowToModel(rows[0]);
      },
      'create',
      { data }
    );
  }

  /**
   * Update a quilt
   */
  async update(id: string, data: Partial<CreateQuiltData>): Promise<Quilt | null> {
    return this.executeQuery(
      async () => {
        // Get current quilt
        const current = await this.findById(id);
        if (!current) {
          dbLogger.warn('Quilt not found for update', { id });
          return null;
        }

        const now = new Date().toISOString();
        const rowData = this.modelToRow({ ...current, ...data, updatedAt: new Date(now) });

        const rows = await sql`
          UPDATE quilts SET
            name = ${rowData.name},
            season = ${rowData.season},
            length_cm = ${rowData.length_cm},
            width_cm = ${rowData.width_cm},
            weight_grams = ${rowData.weight_grams},
            fill_material = ${rowData.fill_material},
            material_details = ${rowData.material_details},
            color = ${rowData.color},
            brand = ${rowData.brand},
            purchase_date = ${rowData.purchase_date},
            location = ${rowData.location},
            packaging_info = ${rowData.packaging_info},
            current_status = ${rowData.current_status},
            notes = ${rowData.notes},
            image_url = ${rowData.image_url},
            thumbnail_url = ${rowData.thumbnail_url},
            main_image = ${rowData.main_image},
            attachment_images = ${rowData.attachment_images},
            updated_at = ${now}
          WHERE id = ${id}
          RETURNING *
        ` as QuiltRow[];

        if (rows.length === 0) {
          return null;
        }

        dbLogger.info('Quilt updated successfully', { id });
        return this.rowToModel(rows[0]);
      },
      'update',
      { id, data }
    );
  }

  /**
   * Update quilt status only
   */
  async updateStatus(id: string, status: QuiltStatus): Promise<Quilt | null> {
    return this.executeQuery(
      async () => {
        const now = new Date().toISOString();

        const rows = await sql`
          UPDATE quilts SET
            current_status = ${status},
            updated_at = ${now}
          WHERE id = ${id}
          RETURNING *
        ` as QuiltRow[];

        if (rows.length === 0) {
          return null;
        }

        dbLogger.info('Quilt status updated', { id, status });
        return this.rowToModel(rows[0]);
      },
      'updateStatus',
      { id, status }
    );
  }

  /**
   * Delete a quilt and its related records
   */
  async delete(id: string): Promise<boolean> {
    return this.executeQuery(
      async () => {
        // Delete related records first
        await sql`DELETE FROM usage_records WHERE quilt_id = ${id}`;
        await sql`DELETE FROM maintenance_records WHERE quilt_id = ${id}`;

        // Delete the quilt
        const result = await sql`
          DELETE FROM quilts WHERE id = ${id}
          RETURNING id
        `;

        const success = result.length > 0;
        if (success) {
          dbLogger.info('Quilt deleted successfully', { id });
        }
        return success;
      },
      'delete',
      { id }
    );
  }

  /**
   * Count quilts with optional filters
   */
  async count(filters: QuiltFilters = {}): Promise<number> {
    return this.executeQuery(
      async () => {
        const { season, status, location, brand, search } = filters;

        // If no filters, use simple count query
        if (!season && !status && !location && !brand && !search) {
          const result = await sql`SELECT COUNT(*) as count FROM quilts` as [{ count: string }];
          return parseInt(result[0]?.count || '0', 10);
        }

        // Otherwise, get all and filter in application layer
        const rows = await sql`SELECT * FROM quilts` as QuiltRow[];
        let quilts = rows.map(row => this.rowToModel(row));
        
        // Apply same filters as findAll
        if (season) {
          quilts = quilts.filter(q => q.season === season);
        }
        
        if (status) {
          quilts = quilts.filter(q => q.currentStatus === status);
        }
        
        if (location) {
          const searchLower = location.toLowerCase();
          quilts = quilts.filter(q => q.location.toLowerCase().includes(searchLower));
        }
        
        if (brand) {
          const searchLower = brand.toLowerCase();
          quilts = quilts.filter(q => q.brand?.toLowerCase().includes(searchLower));
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          quilts = quilts.filter(q => 
            q.name.toLowerCase().includes(searchLower) ||
            q.color.toLowerCase().includes(searchLower) ||
            q.fillMaterial.toLowerCase().includes(searchLower) ||
            q.notes?.toLowerCase().includes(searchLower)
          );
        }
        
        return quilts.length;
      },
      'count',
      { filters }
    );
  }
}

// Export singleton instance
export const quiltRepository = new QuiltRepository();
