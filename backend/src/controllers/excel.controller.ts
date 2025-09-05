import ExcelService from "#services/excel.services.js";
import ExcelParserUtils from '#utils/excelParser.utils.js';
import Send from '#utils/response.utils.js';
import excelSchema from '#validations/excel.schema.js';
import { Request, Response } from 'express';
import { z } from 'zod';

const ExcelController = {

    deleteExcelFile: async (req: Request, res: Response) => {
        try {
            // Get id from URL params
            const id = req.params.id;

            if (!id || typeof id !== 'string' || id.trim() === '') {
                return Send.badRequest(res, null, 'Invalid file ID provided.');
            }

            // Delete the file
            await ExcelService.deleteFile(id);

            return Send.success(res, null, 'File deleted successfully.');
        } catch (error) {
            console.error('Error deleting file:', error);
            return Send.error(res, null, 'Internal server error while deleting file.');
        }
    },

    getAllExcelFiles: async (req: Request, res: Response) => {
        try {
            // get all files
            const files = await ExcelService.getAllExcelFiles();
            return Send.success(res, { files }, "All files fetched successfully");
        } catch (error) {
            console.error('Error fetching Excel files:', error);
            return Send.error(res, null, 'Internal server error while fetching Excel files.');
        }  
    },

    updateExcelFile: async (req: Request, res: Response) => {
        try {
            // Get id from URL params and newFileName from body
            const id = req.params.id;
            const { newFileName } = req.body as z.infer<typeof excelSchema.updateExcelFileNameRequest>;
            
            if (!id || typeof id !== 'string' || id.trim() === '') {
                return Send.badRequest(res, null, 'Invalid file ID provided.');
            }
            if (!newFileName || typeof newFileName !== 'string' || newFileName.trim() === '') {
                return Send.badRequest(res, null, 'Invalid new file name provided.');
            }

            // update filename
            await ExcelService.updateFileName(id, newFileName.trim());
            
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
            await ExcelService.saveExcelData(parsedData, file.originalname);

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

export default ExcelController;
