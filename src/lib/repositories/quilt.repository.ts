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
   * Find all quilts with optional filtering
   */
  async findAll(filters: QuiltFilters = {}): Promise<Quilt[]> {
    return this.executeQuery(
      async () => {
        const { season, status, location, brand, search, limit = 20, offset = 0 } = filters;

        let query = sql<QuiltRow[]>`SELECT * FROM quilts WHERE 1=1`;

        if (season) {
          query = sql<QuiltRow[]>`${query} AND season = ${season}`;
        }

        if (status) {
          query = sql<QuiltRow[]>`${query} AND current_status = ${status}`;
        }

        if (location) {
          query = sql<QuiltRow[]>`${query} AND location ILIKE ${`%${location}%`}`;
        }

        if (brand) {
          query = sql<QuiltRow[]>`${query} AND brand ILIKE ${`%${brand}%`}`;
        }

        if (search) {
          query = sql<QuiltRow[]>`${query} AND (
            name ILIKE ${`%${search}%`} OR
            color ILIKE ${`%${search}%`} OR
            fill_material ILIKE ${`%${search}%`} OR
            notes ILIKE ${`%${search}%`}
          )`;
        }

        query = sql<QuiltRow[]>`${query} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

        const rows = await query;
        return rows.map(row => this.rowToModel(row));
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
        const rows = await sql<QuiltRow[]>`
          SELECT * FROM quilts
          WHERE current_status = ${status}
          ORDER BY created_at DESC
        `;
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
        const rows = await sql<QuiltRow[]>`
          SELECT * FROM quilts
          WHERE season = ${season}
          ORDER BY created_at DESC
        `;
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
        const result = await sql<[{ next_number: number }]>`
          SELECT COALESCE(MAX(item_number), 0) + 1 as next_number
          FROM quilts
        `;
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

        const rows = await sql<QuiltRow[]>`
          INSERT INTO quilts (
            id, item_number, name, season, length_cm, width_cm,
            weight_grams, fill_material, material_details, color,
            brand, purchase_date, location, packaging_info,
            current_status, notes, image_url, thumbnail_url,
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
            ${now},
            ${now}
          ) RETURNING *
        `;

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

        const rows = await sql<QuiltRow[]>`
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
            updated_at = ${now}
          WHERE id = ${id}
          RETURNING *
        `;

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

        const rows = await sql<QuiltRow[]>`
          UPDATE quilts SET
            current_status = ${status},
            updated_at = ${now}
          WHERE id = ${id}
          RETURNING *
        `;

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

        let query = sql<[{ count: string }]>`SELECT COUNT(*) as count FROM quilts WHERE 1=1`;

        if (season) {
          query = sql<[{ count: string }]>`${query} AND season = ${season}`;
        }

        if (status) {
          query = sql<[{ count: string }]>`${query} AND current_status = ${status}`;
        }

        if (location) {
          query = sql<[{ count: string }]>`${query} AND location ILIKE ${`%${location}%`}`;
        }

        if (brand) {
          query = sql<[{ count: string }]>`${query} AND brand ILIKE ${`%${brand}%`}`;
        }

        if (search) {
          query = sql<[{ count: string }]>`${query} AND (
            name ILIKE ${`%${search}%`} OR
            color ILIKE ${`%${search}%`} OR
            fill_material ILIKE ${`%${search}%`} OR
            notes ILIKE ${`%${search}%`}
          )`;
        }

        const result = await query;
        return parseInt(result[0]?.count || '0', 10);
      },
      'count',
      { filters }
    );
  }
}

// Export singleton instance
export const quiltRepository = new QuiltRepository();
