import type { Request, Response } from "express";

import { loginSchema, signupSchema } from "./auth.validation.js";
import { getCurrentUser, loginUser, signupUser } from "./auth.service.js";

export async function signup(req: Request, res: Response) {
    try {
        const result = signupSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid signup data",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const { user, token } = await signupUser(result.data);

        res.cookie("mesh_access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 15 * 60 * 1000,
            path: "/",
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "USERNAME_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Username is already taken",
                });
            }

            if (error.message === "EMAIL_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Email is already registered",
                });
            }
        }

        console.error("Signup error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid login data",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const { user, token } = await loginUser(result.data);

        res.cookie("mesh_access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 15 * 60 * 1000,
            path: "/",
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "INVALID_CREDENTIALS") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
            }
        }

        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export function logout(_req: Request, res: Response) {
    res.clearCookie("mesh_access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
            process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
        path: "/",
    });

    return res.status(200).json({
        success: true,
        message: "Logout successful",
    });
}

export async function me(req: Request, res: Response) {
    try {
        const user = await getCurrentUser(req.userId);

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        console.error("Get current user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}