import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { ImportExportService } from '@/server/services/ImportExportService';

const importPreviewSchema = z.object({
  fileData: z.string(), // Base64 encoded file data
  fileName: z.string(),
});

const importConfirmSchema = z.object({
  fileData: z.string(), // Base64 encoded file data
  fileName: z.string(),
  confirmed: z.boolean(),
});

const exportOptionsSchema = z.object({
  format: z.enum(['xlsx', 'csv']).default('xlsx'),
  includeUsageHistory: z.boolean().default(true),
  includeMaintenanceRecords: z.boolean().default(false),
  filters: z.object({
    season: z.enum(['WINTER', 'SPRING_AUTUMN', 'SUMMER']).optional(),
    status: z.enum(['AVAILABLE', 'IN_USE', 'STORAGE', 'MAINTENANCE']).optional(),
    location: z.string().optional(),
    dateRange: z.object({
      start: z.date(),
      end: z.date(),
    }).optional(),
  }).optional(),
});

export const importExportRouter = createTRPCRouter({
  // Preview import data before actual import
  previewImport: publicProcedure
    .input(importPreviewSchema)
    .mutation(async ({ ctx, input }) => {
      const importService = new ImportExportService(ctx.db);
      
      try {
        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Get preview of import data
        const result = await importService.importFromExcelBuffer(buffer, true);
        
        return {
          success: true,
          preview: result,
          fileName: input.fileName,
        };
      } catch (error) {
        throw new Error(`Failed to preview import: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Confirm and execute import
  confirmImport: publicProcedure
    .input(importConfirmSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.confirmed) {
        throw new Error('Import must be confirmed');
      }

      const importService = new ImportExportService(ctx.db);
      
      try {
        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Execute the import
        const result = await importService.importFromExcelBuffer(buffer, false);
        
        return {
          success: result.success,
          result,
          fileName: input.fileName,
        };
      } catch (error) {
        throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Export quilts data
  exportQuilts: publicProcedure
    .input(exportOptionsSchema)
    .mutation(async ({ ctx, input }) => {
      const importService = new ImportExportService(ctx.db);
      
      try {
        const result = await importService.exportQuilts(input as any);
        
        return {
          success: true,
          data: result.data,
          filename: result.filename,
          totalRecords: result.totalRecords,
        };
      } catch (error) {
        throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Export quilts to Excel file
  exportQuiltsToExcel: publicProcedure
    .input(exportOptionsSchema)
    .mutation(async ({ ctx, input }) => {
      const importService = new ImportExportService(ctx.db);
      
      try {
        const result = await importService.exportQuiltsToExcelBuffer(input as any);
        
        if (!result.success) {
          throw new Error(result.message || 'Export failed');
        }
        
        // Convert buffer to base64 for transmission
        const base64Data = result.buffer?.toString('base64') || '';
        
        return {
          success: true,
          fileData: base64Data,
          filename: result.filename,
          totalRecords: result.totalRecords,
        };
      } catch (error) {
        throw new Error(`Failed to export Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Export usage report
  exportUsageReport: publicProcedure
    .input(z.object({
      dateRange: z.object({
        start: z.date(),
        end: z.date(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const importService = new ImportExportService(ctx.db);
      
      try {
        const result = await importService.exportUsageReport(input.dateRange);
        
        return {
          success: true,
          data: result.data,
          filename: result.filename,
          totalRecords: result.totalRecords,
        };
      } catch (error) {
        throw new Error(`Failed to export usage report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Export usage report to Excel
  exportUsageReportToExcel: publicProcedure
    .input(z.object({
      dateRange: z.object({
        start: z.date(),
        end: z.date(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const importService = new ImportExportService(ctx.db);
      
      try {
        const result = await importService.exportUsageReportToExcelBuffer(input.dateRange);
        
        if (!result.success) {
          throw new Error(result.message || 'Export failed');
        }
        
        // Convert buffer to base64 for transmission
        const base64Data = result.buffer?.toString('base64') || '';
        
        return {
          success: true,
          fileData: base64Data,
          filename: result.filename,
          totalRecords: result.totalRecords,
        };
      } catch (error) {
        throw new Error(`Failed to export usage report Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Export maintenance report
  exportMaintenanceReport: publicProcedure
    .mutation(async ({ ctx }) => {
      const importService = new ImportExportService(ctx.db);
      
      try {
        const result = await importService.exportMaintenanceReport();
        
        return {
          success: true,
          data: result.data,
          filename: result.filename,
          totalRecords: result.totalRecords,
        };
      } catch (error) {
        throw new Error(`Failed to export maintenance report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Export maintenance report to Excel
  exportMaintenanceReportToExcel: publicProcedure
    .mutation(async ({ ctx }) => {
      const importService = new ImportExportService(ctx.db);
      
      try {
        const result = await importService.exportMaintenanceReportToExcelBuffer();
        
        if (!result.success) {
          throw new Error(result.message || 'Export failed');
        }
        
        // Convert buffer to base64 for transmission
        const base64Data = result.buffer?.toString('base64') || '';
        
        return {
          success: true,
          fileData: base64Data,
          filename: result.filename,
          totalRecords: result.totalRecords,
        };
      } catch (error) {
        throw new Error(`Failed to export maintenance report Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Get import/export statistics
  getImportExportStats: publicProcedure
    .query(async ({ ctx }) => {
      const [totalQuilts, recentImports] = await Promise.all([
        ctx.db.quilt.count(),
        // This would require an import log table in a real implementation
        // For now, return mock data
        Promise.resolve([]),
      ]);

      return {
        totalQuilts,
        recentImports: recentImports.length,
        lastImportDate: null, // Would come from import log
        supportedFormats: ['xlsx', 'csv'],
        maxFileSize: '10MB',
      };
    }),
});