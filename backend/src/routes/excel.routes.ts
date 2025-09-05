import ExcelFileController from '#controllers/excel.controller.js';
import ExcelFileMiddleware from '#middlewares/excel.middleware.js';
import ValidationMiddleware from '#middlewares/validation.middleware.js';
import BaseRouter, { RouteConfig } from '#routes/router.js';
import fileSchema from '#validations/file.schema.js';

class ExcelRouter extends BaseRouter {
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
            },
            {
                // get all excel files
                handler: ExcelFileController.getAllExcelFiles,
                method: 'get',
                middlewares: [],
                path: '/all'
            },
            {
                // update excel file name
                handler: ExcelFileController.updateFileName,
                method: 'patch',
                middlewares: [
                    ValidationMiddleware.validateBody(fileSchema.updateExcelFileNameRequest)
                ],
                path: '/update-name'
            }
        ];
    }
}

export default new ExcelRouter().router;
