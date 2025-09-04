import FileMiddleware from '#middlewares/file.middleware.js';

// Excel file specific configuration
const excelFileOptions = {
    allowedExtensions: ['.xlsx', '.xls'],
    allowedMimeTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
    ],
    fieldName: 'excelFile',
};

// Create Excel-specific upload middleware
const uploadExcelFile = FileMiddleware.UploadFileMiddleware(excelFileOptions);

const ExcelFileMiddleware = {
    uploadExcelFile,
};

export default ExcelFileMiddleware;
