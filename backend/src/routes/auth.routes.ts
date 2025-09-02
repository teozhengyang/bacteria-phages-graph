import AuthController from "#controllers/auth.controller.js";
import AuthMiddleware from "#middlewares/auth.middleware.js";
import ValidationMiddleware from "#middlewares/validation.middleware.js";
import BaseRouter, { RouteConfig } from "#routes/router.js";
import authSchema from "#validations/auth.schema.js";

class AuthRouter extends BaseRouter {
    protected routes(): RouteConfig[] {
        return [
            {
                // login
                handler: AuthController.login,
                method: "post",
                middlewares: [
                    ValidationMiddleware.validateBody(authSchema.login)
                ],
                path: "/login"
            },
            {
                // register
                handler: AuthController.register,
                method: "post",
                middlewares: [
                    ValidationMiddleware.validateBody(authSchema.register)
                ],
                path: "/register"
            },
            {
                // logout
                handler: AuthController.logout,
                method: "post",
                middlewares: [
                    // check if user is logged in
                    AuthMiddleware.authenticateUser
                ],
                path: "/logout"
            },

            {
                handler: AuthController.refreshToken,
                // refresh token
                method: "post",
                middlewares: [
                    // checks if refresh token is valid
                    AuthMiddleware.refreshTokenValidation
                ],
                path: "/refresh-token"
            },
        ]
    }
}

export default new AuthRouter().router;