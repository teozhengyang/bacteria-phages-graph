import { ParsedExcelData } from '#types/excel.types.js';
import * as XLSX from 'xlsx';

// Parse Excel file with built-in validation
function parseExcelFile(fileBuffer: Buffer): ParsedExcelData {
    try {
        // Parse the Excel workbook from buffer and get the first sheet
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        
        if (workbook.SheetNames.length === 0) throw new Error('Excel file contains no sheets');

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert sheet to 2D array format for easier processing
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Validate structure and data
        if (rows.length < 3) throw new Error('Excel file must have at least 3 rows (metadata, headers, and data)');

        if (!rows[1] || rows[1].length < 3) throw new Error('Header row (row 2) must have at least 3 columns');

        // Extract phage names from row 2 (index 1), starting from column 3 (index 2)
        const phageNames = (rows[1].slice(2) as string[])
                            .filter(phage => phage && phage !== '')
                            .map(phage => phage.trim());

        if (phageNames.length === 0) throw new Error('No phage names found in header row (row 2, columns 3+)');

        // Extract bacteria names and interaction data
        const bacteriaNames: string[] = [];
        const interactions: number[][] = [];

        const dataRows = rows.slice(2).filter(row => row[0] != null && row[0] !== '');

        if (dataRows.length === 0) throw new Error('No bacteria data found starting from row 3');

        dataRows.forEach(row => {
            const bacteriaName = String(row[0]).trim();
            bacteriaNames.push(bacteriaName);
            
            // Convert interaction values to binary: any non-zero value becomes 1, zero/empty becomes 0
            const values = row.slice(2, 2 + phageNames.length).map(v => {
                if (v == null || v === '') return 0;
                const numValue = Number(v);
                return (!isNaN(numValue) && numValue !== 0) ? 1 : 0;
            });

            // Ensure we have the same number of values as phages
            while (values.length < phageNames.length) {
                values.push(0);
            }

            interactions.push(values.slice(0, phageNames.length));
        });

        return {
            bacteriaNames,
            interactions,
            phageNames
        };

    } catch (error) {
        console.error('Error parsing Excel file:', error);
        throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

const ExcelParserUtils = {
    parseExcelFile
};

export default ExcelParserUtils;
