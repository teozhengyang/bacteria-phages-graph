import authConfig from "#configs/auth.config.js";
import authService from "#services/auth.services.js";
import Send from "#utils/response.utils.js";
import authSchema from "#validations/auth.schema.js";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { z } from "zod";

interface AuthRequest extends Request {
    cookies: Record<string, string>;
    userId?: number;
}

const AuthController = {

    login: async (req: AuthRequest, res: Response) => {
        const { email, password } = req.body as z.infer<typeof authSchema.login>;

        try {
            // find user
            const user = await authService.findUserByEmail(email);
            if (!user) return Send.badRequest(res, null, `No account found with email address "${email}". Please check your email or register for a new account.`);
            
            // check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) return Send.badRequest(res, null, "The password you entered is incorrect. Please try again or reset your password.");

            // get accessToken
            const accessToken = jwt.sign(
                { userId: user.id },
                authConfig.secret,
                { expiresIn: authConfig.secret_expires_in } as SignOptions
            );

            // get refresh token
            const refreshToken = jwt.sign(
                { userId: user.id },
                authConfig.refresh_secret,
                { expiresIn: authConfig.refresh_secret_expires_in } as SignOptions
            );

            // update refresh token in database
            await authService.updateRefreshToken(user.id, refreshToken);

            // set accessToken in cookie
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 15,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production"
            });

            // set refreshTOken in cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production"
            });

            // return messae
            return Send.success(res, {
                email: user.email,
                id: user.id,
                username: user.username
            }, "Logged in successfully");

        } catch (error) {
            // catch any error
            console.error("Login failed:", error);
            return Send.error(res, null, "Login failed");
        }
    },

    logout: async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.userId;

            if (userId) await authService.updateRefreshToken(userId, null);

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            return Send.success(res, null, "Logged out successfully");
        } catch (error) {
            console.error("Logout failed:", error);
            return Send.error(res, null, "Logout failed");
        }
    },

    refreshToken: async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.userId;
            const refreshToken = req.cookies.refreshToken;

            // Check if userId exists
            if (!userId) return Send.unauthorized(res, null, "User not authenticated");

            // find user
            const user = await authService.findUserById(userId);
            
            // check if user has a refresh token
            if (!user?.refreshToken)  return Send.unauthorized(res, null, "Refresh token not found");

            // check for valid refresh token
            if (user.refreshToken !== refreshToken) return Send.unauthorized(res, null, "Invalid refresh token");

            // create access token
            const accessToken = jwt.sign(
                { userId: user.id },
                authConfig.secret,
                { expiresIn: authConfig.secret_expires_in } as SignOptions
            );

            // set accessToken in cookie
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 15,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production"
            });

            return Send.success(res, { message: "Access token refreshed successfully" });

        } catch (error) {
            // catch any error
            console.error("Refresh Token failed:", error);
            return Send.error(res, null, "Failed to refresh token");
        }
    },

    register: async (req: AuthRequest, res: Response) => {
        const { email, password, username } = req.body as z.infer<typeof authSchema.register>;

        try {
            // find user if exists
            const existingUser = await authService.findUserByEmail(email);
            if (existingUser) return Send.badRequest(res, null, `An account with email "${email}" already exists. Please use a different email address or sign in to your existing account.`);

            // hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // create new user
            const newUser = await authService.createUser(email, hashedPassword, username);

            return Send.success(res, {
                email: newUser.email,
                id: newUser.id,
                username: newUser.username
            }, "User registered successfully");

        } catch (error) {
            // catch any error
            console.error("Registration failed:", error);
            return Send.error(res, null, "Registration failed");
        }
    }
};

export default AuthController;
