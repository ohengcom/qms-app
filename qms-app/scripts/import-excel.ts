#!/usr/bin/env tsx

/**
 * Import script for 家中被子列表.xlsx
 * This script reads the Excel file and imports quilt data into the QMS database
 */

import * as XLSX from 'xlsx';
import { PrismaClient, Season, QuiltStatus } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Mapping functions for data conversion
function mapSeason(seasonStr: string): Season {
  const season = seasonStr?.toLowerCase().trim();
  if (season?.includes('冬') || season?.includes('winter')) return 'WINTER';
  if (season?.includes('夏') || season?.includes('summer')) return 'SUMMER';
  return 'SPRING_AUTUMN'; // Default for spring/autumn
}

function mapStatus(statusStr: string): QuiltStatus {
  const status = statusStr?.toLowerCase().trim();
  if (status?.includes('使用') || status?.includes('in use')) return 'IN_USE';
  if (status?.includes('维护') || status?.includes('maintenance')) return 'MAINTENANCE';
  if (status?.includes('存储') || status?.includes('storage')) return 'STORAGE';
  return 'AVAILABLE'; // Default
}

function parseWeight(weightStr: string | number): number {
  if (typeof weightStr === 'number') return Math.round(weightStr);
  if (typeof weightStr === 'string') {
    const match = weightStr.match(/(\d+(?:\.\d+)?)/);
    return match ? Math.round(parseFloat(match[1]) * 1000) : 2000; // Convert kg to grams, default 2kg
  }
  return 2000; // Default 2kg in grams
}

function parseDimensions(dimStr: string | number): { length: number; width: number } {
  if (typeof dimStr === 'number') return { length: dimStr, width: dimStr };
  if (typeof dimStr === 'string') {
    const match = dimStr.match(/(\d+).*?[x×*].*?(\d+)/i);
    if (match) {
      return {
        length: parseInt(match[1]),
        width: parseInt(match[2])
      };
    }
    // Try single number
    const singleMatch = dimStr.match(/(\d+)/);
    if (singleMatch) {
      const size = parseInt(singleMatch[1]);
      return { length: size, width: size };
    }
  }
  return { length: 200, width: 150 }; // Default dimensions in cm
}

// Parse usage period from string like "2023/11/30~2024/05/04"
function parseUsagePeriod(usageStr: string): { startDate: Date; endDate: Date } | null {
  if (!usageStr || typeof usageStr !== 'string') return null;
  
  // Match patterns like "2023/11/30~2024/05/04" or "2020/11/28 ~2021/4/30"
  const match = usageStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s*[~～]\s*(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  
  if (match) {
    const [, startYear, startMonth, startDay, endYear, endMonth, endDay] = match;
    
    try {
      const startDate = new Date(
        parseInt(startYear),
        parseInt(startMonth) - 1, // Month is 0-indexed
        parseInt(startDay)
      );
      
      const endDate = new Date(
        parseInt(endYear),
        parseInt(endMonth) - 1,
        parseInt(endDay)
      );
      
      // Validate dates
      if (startDate.getTime() && endDate.getTime() && startDate < endDate) {
        return { startDate, endDate };
      }
    } catch (error) {
      console.warn(`Failed to parse usage period: ${usageStr}`);
    }
  }
  
  return null;
}

// Calculate duration in days
function calculateDuration(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

async function importExcelData() {
  try {
    console.log('🚀 Starting Excel import...');
    
    // Find the Excel file
    const excelPath = path.join(process.cwd(), '..', '家中被子列表.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.error('❌ Excel file not found at:', excelPath);
      console.log('📁 Looking for file in current directory...');
      
      // Try current directory
      const currentDirPath = path.join(process.cwd(), '家中被子列表.xlsx');
      if (fs.existsSync(currentDirPath)) {
        console.log('✅ Found file in current directory');
      } else {
        console.error('❌ Excel file not found. Please ensure 家中被子列表.xlsx is in the project root.');
        return;
      }
    }
    
    // Read the Excel file
    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`📊 Found ${data.length} rows in Excel file`);
    
    if (data.length === 0) {
      console.log('⚠️ No data found in Excel file');
      return;
    }
    
    // Show first row to understand structure
    console.log('📋 First row structure:', Object.keys(data[0] as any));
    console.log('📋 Sample data:', data[0]);
    
    // Clear existing sample data (optional)
    console.log('🧹 Clearing existing sample quilts...');
    await prisma.currentUsage.deleteMany();
    await prisma.usagePeriod.deleteMany();
    await prisma.maintenanceRecord.deleteMany();
    await prisma.quilt.deleteMany();
    
    let importCount = 0;
    let itemNumber = 1;
    
    // Process each row
    for (const row of data as any[]) {
      try {
        // Map Excel columns to database fields based on actual structure
        const name = row['名称'] || `${row['填充物'] || '被子'} ${itemNumber}号`;
        const seasonStr = row['季节'] || '春秋';
        const weightStr = row['重量（g）'] || row['重量'] || '2000';
        const length = row['长'] || 200;
        const width = row['宽'] || 150;
        const material = row['填充物'] || '棉花';
        const color = row['颜色'] || '白色';
        const brand = row['品牌'] || '';
        const location = row['放置位置'] || '卧室';
        const packaging = row['包'] || '';
        const statusStr = row['状态'] || '可用';
        const notes = [
          row['备注'] || '',
          packaging ? `包装: ${packaging}` : '',
          row['上次使用'] ? `上次使用: ${row['上次使用']}` : ''
        ].filter(Boolean).join('; ');
        
        // Parse and convert data
        const season = mapSeason(seasonStr);
        const status = mapStatus(statusStr);
        const weight = parseWeight(weightStr);
        
        // Create quilt record
        const quilt = await prisma.quilt.create({
          data: {
            itemNumber: itemNumber,
            name: name,
            season: season,
            lengthCm: typeof length === 'number' ? length : parseInt(length) || 200,
            widthCm: typeof width === 'number' ? width : parseInt(width) || 150,
            weightGrams: weight,
            fillMaterial: material,
            color: color,
            brand: brand || null,
            location: location,
            currentStatus: status,
            notes: notes || null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        // Import usage history data
        const usageColumns = [
          '上次使用', '上上次使用', '上上上次使用', '上^4次', '上^5次', 
          '上^6次', '上^7次', '上^8次', '上^9次', '上^10次'
        ];
        
        let usageCount = 0;
        for (const columnName of usageColumns) {
          const usageStr = row[columnName];
          if (usageStr) {
            const period = parseUsagePeriod(usageStr);
            if (period) {
              try {
                const duration = calculateDuration(period.startDate, period.endDate);
                
                await prisma.usagePeriod.create({
                  data: {
                    quiltId: quilt.id,
                    startDate: period.startDate,
                    endDate: period.endDate,
                    durationDays: duration,
                    usageType: 'REGULAR',
                    notes: `历史使用记录 (${columnName})`,
                    createdAt: period.endDate // Use end date as creation time for historical records
                  }
                });
                
                usageCount++;
              } catch (error) {
                console.warn(`Failed to create usage period for ${quilt.name}: ${usageStr}`);
              }
            }
          }
        }
        
        console.log(`✅ Imported: ${quilt.name} (${quilt.season}, ${quilt.weightGrams}g) + ${usageCount} usage periods`);
        importCount++;
        itemNumber++;
        
      } catch (error) {
        console.error(`❌ Error importing row ${itemNumber}:`, error);
        console.error('Row data:', row);
        itemNumber++; // Continue with next item number
      }
    }
    
    console.log(`🎉 Import completed! Successfully imported ${importCount} quilts.`);
    
    // Show summary
    const totalQuilts = await prisma.quilt.count();
    const totalUsagePeriods = await prisma.usagePeriod.count();
    const byStatus = await prisma.quilt.groupBy({
      by: ['currentStatus'],
      _count: true
    });
    const bySeason = await prisma.quilt.groupBy({
      by: ['season'],
      _count: true
    });
    
    console.log('\n📊 Database Summary:');
    console.log(`Total quilts: ${totalQuilts}`);
    console.log(`Total usage periods: ${totalUsagePeriods}`);
    console.log('By status:', byStatus);
    console.log('By season:', bySeason);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
if (require.main === module) {
  importExcelData();
}

export { importExcelData };