import ExcelFileController from '#controllers/excel.controller.js';
import ExcelFileMiddleware from '#middlewares/excel.middleware.js';
import ValidationMiddleware from '#middlewares/validation.middleware.js';
import BaseRouter, { RouteConfig } from '#routes/router.js';
import fileSchema from '#validations/file.schema.js';

class ExcelFileRouter extends BaseRouter {
    protected routes(): RouteConfig[] {
        return [
            {
                // add excel file
                handler: ExcelFileController.uploadExcelFile,
                method: 'post',
                middlewares: [
                    ExcelFileMiddleware.uploadExcelFile,
                    ValidationMiddleware.validateFile(fileSchema.excelFile)
                ],
                path: '/upload'
            }
        ];
    }
}

export default new ExcelFileRouter().router;
