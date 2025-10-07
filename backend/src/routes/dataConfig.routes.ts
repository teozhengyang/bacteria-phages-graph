import DataConfigController from "#controllers/dataconfig.controller.js";
import AuthMiddleware from "#middlewares/auth.middleware.js";
import ValidationMiddleware from '#middlewares/validation.middleware.js';
import BaseRouter, { RouteConfig } from '#routes/router.js';
import DataConfigSchema from "#validations/dataconfig.schema.js";

class DataConfigRouter extends BaseRouter {
    protected routes(): RouteConfig[] {
        return [
            {
                // create data config file
                handler: DataConfigController.createConfig,
                method: 'post',
                middlewares: [
                    AuthMiddleware.authenticateUser,
                    ValidationMiddleware.validateBody(DataConfigSchema.createConfig)
                ],
                path: "/create"
            },
            {
                // delete data config file
                handler: DataConfigController.deleteConfig,
                method: 'delete',
                middlewares: [AuthMiddleware.authenticateUser],
                path: "/delete/:id"
            },
            {
                // get all data config files for a user
                handler: DataConfigController.getAllConfigs,
                method: 'get',
                middlewares: [AuthMiddleware.authenticateUser],
                path: "/all"
            },
            {
                // get a single data config file by id
                handler: DataConfigController.getConfigById,
                method: 'get',
                middlewares: [AuthMiddleware.authenticateUser],
                path: "/:id"
            },
            {
                // update data config file
                handler: DataConfigController.updateConfig,
                method: 'put',
                middlewares: [
                    AuthMiddleware.authenticateUser,
                    ValidationMiddleware.validateBody(DataConfigSchema.updateConfig)
                ],
                path: "/:id"
            }
        ];
    }
}

export default new DataConfigRouter().router;