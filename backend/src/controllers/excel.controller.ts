import excelServices from "#services/excel.services.js";
import ExcelParserUtils from '#utils/excelParser.utils.js';
import Send from '#utils/response.utils.js';
import fileSchema from '#validations/file.schema.js';
import { Request, Response } from 'express';
import { z } from 'zod';

const ExcelFileController = {
    getAllExcelFiles: async (req: Request, res: Response) => {
        try {
            // get all files
            const files = await excelServices.ExcelService.getAllExcelFiles();  
            return Send.success(res, { files }, "All files fetched successfully");
        } catch (error) {
            console.error('Error fetching Excel files:', error);
            return Send.error(res, null, 'Internal server error while fetching Excel files.');
        }  
    },

    updateFileName: async (req: Request, res: Response) => {
        try {
            // check filenames
            const { newFileName, oldFileName } = req.body as z.infer<typeof fileSchema.updateExcelFileNameRequest>;
            if (!oldFileName || typeof oldFileName !== 'string' || oldFileName.trim() === '') {
                return Send.badRequest(res, null, 'Invalid old file name provided.');
            }
            if (!newFileName || typeof newFileName !== 'string' || newFileName.trim() === '') {
                return Send.badRequest(res, null, 'Invalid new file name provided.');
            }

            // update filename
            await excelServices.ExcelService.updateFileName(oldFileName.trim(), newFileName.trim());
            
            return Send.success(res, null, 'File name updated successfully.');
        } catch (error) {
            console.error('Error updating file name:', error);
            return Send.error(res, null, 'Internal server error while updating file name.');
        }
    },

    uploadExcelFile: async (req: Request, res: Response) => {
        try {
            const file = req.file;
            
            // Check if file exists 
            if (!file) return Send.badRequest(res, null, 'No file uploaded');

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
