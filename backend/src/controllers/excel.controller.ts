import excelServices from "#services/excel.services.js";
import ExcelParserUtils from '#utils/excelParser.utils.js';
import Send from '#utils/response.utils.js';
import { Request, Response } from 'express';

const ExcelFileController = {
    uploadExcelFile: async (req: Request, res: Response) => {
        try {
            const file = req.file;
            
            // Check if file exists 
            if (!file) {
                return Send.badRequest(res, null, 'No file uploaded');
            } 

            // Parse the Excel file
            const parsedData = ExcelParserUtils.parseExcelFile(file.buffer);

            // save to database
            await excelServices.ExcelService.saveExcelData(parsedData, file.originalname);

            // Return success response with parsed data
            return Send.success(res, "filename: " + file.originalname, 'Excel file processed successfully');

        } catch (error) {
            console.error('Excel processing error:', error);
            
            // Handle different types of errors appropriately
            if (error instanceof Error) {
                // If it's a validation or parsing error (thrown by our utilities), return bad request
                if (error.message.includes('Excel file must have') || 
                    error.message.includes('No phage names found') || 
                    error.message.includes('No bacteria data found') ||
                    error.message.includes('validation failed')) {
                    return Send.badRequest(res, null, error.message);
                }
            }
            
            // For any other unexpected errors, return server error
            return Send.error(res, null, 'Internal server error while processing the Excel file.');
        }
    }

};

export default ExcelFileController;
