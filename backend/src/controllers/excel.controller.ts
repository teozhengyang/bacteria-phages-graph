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
                return Send.badRequest(res, null, 'File ID is required and must be a valid string. Received ID: ' + (id || 'undefined'));
            }

            // Check if ID is numeric
            if (!/^\d+$/.test(id.trim())) {
                return Send.badRequest(res, null, `File ID must be a numeric value. Received: "${id}"`);
            }

            // Delete the file
            await ExcelService.deleteFile(id);

            return Send.success(res, null, 'File deleted successfully.');
        } catch (error) {
            console.error('Error deleting file:', error);
            
            if (error instanceof Error) {
                // Check for common database errors
                if (error.message.includes('not found') || error.message.includes('does not exist')) {
                    return Send.notFound(res, null, `Excel file with ID "${req.params.id}" was not found.`);
                }
                if (error.message.includes('foreign key') || error.message.includes('constraint')) {
                    return Send.badRequest(res, null, 'Cannot delete file: it may be referenced by other data.');
                }
            }
            
            return Send.error(res, null, `Failed to delete Excel file with ID "${req.params.id}". Please try again later.`);
        }
    },

    getAllExcelFiles: async (req: Request, res: Response) => {
        try {
            // get all files
            const files = await ExcelService.getAllExcelFiles();
            
            if (files.length === 0) {
                return Send.success(res, { files: [] }, "No Excel files found in the database.");
            }
            
            return Send.success(res, { files }, `Successfully retrieved ${String(files.length)} Excel file(s).`);
        } catch (error) {
            console.error('Error fetching Excel files:', error);
            
            if (error instanceof Error) {
                // Check for database connection issues
                if (error.message.includes('connection') || error.message.includes('timeout')) {
                    return Send.error(res, null, 'Database connection failed. Please try again later.');
                }
            }
            
            return Send.error(res, null, 'Failed to retrieve Excel files from the database. Please contact support if this persists.');
        }  
    },

    updateExcelFile: async (req: Request, res: Response) => {
        try {
            // Get id from URL params and newFileName from body
            const id = req.params.id;
            const { newFileName } = req.body as z.infer<typeof excelSchema.updateExcelFileNameRequest>;
            
            if (!id || typeof id !== 'string' || id.trim() === '') {
                return Send.badRequest(res, null, 'File ID is required and must be a valid string. Received ID: ' + (id || 'undefined'));
            }
            
            // Check if ID is numeric
            if (!/^\d+$/.test(id.trim())) {
                return Send.badRequest(res, null, `File ID must be a numeric value. Received: "${id}"`);
            }
            
            if (!newFileName || typeof newFileName !== 'string' || newFileName.trim() === '') {
                return Send.badRequest(res, null, 'New file name is required and cannot be empty. Please provide a valid file name.');
            }
            
            // Check if filename has valid extension
            const validExtensions = ['.xlsx', '.xls'];
            const hasValidExtension = validExtensions.some(ext => 
                newFileName.toLowerCase().endsWith(ext)
            );
            
            if (!hasValidExtension) {
                return Send.badRequest(res, null, `File name must end with a valid Excel extension (${validExtensions.join(', ')}). Received: "${newFileName}"`);
            }

            // update filename
            await ExcelService.updateFileName(id, newFileName.trim());
            
            return Send.success(res, null, `File name updated successfully to "${newFileName.trim()}".`);
        } catch (error) {
            console.error('Error updating file name:', error);
            
            const { newFileName } = req.body as z.infer<typeof excelSchema.updateExcelFileNameRequest>;
            
            if (error instanceof Error) {
                // Check for common database errors
                if (error.message.includes('not found') || error.message.includes('does not exist')) {
                    return Send.notFound(res, null, `Excel file with ID "${req.params.id}" was not found.`);
                }
                if (error.message.includes('duplicate') || error.message.includes('unique')) {
                    return Send.badRequest(res, null, `A file with the name "${newFileName}" already exists. Please choose a different name.`);
                }
                if (error.message.includes('constraint')) {
                    return Send.badRequest(res, null, 'File name contains invalid characters or violates naming rules.');
                }
            }
            
            return Send.error(res, null, `Failed to update file name for file ID "${req.params.id}". Please try again later.`);
        }
    },

    uploadExcelFile: async (req: Request, res: Response) => {
        try {
            const file = req.file;
            
            // Check if file exists 
            if (!file) {
                return Send.badRequest(res, null, 'No file was uploaded. Please select an Excel file (.xlsx or .xls) to upload.');
            }

            // Additional file validation
            if (file.buffer.length === 0) {
                return Send.badRequest(res, null, 'Uploaded file is empty or corrupted. Please select a valid Excel file.');
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                return Send.badRequest(res, null, `File size (${String(Math.round(file.size / 1024 / 1024))}MB) exceeds the 10MB limit. Please upload a smaller file.`);
            }

            // Parse the Excel file
            const parsedData = ExcelParserUtils.parseExcelFile(file.buffer);

            // save to database
            await ExcelService.saveExcelData(parsedData, file.originalname);

            // Return success response with parsed data
            return Send.success(res, { 
                filename: file.originalname,
                recordsProcessed: Array.isArray(parsedData) ? parsedData.length : 0,
                size: file.size
            }, `Excel file "${file.originalname}" processed successfully.`);

        } catch (error) {
            console.error('Excel processing error:', error);
            
            const file = req.file;
            const fileName = file?.originalname ?? 'unknown file';
            
            // Handle different types of errors appropriately
            if (error instanceof Error) {
                // Specific Excel parsing errors
                if (error.message.includes('Excel file must have')) {
                    return Send.badRequest(res, null, `File format error: ${error.message}. Please ensure your Excel file has the required structure.`);
                }
                if (error.message.includes('No phage names found')) {
                    return Send.badRequest(res, null, 'No phage data found in the Excel file. Please ensure your file contains phage information in the expected format.');
                }
                if (error.message.includes('No bacteria data found')) {
                    return Send.badRequest(res, null, 'No bacteria data found in the Excel file. Please ensure your file contains bacteria information in the expected format.');
                }
                if (error.message.includes('validation failed')) {
                    return Send.badRequest(res, null, `Data validation error: ${error.message}. Please check your Excel file format and data.`);
                }
                
                // File format errors
                if (error.message.includes('Corrupt') || error.message.includes('corrupted')) {
                    return Send.badRequest(res, null, 'The uploaded file appears to be corrupted. Please try uploading the file again.');
                }
                if (error.message.includes('not a valid Excel file') || error.message.includes('ENOENT')) {
                    return Send.badRequest(res, null, 'Invalid file format. Please upload a valid Excel file (.xlsx or .xls).');
                }
                
                // Database errors
                if (error.message.includes('duplicate') || error.message.includes('already exists')) {
                    return Send.badRequest(res, null, `A file with the name "${fileName}" already exists. Please rename your file and try again.`);
                }
                if (error.message.includes('connection') || error.message.includes('timeout')) {
                    return Send.error(res, null, 'Database connection failed while saving the file. Please try again later.');
                }
                
                // Generic error with more context
                return Send.error(res, null, `Failed to process Excel file "${fileName}": ${error.message}`);
            }
            
            // For any other unexpected errors, return server error
            return Send.error(res, null, `An unexpected error occurred while processing the Excel file. Please try again later.`);
        }
    }
};

export default ExcelController;
