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
  async getQuilts(filters: {
    season?: string;
    status?: string;
    location?: string;
    brand?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) {
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

  // Create quilt
  async createQuilt(data: any) {
    const query = `
      INSERT INTO quilts (
        id, item_number, group_id, name, season, length_cm, width_cm, weight_grams,
        fill_material, material_details, color, brand, purchase_date, location,
        packaging_info, current_status, notes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING *
    `;
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const params = [
      id,
      data.itemNumber,
      data.groupId || null,
      data.name,
      data.season,
      data.lengthCm,
      data.widthCm,
      data.weightGrams,
      data.fillMaterial,
      data.materialDetails || null,
      data.color,
      data.brand || null,
      data.purchaseDate || null,
      data.location,
      data.packagingInfo || null,
      data.currentStatus || 'AVAILABLE',
      data.notes || null,
      now,
      now
    ];

    const result = await executeQuery(query, params);
    return result[0];
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
  }
};