import type { Request, Response, NextFunction } from "express";

import { verifyAccessToken } from "../lib/auth/jwt.js";

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const token = req.cookies?.forge_access_token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    try {
        const { userId } = verifyAccessToken(token);

        req.userId = userId;

        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}