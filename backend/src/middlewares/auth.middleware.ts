import authConfig from "#configs/auth.config.js";
import Send from "#utils/response.utils.js";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface DecodedToken {
    userId: number;
}

// Extend Request to include userId
interface AuthRequest extends Request {
    cookies: Record<string, string>;
    userId?: number;
}

const AuthMiddleware = {
    authenticateUser: (req: AuthRequest, res: Response, next: NextFunction) => {

        // check for access token
        const token = req.cookies.accessToken;
        if (!token) return Send.unauthorized(res, null);

        try {
            // verify access token
            const decodedToken = jwt.verify(token, authConfig.secret) as DecodedToken;

            req.userId = decodedToken.userId;
            next();
        } catch (error) {
            console.error("Authentication failed:", error);
            return Send.unauthorized(res, null);
        }
    },

    refreshTokenValidation: (req: AuthRequest, res: Response, next: NextFunction) => {
        // check for refresh token
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return Send.unauthorized(res, null, "No refresh token provided");

        try {
            // verify refresh token
            const decodedToken = jwt.verify(refreshToken, authConfig.refresh_secret) as DecodedToken;

            req.userId = decodedToken.userId;
            next();
        } catch (error) {
            console.error("Refresh Token authentication failed:", error);
            return Send.unauthorized(res, null, "Invalid or expired refresh token");
        }
    }
};

export default AuthMiddleware;
