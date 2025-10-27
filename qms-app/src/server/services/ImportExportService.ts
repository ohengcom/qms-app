import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

// Define enums locally since they're not exported from Prisma
enum Season {
  WINTER = 'WINTER',
  SPRING_AUTUMN = 'SPRING_AUTUMN',
  SUMMER = 'SUMMER'
}

enum QuiltStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  STORAGE = 'STORAGE',
  MAINTENANCE = 'MAINTENANCE'
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: ImportError[];
  summary: {
    totalRows: number;
    successfulImports: number;
    duplicates: number;
    validationErrors: number;
  };
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export interface ExportOptions {
  format: 'xlsx' | 'csv';
  includeUsageHistory: boolean;
  includeMaintenanceRecords: boolean;
  filters?: {
    season?: Season;
    status?: QuiltStatus;
    location?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

export class ImportExportService {
  constructor(private db: PrismaClient) {}

  // Import from Excel buffer (for file uploads)
  async importFromExcelBuffer(buffer: Buffer, preview: boolean = false): Promise<ImportResult> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with first row as headers
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (rawData.length < 2) {
        return {
          success: false,
          imported: 0,
          skipped: 0,
          errors: [{
            row: 1,
            message: 'Excel file must contain at least a header row and one data row'
          }],
          summary: {
            totalRows: 0,
            successfulImports: 0,
            duplicates: 0,
            validationErrors: 1,
          },
        };
      }

      const headers = rawData[0] as string[];
      const dataRows = rawData.slice(1);
      
      // Transform the data to match our expected format
      const transformedData = dataRows.map((row, index) => this.transformChineseExcelRow(row, headers, index + 2));
      
      if (preview) {
        return {
          success: true,
          imported: 0,
          skipped: 0,
          errors: [],
          summary: {
            totalRows: transformedData.length,
            successfulImports: 0,
            duplicates: 0,
            validationErrors: 0,
          },
        };
      }

      return this.importQuiltsFromExcel(transformedData);
    } catch (error) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: [{
          row: 1,
          message: error instanceof Error ? error.message : 'Unknown error during import'
        }],
        summary: {
          totalRows: 0,
          successfulImports: 0,
          duplicates: 0,
          validationErrors: 1,
        },
      };
    }
  }

  // Transform Chinese Excel row to our format
  private transformChineseExcelRow(row: any[], headers: string[], rowNumber: number): any {
    const transformed: any = {};
    
    // Map Chinese headers to our fields
    const headerMap: Record<string, string> = {
      'Group': 'groupId',
      '编号': 'itemNumber',
      '季节': 'season',
      '填充物': 'fillMaterial',
      '颜色': 'color',
      '长': 'lengthCm',
      '宽': 'widthCm',
      '重量（g）': 'weightGrams',
      '放置位置': 'location',
      '包': 'packagingInfo',
      '品牌': 'brand',
      '购买日期': 'purchaseDate',
      '备注': 'notes',
    };

    // Map the basic fields
    headers.forEach((header, index) => {
      const mappedField = headerMap[header];
      if (mappedField && row[index] !== undefined && row[index] !== null && row[index] !== '') {
        transformed[mappedField] = row[index];
      }
    });

    // Generate a name if not provided
    if (!transformed.name) {
      const brand = transformed.brand || 'Quilt';
      const itemNumber = transformed.itemNumber || rowNumber - 1;
      transformed.name = `${brand} #${itemNumber}`;
    }

    // Parse usage history from remaining columns (starting from column 14)
    const usageHistoryColumns = row.slice(14).filter(Boolean);
    if (usageHistoryColumns.length > 0) {
      transformed.usageHistory = usageHistoryColumns;
    }

    return transformed;
  }

  async importQuiltsFromExcel(data: any[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [],
      summary: {
        totalRows: data.length,
        successfulImports: 0,
        duplicates: 0,
        validationErrors: 0,
      },
    };

    // Validate and process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 1;

      try {
        // Validate required fields
        const validationResult = this.validateImportRow(row, rowNumber);
        if (!validationResult.isValid) {
          result.errors.push(...validationResult.errors);
          result.summary.validationErrors++;
          continue;
        }

        // Transform Excel data to Quilt format
        const quiltData = this.transformExcelRowToQuilt(row);

        // Check for duplicates
        const existingQuilt = await this.db.quilt.findUnique({
          where: { itemNumber: quiltData.itemNumber },
        });

        if (existingQuilt) {
          result.errors.push({
            row: rowNumber,
            message: `Quilt with item number ${quiltData.itemNumber} already exists`,
            data: row,
          });
          result.summary.duplicates++;
          result.skipped++;
          continue;
        }

        // Create the quilt
        await this.db.quilt.create({
          data: quiltData,
        });

        result.imported++;
        result.summary.successfulImports++;

      } catch (error) {
        result.errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          data: row,
        });
      }
    }

    result.success = result.imported > 0;
    return result;
  }

  async exportQuilts(options: ExportOptions) {
    const { filters, includeUsageHistory, includeMaintenanceRecords } = options;

    // Build query based on filters
    const where: any = {};
    if (filters?.season) where.season = filters.season;
    if (filters?.status) where.currentStatus = filters.status;
    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    // Get quilts with related data
    const quilts = await this.db.quilt.findMany({
      where,
      include: {
        currentUsage: true,
        usagePeriods: includeUsageHistory ? {
          orderBy: { startDate: 'desc' },
        } : false,
        maintenanceLog: includeMaintenanceRecords ? {
          orderBy: { performedAt: 'desc' },
        } : false,
      },
      orderBy: { itemNumber: 'asc' },
    });

    // Transform data for export
    const exportData = this.transformQuiltsForExport(quilts, {
      includeUsageHistory,
      includeMaintenanceRecords,
    });

    return {
      data: exportData,
      filename: this.generateExportFilename(options),
      totalRecords: quilts.length,
    };
  }

  async exportUsageReport(dateRange: { start: Date; end: Date }) {
    const usagePeriods = await this.db.usagePeriod.findMany({
      where: {
        OR: [
          {
            startDate: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          {
            endDate: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
        ],
      },
      include: {
        quilt: {
          select: {
            itemNumber: true,
            name: true,
            season: true,
            brand: true,
            location: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    const reportData = usagePeriods.map((period: any) => ({
      'Item Number': period.quilt.itemNumber,
      'Quilt Name': period.quilt.name,
      'Season': period.quilt.season,
      'Brand': period.quilt.brand || '',
      'Location': period.quilt.location,
      'Start Date': period.startDate.toISOString().split('T')[0],
      'End Date': period.endDate?.toISOString().split('T')[0] || 'Ongoing',
      'Duration (Days)': period.durationDays || 'Ongoing',
      'Usage Type': period.usageType,
      'Season Used': period.seasonUsed || '',
      'Notes': period.notes || '',
    }));

    return {
      data: reportData,
      filename: `usage-report-${dateRange.start.toISOString().split('T')[0]}-to-${dateRange.end.toISOString().split('T')[0]}.xlsx`,
      totalRecords: reportData.length,
    };
  }

  async exportMaintenanceReport() {
    const maintenanceRecords = await this.db.maintenanceRecord.findMany({
      include: {
        quilt: {
          select: {
            itemNumber: true,
            name: true,
            season: true,
            brand: true,
          },
        },
      },
      orderBy: { performedAt: 'desc' },
    });

    const reportData = maintenanceRecords.map((record: any) => ({
      'Item Number': record.quilt.itemNumber,
      'Quilt Name': record.quilt.name,
      'Season': record.quilt.season,
      'Brand': record.quilt.brand || '',
      'Maintenance Type': record.type,
      'Description': record.description,
      'Performed Date': record.performedAt.toISOString().split('T')[0],
      'Cost': record.cost || '',
      'Next Due Date': record.nextDueDate?.toISOString().split('T')[0] || '',
    }));

    return {
      data: reportData,
      filename: `maintenance-report-${new Date().toISOString().split('T')[0]}.xlsx`,
      totalRecords: reportData.length,
    };
  }

  private validateImportRow(row: any, rowNumber: number): { isValid: boolean; errors: ImportError[] } {
    const errors: ImportError[] = [];

    // Required fields validation
    if (!row['编号'] && !row['Item Number'] && !row.itemNumber) {
      errors.push({
        row: rowNumber,
        field: 'itemNumber',
        message: 'Item number is required',
      });
    }

    if (!row['名称'] && !row['Name'] && !row.name) {
      errors.push({
        row: rowNumber,
        field: 'name',
        message: 'Name is required',
      });
    }

    if (!row['季节'] && !row['Season'] && !row.season) {
      errors.push({
        row: rowNumber,
        field: 'season',
        message: 'Season is required',
      });
    }

    // Validate season value
    const seasonValue = row['季节'] || row['Season'] || row.season;
    if (seasonValue && !this.isValidSeason(seasonValue)) {
      errors.push({
        row: rowNumber,
        field: 'season',
        message: `Invalid season value: ${seasonValue}. Must be one of: WINTER, SPRING_AUTUMN, SUMMER`,
      });
    }

    // Validate numeric fields
    const itemNumber = row['编号'] || row['Item Number'] || row.itemNumber;
    if (itemNumber && (isNaN(parseInt(itemNumber)) || parseInt(itemNumber) <= 0)) {
      errors.push({
        row: rowNumber,
        field: 'itemNumber',
        message: 'Item number must be a positive integer',
      });
    }

    const weight = row['重量（g）'] || row['Weight (g)'] || row.weightGrams;
    if (weight && (isNaN(parseInt(weight)) || parseInt(weight) <= 0)) {
      errors.push({
        row: rowNumber,
        field: 'weightGrams',
        message: 'Weight must be a positive integer',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private transformExcelRowToQuilt(row: any) {
    return {
      itemNumber: parseInt(row['编号'] || row['Item Number'] || row.itemNumber),
      groupId: row['Group'] || row.groupId ? parseInt(row['Group'] || row.groupId) : null,
      name: row['名称'] || row['Name'] || row.name,
      season: this.mapSeasonValue(row['季节'] || row['Season'] || row.season),
      lengthCm: parseInt(row['长'] || row['Length (cm)'] || row.lengthCm || 200),
      widthCm: parseInt(row['宽'] || row['Width (cm)'] || row.widthCm || 180),
      weightGrams: parseInt(row['重量（g）'] || row['Weight (g)'] || row.weightGrams),
      fillMaterial: row['填充物'] || row['Fill Material'] || row.fillMaterial,
      materialDetails: row['材质详情'] || row['Material Details'] || row.materialDetails || null,
      color: row['颜色'] || row['Color'] || row.color,
      brand: row['品牌'] || row['Brand'] || row.brand || null,
      purchaseDate: this.parseDate(row['购买日期'] || row['Purchase Date'] || row.purchaseDate),
      location: row['放置位置'] || row['Location'] || row.location,
      packagingInfo: row['包'] || row['Packaging'] || row.packagingInfo || null,
      currentStatus: this.mapStatusValue(row['状态'] || row['Status'] || row.currentStatus) || QuiltStatus.AVAILABLE,
      notes: row['备注'] || row['Notes'] || row.notes || null,
    };
  }

  private transformQuiltsForExport(quilts: any[], options: { includeUsageHistory: boolean; includeMaintenanceRecords: boolean }) {
    return quilts.map(quilt => {
      const baseData = {
        'Item Number': quilt.itemNumber,
        'Group ID': quilt.groupId || '',
        'Name': quilt.name,
        'Season': quilt.season,
        'Length (cm)': quilt.lengthCm,
        'Width (cm)': quilt.widthCm,
        'Weight (g)': quilt.weightGrams,
        'Fill Material': quilt.fillMaterial,
        'Material Details': quilt.materialDetails || '',
        'Color': quilt.color,
        'Brand': quilt.brand || '',
        'Purchase Date': quilt.purchaseDate?.toISOString().split('T')[0] || '',
        'Location': quilt.location,
        'Packaging Info': quilt.packagingInfo || '',
        'Current Status': quilt.currentStatus,
        'Notes': quilt.notes || '',
        'Created At': quilt.createdAt.toISOString().split('T')[0],
        'Updated At': quilt.updatedAt.toISOString().split('T')[0],
      };

      // Add usage statistics
      if (options.includeUsageHistory && quilt.usagePeriods) {
        const totalUsageDays = quilt.usagePeriods.reduce((sum: number, period: any) => 
          sum + (period.durationDays || 0), 0);
        
        (baseData as any)['Total Usage Count'] = quilt.usagePeriods.length;
        (baseData as any)['Total Usage Days'] = totalUsageDays;
        (baseData as any)['Average Usage Duration'] = quilt.usagePeriods.length > 0 
          ? Math.round(totalUsageDays / quilt.usagePeriods.length) 
          : 0;
        (baseData as any)['Last Used Date'] = quilt.usagePeriods[0]?.startDate?.toISOString().split('T')[0] || '';
      }

      // Add maintenance info
      if (options.includeMaintenanceRecords && quilt.maintenanceLog) {
        (baseData as any)['Maintenance Count'] = quilt.maintenanceLog.length;
        (baseData as any)['Last Maintenance Date'] = quilt.maintenanceLog[0]?.performedAt?.toISOString().split('T')[0] || '';
        (baseData as any)['Last Maintenance Type'] = quilt.maintenanceLog[0]?.type || '';
      }

      // Add current usage info
      if (quilt.currentUsage) {
        (baseData as any)['Currently In Use'] = 'Yes';
        (baseData as any)['Usage Started'] = quilt.currentUsage.startedAt.toISOString().split('T')[0];
        (baseData as any)['Expected End Date'] = quilt.currentUsage.expectedEndDate?.toISOString().split('T')[0] || '';
      } else {
        (baseData as any)['Currently In Use'] = 'No';
      }

      return baseData;
    });
  }

  private isValidSeason(season: string): boolean {
    const validSeasons = [
      'WINTER', 'SPRING_AUTUMN', 'SUMMER', 
      'winter', 'spring_autumn', 'summer',
      '冬', '春秋', '夏', '春', '秋'
    ];
    return validSeasons.includes(season);
  }

  private mapSeasonValue(season: string): Season {
    const seasonMap: Record<string, Season> = {
      'winter': Season.WINTER,
      'WINTER': Season.WINTER,
      '冬': Season.WINTER,
      'spring_autumn': Season.SPRING_AUTUMN,
      'SPRING_AUTUMN': Season.SPRING_AUTUMN,
      '春秋': Season.SPRING_AUTUMN,
      '春': Season.SPRING_AUTUMN,
      '秋': Season.SPRING_AUTUMN,
      'summer': Season.SUMMER,
      'SUMMER': Season.SUMMER,
      '夏': Season.SUMMER,
    };

    return seasonMap[season] || Season.SPRING_AUTUMN;
  }

  private mapStatusValue(status: string): QuiltStatus | null {
    if (!status) return null;

    const statusMap: Record<string, QuiltStatus> = {
      'available': QuiltStatus.AVAILABLE,
      'AVAILABLE': QuiltStatus.AVAILABLE,
      '可用': QuiltStatus.AVAILABLE,
      'in_use': QuiltStatus.IN_USE,
      'IN_USE': QuiltStatus.IN_USE,
      '使用中': QuiltStatus.IN_USE,
      'storage': QuiltStatus.STORAGE,
      'STORAGE': QuiltStatus.STORAGE,
      '存储': QuiltStatus.STORAGE,
      'maintenance': QuiltStatus.MAINTENANCE,
      'MAINTENANCE': QuiltStatus.MAINTENANCE,
      '维护': QuiltStatus.MAINTENANCE,
    };

    return statusMap[status] || null;
  }

  private parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  private generateExportFilename(options: ExportOptions): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const filters = [];
    
    if (options.filters?.season) filters.push(options.filters.season.toLowerCase());
    if (options.filters?.status) filters.push(options.filters.status.toLowerCase());
    if (options.filters?.location) filters.push(options.filters.location.toLowerCase().replace(/\s+/g, '-'));
    
    const filterSuffix = filters.length > 0 ? `-${filters.join('-')}` : '';
    const extension = options.format === 'csv' ? 'csv' : 'xlsx';
    
    return `quilts-export-${timestamp}${filterSuffix}.${extension}`;
  }

  // Export quilts to Excel buffer for download
  async exportQuiltsToExcelBuffer(options: ExportOptions) {
    try {
      const exportData = await this.exportQuilts(options);
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData.data);
      
      // Set column widths for better formatting
      const columnWidths = [
        { wch: 10 }, // Item Number
        { wch: 8 },  // Group ID
        { wch: 20 }, // Name
        { wch: 12 }, // Season
        { wch: 10 }, // Length
        { wch: 10 }, // Width
        { wch: 10 }, // Weight
        { wch: 15 }, // Fill Material
        { wch: 15 }, // Color
        { wch: 15 }, // Brand
        { wch: 12 }, // Purchase Date
        { wch: 20 }, // Location
        { wch: 15 }, // Packaging Info
        { wch: 12 }, // Current Status
        { wch: 30 }, // Notes
      ];
      worksheet['!cols'] = columnWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Quilts');
      
      // Generate Excel buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return {
        success: true,
        buffer,
        filename: exportData.filename,
        totalRecords: exportData.totalRecords,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Export failed',
        buffer: null,
        filename: '',
        totalRecords: 0,
      };
    }
  }

  // Export usage report to Excel buffer
  async exportUsageReportToExcelBuffer(dateRange: { start: Date; end: Date }) {
    try {
      const reportData = await this.exportUsageReport(dateRange);
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(reportData.data);
      
      // Set column widths
      const columnWidths = [
        { wch: 10 }, // Item Number
        { wch: 20 }, // Quilt Name
        { wch: 12 }, // Season
        { wch: 15 }, // Brand
        { wch: 20 }, // Location
        { wch: 12 }, // Start Date
        { wch: 12 }, // End Date
        { wch: 12 }, // Duration
        { wch: 12 }, // Usage Type
        { wch: 12 }, // Season Used
        { wch: 30 }, // Notes
      ];
      worksheet['!cols'] = columnWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Usage Report');
      
      // Generate Excel buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return {
        success: true,
        buffer,
        filename: reportData.filename,
        totalRecords: reportData.totalRecords,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Export failed',
        buffer: null,
        filename: '',
        totalRecords: 0,
      };
    }
  }

  // Export maintenance report to Excel buffer
  async exportMaintenanceReportToExcelBuffer() {
    try {
      const reportData = await this.exportMaintenanceReport();
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(reportData.data);
      
      // Set column widths
      const columnWidths = [
        { wch: 10 }, // Item Number
        { wch: 20 }, // Quilt Name
        { wch: 12 }, // Season
        { wch: 15 }, // Brand
        { wch: 15 }, // Maintenance Type
        { wch: 30 }, // Description
        { wch: 12 }, // Performed Date
        { wch: 10 }, // Cost
        { wch: 12 }, // Next Due Date
      ];
      worksheet['!cols'] = columnWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Report');
      
      // Generate Excel buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return {
        success: true,
        buffer,
        filename: reportData.filename,
        totalRecords: reportData.totalRecords,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Export failed',
        buffer: null,
        filename: '',
        totalRecords: 0,
      };
    }
  }
}