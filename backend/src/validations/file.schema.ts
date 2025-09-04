import { z } from 'zod';

const excelFile = z.object({
    buffer: z.instanceof(Buffer, { message: 'File buffer is required' }),
    encoding: z.string(),
    fieldname: z.string(),
    mimetype: z.string(),
    originalname: z.string().min(1, 'File name is required'),
    size: z.number().positive('File size must be positive'),
});

const fileSchema = {
    excelFile 
};

export default fileSchema;
