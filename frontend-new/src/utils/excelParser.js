import * as XLSX from 'xlsx';

export async function parseExcelFile(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const phages = rows[1].slice(2); // Skip first two columns

  const bacteriaData = rows.slice(2).map(row => ({
    name: row[0],
    values: row.slice(2).map(v => (v && v !== 0) ? 1 : 0)
  }));

  return {
    headers: phages,
    treeData: {
      name: 'Bacteria',
      children: [
        {
          name: 'Default',
          children: bacteriaData
        }
      ]
    }
  };
}