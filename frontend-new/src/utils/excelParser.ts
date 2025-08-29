/**
 * Excel File Parser Utility
 * 
 * Handles parsing of Excel files containing bacteria-phage interaction data.
 * Expected Excel format:
 * - Row 1: Can be any data (usually metadata)
 * - Row 2: Headers - Column 1 & 2 are metadata, Columns 3+ are phage names
 * - Row 3+: Data rows - Column 1 is bacteria name, Columns 3+ are interaction values
 * 
 * The parser converts numeric interaction data to binary (1 for any non-zero value, 0 for zero)
 * to represent presence/absence of phage-bacteria interactions.
 */

import * as XLSX from 'xlsx';
import { ParsedExcelData } from '../types';

/**
 * Parse an Excel file and extract bacteria-phage interaction data
 * 
 * Process:
 * 1. Read Excel file using XLSX library
 * 2. Extract phage names from the header row (row 2, columns 3+)
 * 3. Process bacteria data rows (row 3+) and convert values to binary
 * 4. Structure data into hierarchical format for visualization
 * 
 * @param {File} file - The Excel file to parse
 * @returns {Promise<ParsedExcelData>} Structured data with headers and tree structure
 * @throws {Error} If file cannot be read or parsed
 */
export async function parseExcelFile(file: File): Promise<ParsedExcelData> {
  // Convert file to ArrayBuffer for XLSX processing
  const data = await file.arrayBuffer();
  
  // Parse the Excel workbook and get the first sheet
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Convert sheet to 2D array format for easier processing
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  // Debug logging to help with troubleshooting data format issues
  console.log('First few rows:', rows.slice(0, 5));
  console.log('Row 1 (headers):', rows[1]);

  // Extract phage names from row 2 (index 1), starting from column 3 (index 2)
  // Filter out empty or null values that might appear in Excel
  const phages = (rows[1].slice(2) as string[]).filter(phage => phage != null && phage !== '');

  // Process bacteria data starting from row 3 (index 2)
  const bacteriaData = rows.slice(2)
    .filter(row => row[0] != null && row[0] !== '') // Only include rows with valid bacteria names
    .map(row => ({
      name: String(row[0]), // Bacteria name from first column
      // Convert interaction values to binary: any non-zero value becomes 1, zero/empty becomes 0
      // This represents presence (1) or absence (0) of phage-bacteria interaction
      values: row.slice(2).map(v => (v && v !== 0) ? 1 : 0)
    }));

  // Debug logging for verification
  console.log('Parsed phages:', phages.slice(0, 10));
  console.log('Parsed bacteria:', bacteriaData.slice(0, 5));

  // Return structured data in the format expected by the application
  return {
    headers: phages, // Array of phage names for column headers
    treeData: {
      name: 'Bacteria', // Root node name
      children: [
        {
          name: 'Root', // Default cluster containing all bacteria
          children: bacteriaData // Individual bacteria with their interaction data
        }
      ]
    }
  };
}
