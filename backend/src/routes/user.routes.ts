import UserController from "#controllers/user.controller.js";
import AuthMiddleware from "#middlewares/auth.middleware.js";
import BaseRouter, { RouteConfig } from "#routes/router.js";

class UserRoutes extends BaseRouter {
    protected routes(): RouteConfig[] {
        return [
            {
                // get user info
                handler: UserController.getUser,
                method: "get",
                middlewares: [
                    AuthMiddleware.authenticateUser
                ],
                path: "/info" // api/user/info
            },
        ]
    }
}

export default new UserRoutes().router;