import userServices from "#services/user.services.js";
import Send from "#utils/response.utils.js";
import { Request, Response } from "express";

interface UserRequest extends Request {
    userId?: number;
}

const UserController = {
    getUser: async (req: UserRequest, res: Response) => {
        try {
            // get userID
            const userId = req.userId;
            if (!userId) return Send.unauthorized(res, null, "User ID missing");

            // get user
            const user = await userServices.UserService.getUserById(userId);
            if (!user) return Send.notFound(res, {}, "User not found");

            return Send.success(res, { user });
        } catch (error) {
            console.error("Error fetching user info", error);
            return Send.error(res, {}, "Internal Server Error");
        }
    }
};

export default UserController;
