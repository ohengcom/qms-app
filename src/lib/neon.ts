import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Create Neon serverless connection
export const sql = neon(process.env.DATABASE_URL);

// Helper function to execute queries with error handling
export async function executeQuery<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
  try {
    // For queries without parameters, use simple tagged template
    if (params.length === 0) {
      const result = await sql`${queryText}`;
      return result as T[];
    }

    // For parameterized queries, we need to use Neon's tagged template syntax
    // Neon supports parameter interpolation in tagged templates
    let processedQuery = queryText;

    // Replace $1, $2, etc. with actual parameter values safely
    params.forEach((param, index) => {
      const placeholder = `$${index + 1}`;
      let escapedParam: string;

      if (param === null || param === undefined) {
        escapedParam = 'NULL';
      } else if (typeof param === 'string') {
        // Escape single quotes and wrap in quotes
        escapedParam = `'${param.replace(/'/g, "''")}'`;
      } else if (param instanceof Date) {
        escapedParam = `'${param.toISOString()}'`;
      } else if (typeof param === 'boolean') {
        escapedParam = param ? 'TRUE' : 'FALSE';
      } else {
        escapedParam = String(param);
      }

      processedQuery = processedQuery.replace(new RegExp(`\\${placeholder}\\b`, 'g'), escapedParam);
    });

    // Execute with tagged template literal
    const result = await sql`${processedQuery}`;
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper functions for common operations
export const db = {
  // Get all quilts with optional filtering
  async getQuilts(
    _filters: {
      season?: string;
      status?: string;
      location?: string;
      brand?: string;
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    try {
      console.log('Executing getQuilts query with data transformation...');

      // Get quilts from database
      const result = await sql`
        SELECT * FROM quilts 
        ORDER BY created_at DESC 
        LIMIT 20
      `;

      console.log('Query result:', result);
      console.log('Number of records:', result?.length || 0);

      // Transform database records to match frontend interface
      const transformedQuilts = result.map((quilt: any) => ({
        id: String(quilt.id),
        itemNumber: Number(quilt.item_number),
        name: String(quilt.name || ''),
        season: quilt.season as 'WINTER' | 'SPRING_AUTUMN' | 'SUMMER',
        lengthCm: Number(quilt.length_cm),
        widthCm: Number(quilt.width_cm),
        weightGrams: Number(quilt.weight_grams),
        fillMaterial: String(quilt.fill_material || ''),
        materialDetails: quilt.material_details || null,
        color: String(quilt.color || ''),
        brand: quilt.brand || null,
        purchaseDate: quilt.purchase_date ? new Date(quilt.purchase_date) : null,
        location: String(quilt.location || ''),
        packagingInfo: quilt.packaging_info || null,
        currentStatus: quilt.current_status as 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'STORAGE',
        notes: quilt.notes || null,
        imageUrl: quilt.image_url || null,
        thumbnailUrl: quilt.thumbnail_url || null,
        createdAt: new Date(quilt.created_at),
        updatedAt: new Date(quilt.updated_at),
        // Add optional fields that QuiltCard expects
        currentUsage: null,
        usagePeriods: [],
      }));

      return transformedQuilts;
    } catch (error) {
      console.error('Get quilts error:', error);
      console.error('Error details:', error);
      return [];
    }
  },

  // Get quilt by ID
  async getQuiltById(id: string) {
    try {
      // For now, we'll need to get all quilts and filter in JavaScript
      // This is not optimal but will work for basic functionality
      const result = await sql`
        SELECT q.*, 
               cu.id as current_usage_id,
               cu.started_at as current_usage_started,
               cu.usage_type as current_usage_type,
               cu.notes as current_usage_notes
        FROM quilts q
        LEFT JOIN current_usage cu ON q.id = cu.quilt_id
      `;
      return result.find((quilt: any) => quilt.id === id) || null;
    } catch (error) {
      console.error('Get quilt by ID error:', error);
      return null;
    }
  },

  // Count quilts
  async countQuilts(filters: any = {}) {
    try {
      // For simple count without filters, use direct SQL
      if (!filters.season && !filters.status) {
        const result = await sql`SELECT COUNT(*) as count FROM quilts`;
        return parseInt(result[0]?.count || '0');
      }

      // For filtered queries, we'll need to handle this differently
      // For now, just return the basic count
      const result = await sql`SELECT COUNT(*) as count FROM quilts`;
      return parseInt(result[0]?.count || '0');
    } catch (error) {
      console.error('Count quilts error:', error);
      return 0;
    }
  },

  // Helper function to generate quilt name
  generateQuiltName(data: any): string {
    // Format: "品牌"+"颜色"+"重量"+重量单位"+"季节"+被
    // Example: 百思寒褐色1100克春秋被
    const brand = data.brand || '未知品牌';
    const color = data.color || '未知颜色';
    const weight = data.weightGrams || 0;

    // Map season to Chinese
    const seasonMap: Record<string, string> = {
      WINTER: '冬',
      SPRING_AUTUMN: '春秋',
      SUMMER: '夏',
    };
    const season = seasonMap[data.season] || '通用';

    return `${brand}${color}${weight}克${season}被`;
  },

  // Get next item number
  async getNextItemNumber(): Promise<number> {
    try {
      const result = await sql`
        SELECT COALESCE(MAX(item_number), 0) + 1 as next_number
        FROM quilts
      `;
      return result[0]?.next_number || 1;
    } catch (error) {
      console.error('Get next item number error:', error);
      return 1;
    }
  },

  // Create quilt
  async createQuilt(data: any) {
    try {
      console.log('Creating quilt with data:', data);

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      // Auto-generate item number and name
      const itemNumber = await this.getNextItemNumber();
      const name = this.generateQuiltName(data);

      console.log('Generated itemNumber:', itemNumber, 'name:', name);

      // Use Neon's tagged template literal syntax directly
      const result = await sql`
        INSERT INTO quilts (
          id, item_number, group_id, name, season, length_cm, width_cm, weight_grams,
          fill_material, material_details, color, brand, purchase_date, location,
          packaging_info, current_status, notes, created_at, updated_at
        ) VALUES (
          ${id},
          ${itemNumber},
          ${data.groupId || null},
          ${name},
          ${data.season},
          ${data.lengthCm},
          ${data.widthCm},
          ${data.weightGrams},
          ${data.fillMaterial},
          ${data.materialDetails || null},
          ${data.color},
          ${data.brand || null},
          ${data.purchaseDate || null},
          ${data.location},
          ${data.packagingInfo || null},
          ${data.currentStatus || 'MAINTENANCE'},
          ${data.notes || null},
          ${now},
          ${now}
        ) RETURNING *
      `;

      console.log('Quilt created successfully:', result[0]);
      return result[0];
    } catch (error) {
      console.error('Create quilt error:', error);
      throw error;
    }
  },

  // Get current usage
  async getCurrentUsage() {
    try {
      const result = await sql`
        SELECT cu.*, q.name as quilt_name, q.color as quilt_color
        FROM current_usage cu
        JOIN quilts q ON cu.quilt_id = q.id
        ORDER BY cu.started_at DESC
      `;
      return result;
    } catch (error) {
      console.error('Get current usage error:', error);
      return [];
    }
  },

  // Check database connection
  async testConnection() {
    try {
      const result = await sql`SELECT 1 as test`;
      return result[0]?.test === 1;
    } catch (error) {
      console.error('Test connection error:', error);
      throw error;
    }
  },

  // Update quilt
  async updateQuilt(id: string, data: any) {
    try {
      console.log('Updating quilt:', id, 'with data:', data);

      const now = new Date().toISOString();

      // Build dynamic UPDATE query based on provided fields
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Only update fields that are provided
      if (data.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(data.name);
      }
      if (data.season !== undefined) {
        updates.push(`season = $${paramIndex++}`);
        values.push(data.season);
      }
      if (data.lengthCm !== undefined) {
        updates.push(`length_cm = $${paramIndex++}`);
        values.push(data.lengthCm);
      }
      if (data.widthCm !== undefined) {
        updates.push(`width_cm = $${paramIndex++}`);
        values.push(data.widthCm);
      }
      if (data.weightGrams !== undefined) {
        updates.push(`weight_grams = $${paramIndex++}`);
        values.push(data.weightGrams);
      }
      if (data.fillMaterial !== undefined) {
        updates.push(`fill_material = $${paramIndex++}`);
        values.push(data.fillMaterial);
      }
      if (data.materialDetails !== undefined) {
        updates.push(`material_details = $${paramIndex++}`);
        values.push(data.materialDetails || null);
      }
      if (data.color !== undefined) {
        updates.push(`color = $${paramIndex++}`);
        values.push(data.color);
      }
      if (data.brand !== undefined) {
        updates.push(`brand = $${paramIndex++}`);
        values.push(data.brand || null);
      }
      if (data.purchaseDate !== undefined) {
        updates.push(`purchase_date = $${paramIndex++}`);
        values.push(data.purchaseDate || null);
      }
      if (data.location !== undefined) {
        updates.push(`location = $${paramIndex++}`);
        values.push(data.location);
      }
      if (data.packagingInfo !== undefined) {
        updates.push(`packaging_info = $${paramIndex++}`);
        values.push(data.packagingInfo || null);
      }
      if (data.currentStatus !== undefined) {
        updates.push(`current_status = $${paramIndex++}`);
        values.push(data.currentStatus);
      }
      if (data.notes !== undefined) {
        updates.push(`notes = $${paramIndex++}`);
        values.push(data.notes || null);
      }

      // Always update updated_at
      updates.push(`updated_at = $${paramIndex++}`);
      values.push(now);

      if (updates.length === 1) {
        // Only updated_at, nothing else to update
        console.log('No fields to update');
        return null;
      }

      // Add id for WHERE clause
      values.push(id);

      const query = `
        UPDATE quilts 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await executeQuery(query, values);

      console.log('Quilt updated successfully:', result[0]);
      return result[0] || null;
    } catch (error) {
      console.error('Update quilt error:', error);
      throw error;
    }
  },

  // Delete quilt
  async deleteQuilt(id: string) {
    try {
      console.log('Deleting quilt:', id);

      // First delete any related records (usage_records, maintenance_records)
      // Note: CASCADE should handle this, but we do it explicitly for clarity
      await sql`DELETE FROM usage_records WHERE quilt_id = ${id}`;
      await sql`DELETE FROM maintenance_records WHERE quilt_id = ${id}`;

      // Then delete the quilt
      const result = await sql`DELETE FROM quilts WHERE id = ${id} RETURNING id`;

      console.log('Quilt deleted successfully:', result.length > 0);
      return result.length > 0;
    } catch (error) {
      console.error('Delete quilt error:', error);
      throw error;
    }
  },

  // Update quilt status only
  async updateQuiltStatus(id: string, status: string) {
    try {
      console.log('Updating quilt status:', id, 'to:', status);

      const now = new Date().toISOString();

      const result = await sql`
        UPDATE quilts SET 
          current_status = ${status},
          updated_at = ${now}
        WHERE id = ${id}
        RETURNING *
      `;

      console.log('Quilt status updated successfully:', result[0]);
      return result[0] || null;
    } catch (error) {
      console.error('Update quilt status error:', error);
      throw error;
    }
  },

  // Get table info
  async getTables() {
    try {
      const result = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      return result as { table_name: string }[];
    } catch (error) {
      console.error('Get tables error:', error);
      return [];
    }
  },

  // ========== Usage Tracking Functions ==========

  /**
   * Create a new usage record when quilt status changes to IN_USE
   */
  async createUsageRecord(quiltId: string, startDate: string, notes?: string) {
    try {
      console.log('Creating usage record for quilt:', quiltId);

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const result = await sql`
        INSERT INTO usage_records (
          id, quilt_id, start_date, end_date, usage_type, notes, created_at, updated_at
        ) VALUES (
          ${id},
          ${quiltId},
          ${startDate},
          NULL,
          'REGULAR',
          ${notes || null},
          ${now},
          ${now}
        ) RETURNING *
      `;

      console.log('Usage record created successfully:', result[0]);
      return result[0];
    } catch (error) {
      console.error('Create usage record error:', error);
      throw error;
    }
  },

  /**
   * End the active usage record when quilt status changes from IN_USE
   */
  async endUsageRecord(quiltId: string, endDate: string, notes?: string) {
    try {
      console.log('Ending usage record for quilt:', quiltId);

      const now = new Date().toISOString();

      // Update the active record by setting end_date
      const result = await sql`
        UPDATE usage_records 
        SET 
          end_date = ${endDate},
          notes = COALESCE(${notes}, notes),
          updated_at = ${now}
        WHERE quilt_id = ${quiltId}
          AND end_date IS NULL
        RETURNING *
      `;

      if (result.length === 0) {
        console.log('No active usage record found for quilt:', quiltId);
        return null;
      }

      console.log('Usage record ended successfully:', result[0]);
      return result[0];
    } catch (error) {
      console.error('End usage record error:', error);
      throw error;
    }
  },

  /**
   * Get the active usage record for a quilt
   */
  async getActiveUsageRecord(quiltId: string) {
    try {
      const result = await sql`
        SELECT * FROM usage_records
        WHERE quilt_id = ${quiltId}
          AND end_date IS NULL
        LIMIT 1
      `;

      return result[0] || null;
    } catch (error) {
      console.error('Get active usage record error:', error);
      return null;
    }
  },

  /**
   * Update a usage record
   */
  async updateUsageRecord(id: string, data: any) {
    try {
      console.log('Updating usage record:', id, 'with data:', data);

      const now = new Date().toISOString();

      const result = await sql`
        UPDATE usage_records SET 
          start_date = ${data.startDate},
          end_date = ${data.endDate || null},
          usage_type = ${data.usageType || 'REGULAR'},
          notes = ${data.notes || null},
          updated_at = ${now}
        WHERE id = ${id}
        RETURNING *
      `;

      console.log('Usage record updated successfully:', result[0]);
      return result[0] || null;
    } catch (error) {
      console.error('Update usage record error:', error);
      throw error;
    }
  },

  /**
   * Get all usage records for a quilt
   */
  async getUsageRecordsByQuiltId(quiltId: string) {
    try {
      const result = await sql`
        SELECT 
          id, 
          quilt_id, 
          start_date as started_at, 
          end_date as ended_at, 
          usage_type, 
          notes, 
          created_at,
          updated_at
        FROM usage_records
        WHERE quilt_id = ${quiltId}
        ORDER BY start_date DESC
      `;

      return result;
    } catch (error) {
      console.error('Get usage records by quilt ID error:', error);
      return [];
    }
  },
};
