import Send from '#utils/response.utils.js';
import { Request, Response } from 'express';
import * as XLSX from 'xlsx';

const ExcelFileController = {
    uploadExcelFile: (req: Request, res: Response) => {
        try {
            const file = req.file;
            
            // Check if file exists 
            if (!file) {
                return Send.badRequest(res, null, 'No file uploaded');
            } 

            // Parse the Excel file (optional - just for demonstration)
            try {
                const workbook = XLSX.read(file.buffer, { type: 'buffer' });
                const sheetNames = workbook.SheetNames;
                
                // Log first sheet data (first 5 rows as example)
                if (sheetNames.length > 0) {
                    const firstSheet = workbook.Sheets[sheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    console.log('First 5 rows of data:', jsonData.slice(0, 5));
                }
            } catch (parseError) {
                console.error('Error parsing Excel file:', parseError);
                return Send.badRequest(res, null, 'Failed to parse Excel file. Please ensure it\'s a valid Excel file.');
            }

            // Return success response
            return Send.success(res, {
                filename: file.originalname,
            }, 'File received successfully');

        } catch (error) {
            console.error('Error processing Excel file:', error);
            return Send.error(res, null, 'Internal server error while processing the file.');
        }
    }

};

export default ExcelFileController;
