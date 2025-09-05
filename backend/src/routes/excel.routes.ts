import ExcelController from '#controllers/excel.controller.js';
import ExcelMiddleware from '#middlewares/excel.middleware.js';
import ValidationMiddleware from '#middlewares/validation.middleware.js';
import BaseRouter, { RouteConfig } from '#routes/router.js';
import fileSchema from '#validations/excel.schema.js';

class ExcelRouter extends BaseRouter {
    protected routes(): RouteConfig[] {
        return [
            {
                // add excel file
                handler: ExcelController.uploadExcelFile,
                method: 'post',
                middlewares: [
                    ExcelMiddleware.uploadExcelFile,
                    ValidationMiddleware.validateFile(fileSchema.excelFile)
                ],
                path: '/upload'
            },
            {
                // get all excel files
                handler: ExcelController.getAllExcelFiles,
                method: 'get',
                middlewares: [],
                path: '/all'
            },
            {
                // update excel file name
                handler: ExcelController.updateExcelFile,
                method: 'patch',
                middlewares: [
                    ValidationMiddleware.validateBody(fileSchema.updateExcelFileNameRequest)
                ],
                path: '/update-name/:id'
            }
        ];
    }
}

export default new ExcelRouter().router;
