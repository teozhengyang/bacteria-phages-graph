import fileUploadConfig from '#configs/file.config.js';
import Send from '#utils/response.utils.js';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

interface FileUploadOptions {
    allowedExtensions: string[];
    allowedMimeTypes: string[];
    fieldName: string;
    maxFileSize?: number;
}

// General file middleware factory
const FileMiddleware = {
    // General file upload middleware factory
    UploadFileMiddleware: (options: FileUploadOptions) => {
        const { allowedExtensions, allowedMimeTypes, fieldName, maxFileSize } = options;
        
        // Configure storage
        const storage = multer.memoryStorage();
        
        // File filter
        const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            
            if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
                console.log('File accepted');
                cb(null, true);
            } else {
                const allowedTypesText = allowedExtensions.join(', ');
                console.log('File rejected');
                cb(new Error(`Only ${allowedTypesText} files are allowed!`));
            }
        };
        
        // Configure multer
        const upload = multer({
            fileFilter,
            limits: {
                fileSize: maxFileSize ?? fileUploadConfig.maxFileSize,
            },
            storage,
        });
        
        // Return middleware function
        return (req: Request, res: Response, next: NextFunction) => {
            const uploadSingle = upload.single(fieldName);
            
            uploadSingle(req, res, (err) => {
                // Handle errors 
                if (err) {
                    if (err instanceof multer.MulterError) {
                        console.log('Multer error code:', err.code);
                        if (err.code === 'LIMIT_FILE_SIZE') {
                            const sizeMB = Math.round((maxFileSize ?? fileUploadConfig.maxFileSize) / (1024 * 1024));
                            return Send.badRequest(res, null, `File size too large. Maximum allowed size is ${sizeMB.toString()}MB.`);
                        }
                    }
                    
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    console.log('Returning error:', errorMessage);
                    return Send.badRequest(res, null, errorMessage);
                }

                // Check if file was uploaded
                if (!req.file) {
                    console.log('No file found, returning error');
                    return Send.badRequest(res, null, 'No file uploaded. Please select a file.');
                }
                
                console.log('File upload successful');
                next();
            });
        };
    }
};

export default FileMiddleware;