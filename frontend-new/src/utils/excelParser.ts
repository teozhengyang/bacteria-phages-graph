import * as XLSX from 'xlsx';
import { ParsedExcelData } from '../types';

export async function parseExcelFile(file: File): Promise<ParsedExcelData> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  console.log('First few rows:', rows.slice(0, 5));
  console.log('Row 1 (headers):', rows[1]);

  const phages = (rows[1].slice(2) as string[]).filter(phage => phage != null && phage !== ''); // Skip first two columns and filter out null/undefined

  const bacteriaData = rows.slice(2)
    .filter(row => row[0] != null && row[0] !== '') // Filter out rows with no bacteria name
    .map(row => ({
      name: String(row[0]),
      values: row.slice(2).map(v => (v && v !== 0) ? 1 : 0)
    }));

  console.log('Parsed phages:', phages.slice(0, 10));
  console.log('Parsed bacteria:', bacteriaData.slice(0, 5));

  return {
    headers: phages,
    treeData: {
      name: 'Bacteria',
      children: [
        {
          name: 'Root',
          children: bacteriaData
        }
      ]
    }
  };
}
