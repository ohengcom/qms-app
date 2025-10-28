import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Utility to analyze Excel file structure
export function analyzeExcelFile(filePath: string) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    console.log('Excel File Analysis:');
    console.log('==================');
    console.log('Sheet Names:', sheetNames);

    sheetNames.forEach((sheetName, index) => {
      console.log(`\nSheet ${index + 1}: ${sheetName}`);
      console.log('-------------------');

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      console.log('Dimensions:', XLSX.utils.decode_range(worksheet['!ref'] || 'A1').e);
      console.log('First 5 rows:');
      jsonData.slice(0, 5).forEach((row, rowIndex) => {
        console.log(`Row ${rowIndex + 1}:`, row);
      });

      // Try to detect headers
      if (jsonData.length > 0) {
        console.log('Detected Headers:', jsonData[0]);
      }
    });

    return {
      sheetNames,
      sheets: sheetNames.map(name => ({
        name,
        data: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 }),
      })),
    };
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
    return null;
  }
}

// Run analysis on the existing file
if (require.main === module) {
  const filePath = path.join(process.cwd(), '..', '家中被子列表.xlsx');
  analyzeExcelFile(filePath);
}
